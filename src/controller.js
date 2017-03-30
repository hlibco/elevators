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
   * Pickup / Drop off request
   * @param {integer} floor where the elevator has to stop
   * @param {integer} elevatorIdx only used on drop off requests
   * @return {Object} {ETA: integer (number of moves), elevatorIdx: integer}
   */
  request (floor, direction, elevatorIdx) {
    let ETA
    let elevator
    let result

    // Request made from inside the elevator (It's a Drop Off request)
    if (typeof elevatorIdx !== 'undefined') {
      elevator = this.elevators[elevatorIdx]
      ETA = elevator.getETA(floor)
      Debug(`REQ [E ${elevatorIdx}] Dropoff @ ${floor}`)
      Debug('---------------------------------')
      Debug(`ETA [E ${elevatorIdx}]:`, ETA)
    } else {
      Debug(`REQ Pickup @ ${floor} [${direction}]`)
      Debug('---------------------------------')
      // Find the Nearest Car (NC) for Pickup
      let minETA
      for (let i = 0; i < this.config.elevators; i++) {
        elevator = this.elevators[i]
        ETA = elevator.getETA(floor)
        Debug(`ETA [E ${i}]:`, ETA)
        if (i === 0) {
          minETA = ETA
          elevatorIdx = i
        } else if (ETA < minETA) {
          minETA = ETA
          elevatorIdx = i
        }
      }
      elevator = this.elevators[elevatorIdx]
    }
    Debug('---------------------------------')
    Debug(`Assign: E ${elevatorIdx}`)
    Debug('---------------------------------')

    result = elevator.request(floor, direction)

    // @NOTE ETA is in number of moves (not in TIME! TBD)
    return {
      ETA,
      result,
      elevatorIdx
    }
  }

  pickup (floor, direction) {
    return this.request(floor, direction)
  }

  dropoff (floor, elevatorIdx) {
    return this.request(floor, undefined, elevatorIdx)
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
      return JSON.stringify(status)
    }
  }
}

module.exports = Controller
