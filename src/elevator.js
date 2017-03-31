'use strict'

// const Debug = require('debug')('elevators:elevator')
const Constants = require('./constants')
const Emitter = require('./emitter')

const DOWN = Constants.DOWN
const UP = Constants.UP

class Elevator {
  constructor (id, reporter, config) {
    this.id = id
    this.state =
    this.config = config
    this.reporter = reporter

    /*
    Current floor the elevator is located at
    */
    this.floor = config.minFloor // all elevators will start the service on the lowest floor
    this.direction = null // UP, DOWN

    this.queueUp = [] // floors to stop when the elevator is going up
    this.queueDown = [] // floors to stop when the elevator is going down

    /*
    Used to calculate the occupancy
    */
    // @TODO Map requests Up/Down made inside/outside the elevator
    // in order to distingquish Pickups and Dropoffs
    // this.occupancy = 0

    Emitter.emit(Constants.HANDLING, {
      id: this.id,
      floor: this.floor,
      direction: this.direction
    })
  }

  getId () {
    return this.id
  }

  /**
   * Calculate the maximum ETA in terms of moves
   * based on the worse case:
   * The elevator goes until the end of the track
   * before changing direction.
   * This is helpful to allocate idle lifts instead of
   * relying on the number of movements queued by their peers.
   * @param {integer} floor where the elevator has to stop
   * @param {enum} requestedDirection (UP | DOWN)
   */
  getMaxETA (floor, requestedDirection) {
    let moves = 0
    if (!requestedDirection) {
      requestedDirection = floor > this.floor ? UP : DOWN
    }

    // Elevator is moving UP
    if (this.direction === UP) {
      // Request to go UP
      if (requestedDirection === UP) {
        if (floor > this.floor) {
          moves = Math.abs(floor - this.floor)
        } else {
          // 1. reaches the highest floor in the building
          moves += Math.abs(this.floor - this.config.maxFloor)
          // 2. reaches the lowest floor in the building
          moves += Math.abs(this.config.maxFloor - this.config.minFloor)
          // 3. reaches the requested floor
          moves += Math.abs(this.config.minFloor - floor)
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
      // Request to go DOWN
      if (requestedDirection === DOWN) {
        if (floor < this.floor) {
          moves = Math.abs(this.floor - floor)
        } else {
          // 1. reaches the lowest floor in the building
          moves += Math.abs(this.floor - this.config.minFloor)
          // 2. reaches the highest floor in the building
          moves += Math.abs(this.config.minFloor - this.config.maxFloor)
          // 3. reaches the requested floor
          moves += Math.abs(this.config.maxFloor - floor)
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
   * @DEPRECATED
   * Creates the ETA based on a positve scenario:
   * No requests will be received extending
   * the travel in the current direction in order to impact
   * future travels in the opposite direction
   */
  getETA (floor, requestedDirection) {
    let moves = 0

    // Elevator is moving UP
    if (this.direction === UP) {
      // Request to go UP
      if (requestedDirection === UP) {
        if (floor > this.floor) {
          moves = floor - this.floor
        } else {
          // 1. reaches the max floor in the queueUp
          let higherFloorUp = this.queueUp[this.queueUp.length - 1]
          moves += Math.abs(this.floor - higherFloorUp)
          // 2. reaches the min floor in the queueDown
          let lowerFloorDown = this.queueDown[this.queueDown.length - 1] || higherFloorUp
          moves += Math.abs(higherFloorUp - lowerFloorDown)
          // 3. reaches the requested floor
          moves += Math.abs(lowerFloorDown - floor)
        }
      // Request to go DOWN
      } else {
        // 1. reaches the max floor in the queueUp
        let higherFloorUp = this.queueUp[this.queueUp.length - 1]
        moves += Math.abs(this.floor - higherFloorUp)
        // 2. reaches the max floor in the queueDown
        let higherFloorDown = this.queueDown[0] || higherFloorUp
        moves += Math.abs(higherFloorUp - higherFloorDown)
        // 3. reaches the requested floor
        moves += Math.abs(higherFloorDown - floor)
      }
    // Elevator is moving DOWN
    } else if (this.direction === DOWN) {
      // Request to go DOWN
      if (requestedDirection === DOWN) {
        if (floor < this.floor) {
          moves = this.floor - floor
        } else {
          // 1. reaches the min floor in the queueDown
          let lowerFloorDown = this.queueDown[this.queueDown.length - 1]
          moves += Math.abs(this.floor - lowerFloorDown)
          // 2. reaches the max floor in the queueUp
          let higherFloorUp = this.queueUp[this.queueUp.length - 1] || lowerFloorDown
          moves += Math.abs(lowerFloorDown - higherFloorUp)
          // 3. reaches the requested floor
          moves += Math.abs(higherFloorUp - floor)
        }
      // Request to go UP
      } else {
        // 1. reaches the min floor in the queueDown
        let lowerFloorDown = this.queueDown[this.queueDown.length - 1]
        moves += Math.abs(this.floor - lowerFloorDown)
        // 2. reaches the min floor in the queueUp
        let higherFloorUp = this.queueUp[this.queueUp.length - 1] || lowerFloorDown
        moves += Math.abs(higherFloorUp - lowerFloorDown)
        // 3. reaches the requested floor
        moves += Math.abs(lowerFloorDown - floor)
      }
    // If the elevator is idle
    } else {
      moves = Math.abs(this.floor - floor)
    }

    return moves * this.config.speed
  }

  AddQueueUp (floor) {
    this.queueUp.push(floor)
    this.queueUp.sort((a, b) => (a - b))
  }

  AddQueueDown (floor) {
    this.queueDown.push(floor)
    this.queueDown.sort((a, b) => (b - a))
  }

  request (floor, direction) {
    // Direction set means Pickup request
    if (direction === UP) {
      this.AddQueueUp(floor)
    } else if (direction === UP) {
      this.AddQueueDown(floor)

    // Direction is not set means it is a dropoff request
    } else {
      if (this.direction === UP) {
        // On the way
        if (this.floor < floor) {
          this.AddQueueUp(floor)
        } else {
          this.AddQueueDown(floor)
        }
      } else if (this.direction === DOWN) {
        // On the way
        if (this.floor > floor) {
          this.AddQueueDown(floor)
        } else {
          this.AddQueueUp(floor)
        }
      }
    }

    this.setDirection()
    this.report()
  }

  /**
   * Set the
   * and the current queue in progress
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

  getStatus () {
    return {
      queues: {
        up: this.queueUp,
        down: this.queueDown
      },
      floor: this.floor,
      direction: this.direction
    }
  }

  report () {
    this.reporter({
      id: this.id,
      queues: {
        up: this.queueUp,
        down: this.queueDown
      },
      floor: this.floor,
      direction: this.direction
    })
  }

  handler (req, res) {
    const data = {
      status: 'OK'
    }
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.write(data)
    res.end()
  }
}

module.exports = Elevator
