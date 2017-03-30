'use strict'

const Debug = require('debug')('elevators:controller')
const Elevator = require('./elevator')
const Constants = require('./constants')

/**
 * Allocate lifts to serve requests and
 * provide status report regard of the current floor and
 * direction it's moving towards.
 */
class Controller {
  constructor (config) {
    this.config = config
    this.requests = new Map()
    this.elevators = []

    /*
    Map
    {
      10th floor => {
        up:
      }
    }
    */
    this.floors = []

    if (parseInt(config.elevators) <= 0) {
      throw Error(Constants.ERROR_INVALID_NUMBER_OF_ELEVATORS)
    }
    for (let i = 0; i < config.elevators; i++) {
      this.register(new Elevator(i, this.reporter, config))
    }
  }

  register (elevator) {
    this.elevators.push(elevator)
  }

  /**
   * Find the nearest elevator
   */
  request (floor) {
    let ETA
    let minETA
    let elevator
    let elevatorIdx
    for (let i = 0; i < this.config.elevators; i++) {
      elevator = this.elevators[i]
      ETA = elevator.getETA(floor)

      if (i === 0) {
        minETA = ETA
        elevatorIdx = i
      } else if (ETA < minETA) {
        minETA = ETA
        elevatorIdx = i
      }
    }

    // @NOTE ETA is in number of moves (not in TIME! TBD)
    return {
      ETA,
      elevatorIdx
    }
  }

  assign (requestId, car) {
    // if (origin < destination) {
    //   this.queueUp.push(origin)
    //   this.queueUp.push(destination)
    //   this.queueUp.sort((a, b) => (a - b))
    // } else {
    //   this.queueDown.push(origin)
    //   this.queueDown.push(destination)
    //   this.queueDown.sort((a, b) => (b - a))
    // }
  }

  reporter (payload) {
    Debug(payload)
  }

  getStatus (elevatorIdx) {
    if (elevatorIdx) {
      if (this.elevators[elevatorIdx]) {
        return this.elevators[elevatorIdx].getStatus()
      } else {
        throw Error(Constants.ERROR_ELEVATOR_NOT_REGISTERED)
      }
    } else {
      const status = {}
      this.elevators.map((elevator, i) => {
        status[i] = elevator.getStatus()
      })
      return status
    }
  }
}

module.exports = Controller
