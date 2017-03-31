'use strict'

// const Debug = require('debug')('elevators:elevator')
const Constants = require('./constants')
const Emitter = require('./emitter')

const DOWN = Constants.DOWN
const UP = Constants.UP

class Elevator {
  constructor (id, config) {
    this.id = id
    this.state =
    this.config = config

    /*
    Floor where the elevator is currently located
    */
    this.floor = config.minFloor // all elevators will start the service on the lowest floor
    this.direction = null // UP, DOWN, null

    this.queueUp = [] // floors to stop when the elevator is going up
    this.queueDown = [] // floors to stop when the elevator is going down

    /*
    Used to calculate the occupancy
    */
    // @TODO Map requests Up/Down made inside/outside the elevator
    // in order to distingquish Pickups and Dropoffs
    // this.occupancy = 0
  }

  getId () {
    return this.id
  }

  /**
   * Calculate the maximum ETA in terms of moves
   * based on the following case:
   * The elevator goes until the end of the track
   * before changing direction.
   * This is helpful to allocate idle lifts instead of
   * relying on the current number of movements other
   * cars need to serve the request.
   * @param {integer} floor where the elevator will stop
   * @param {enum} requestedDirection (UP | DOWN | undefined) undefined = drop off requests
   * @return {object} {time: {number}, floor: {integer}, direction: enum (UP | DOWN | null)}
   */
  getMaxETA (floor, requestedDirection) {
    let moves = 0

    // Elevator is moving UP
    if (this.direction === UP) {
      if (!requestedDirection) {
        requestedDirection = floor > this.floor ? UP : DOWN
      }

      // Request to go UP
      if (requestedDirection === UP) {
        if (floor > this.floor) {
          moves = Math.abs(floor - this.floor)
        } else {
          moves = 2 * (this.config.maxFloor - this.config.minFloor) - Math.abs(this.floor - floor)
        }
      // Request to go DOWN
      } else {
        // 1. reaches the highest floor in the building
        moves += Math.abs(this.config.maxFloor - this.floor)
        // 2. reaches the requested floor
        moves += Math.abs(this.config.maxFloor - floor)
      }
    // Elevator is moving DOWN
    } else if (this.direction === DOWN) {
      if (!requestedDirection) {
        requestedDirection = floor < this.floor ? DOWN : UP
      }

      // Request to go DOWN
      if (requestedDirection === DOWN) {
        if (floor < this.floor) {
          moves = Math.abs(this.floor - floor)
        } else {
          moves = 2 * (this.config.maxFloor - this.config.minFloor) - Math.abs(this.floor - floor)
        }
      // Request to go UP
      } else {
        // 1. reaches the lowest floor in the building
        moves += Math.abs(this.floor - this.config.minFloor)
        // 2. reaches the requested floor
        moves += Math.abs(this.config.minFloor - floor)
      }
    // If the elevator is idle
    } else {
      moves = Math.abs(this.floor - floor)
    }

    return {
      time: moves * this.config.speed,
      floor: this.floor,
      direction: this.direction // current direction
    }
  }

  /**
   * Add floor to the queue of users going up
   * @param {integer} floor where the elevator will stop
   */
  AddQueueUp (floor) {
    this.queueUp.push(floor)
    this.queueUp.sort((a, b) => (a - b))
  }

  /**
   * Add floor to the queue of users going down
   * @param {integer} floor where the elevator will stop
   */
  AddQueueDown (floor) {
    this.queueDown.push(floor)
    this.queueDown.sort((a, b) => (b - a))
  }

  /**
   * Request a lift to the specified floor
   * @param {integer} floor where the elevator will stop
   * @param {enum} direction (UP | DOWN | undefined)
   */
  request (floor, direction) {
    // Direction set means Pickup request
    if (direction === UP) {
      this.AddQueueUp(floor)
    } else if (direction === UP) {
      this.AddQueueDown(floor)

    // Undefined direction means it is a dropoff request
    } else {
      if (this.direction === UP) {
        // Destination is ahead
        if (this.floor < floor) {
          this.AddQueueUp(floor)
        } else {
          this.AddQueueDown(floor)
        }
      } else if (this.direction === DOWN) {
        // Destination is ahead
        if (this.floor > floor) {
          this.AddQueueDown(floor)
        } else {
          this.AddQueueUp(floor)
        }
      }
    }

    this.setDirection()
    this.report()
    return true
  }

  /**
   * Set the floor where the elevator is
   * and update the current queue in progress
   * @param {integer} floor where the elevator will stop
   */
  stop (floor) {
    // Set current floor
    this.currentFloor = floor

    // Remove floor from the queue
    if (this.direction === UP) {
      this.queueUp.shift()
    } else if (this.direction === DOWN) {
      this.queueDown.pop()
    }

    this.setDirection()
    this.report()
  }

  /**
   * Set the direction based on the current direction
   * and the current queue in progress
   */
  setDirection () {
    let direction = null

    if (this.queueUp.length > 0 && this.direction !== DOWN) {
      direction = UP
    } else if (this.queueDown.length > 0 && this.direction !== UP) {
      direction = DOWN
    }

    this.direction = direction
  }

  /**
   * Return the status report
   */
  getStatus () {
    return {
      id: this.id,
      floor: this.floor,
      direction: this.direction,
      queues: {
        up: this.queueUp,
        down: this.queueDown
      }
    }
  }

  /**
   * Emit a status report to subscribers, like the Controller
   */
  report () {
    Emitter.emit(Constants.EV_STATUS, this.getStatus())
  }
}

module.exports = Elevator
