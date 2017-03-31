'use strict'

const Debug = require('debug')('elevators:controller')
const Emitter = require('./emitter')
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

    // Subscribe to events
    this.subscribe()

    // Register elevators
    if (parseInt(config.elevators) <= 0) {
      throw Error(Constants.ERROR_INVALID_NUMBER_OF_ELEVATORS)
    }
    for (let i = 0; i < config.elevators; i++) {
      if ((config.repair || []).indexOf(i) !== -1) { continue }
      this.register(new Elevator(i, config))
    }
  }

  /**
   * Subscribe to events emitted by elevators
   */
  subscribe () {
    // Elevator is loading / off-loading
    Emitter.on(Constants.HANDLING, data => {
      Debug('HANDLING:', data)
    })
  }

  register (elevator) {
    this.elevators.push(elevator)
  }

  pickup (floor, direction) {
    return this.request(floor, direction)
  }

  dropoff (floor, elevatorIdx) {
    return this.request(floor, undefined, elevatorIdx)
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
    let response

    // Request made from inside the elevator (It's a Drop Off request)
    if (typeof elevatorIdx !== 'undefined') {
      elevator = this.elevators[elevatorIdx]
      ETA = elevator.getMaxETA(floor, direction)
      Debug(`REQ Dropoff @ ${floor} [E ${elevatorIdx}] | ${ETA.direction}`)
      Debug('---------------------------------')
      Debug(`ETA [E ${elevatorIdx}]:`, `${ETA.time} | ${ETA.direction} (${ETA.floor})`)
    } else {
      Debug(`REQ Pickup @ ${floor} [${direction}]`)
      Debug('---------------------------------')
      // Find the "Nearest Car" (NC) for Pickup
      // based on the principles defined in the Readme
      let minETA
      for (let i = 0; i < this.elevators.length; i++) {
        elevator = this.elevators[i]
        ETA = elevator.getMaxETA(floor, direction)
        Debug(`ETA [E ${i}]:`, `${ETA.time} | ${ETA.direction}`)
        if (i === 0) {
          minETA = ETA.time
          elevatorIdx = elevator.getId()
        } else if (ETA.time < minETA) {
          minETA = ETA.time
          elevatorIdx = elevator.getId()
        }
      }
      elevator = this.elevators[elevatorIdx]
    }
    Debug('---------------------------------')
    Debug(`Assign: E ${elevatorIdx}`)
    Debug('---------------------------------')

    response = elevator.request(floor, direction)

    // @NOTE ETA is in number of moves (not in TIME! TBD)
    return {
      elevator: {
        id: elevatorIdx,
        floor: ETA.floor,
        direction: ETA.direction
      },
      request: {
        stopAt: floor,
        direction
      },
      response
    }
  }

  reporter (payload) {
    // Debug(payload)
    Debug(`>> STATS`, `[E ${payload.id}] @ ${payload.floor} [${payload.direction}] \r\n ======================================================================`)
  }

  getStatus (elevatorIdx) {
    let status
    if (elevatorIdx) {
      if (this.elevators[elevatorIdx]) {
        status = this.elevators[elevatorIdx].getStatus()
      } else {
        throw Error(Constants.ERROR_ELEVATOR_NOT_REGISTERED)
      }
    } else {
      status = {}
      this.elevators.map((elevator, i) => {
        status[elevator.getId()] = elevator.getStatus()
      })
    }

    return status
  }
}

module.exports = Controller
