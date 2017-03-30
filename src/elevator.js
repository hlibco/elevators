'use strict'

const Constants = require('./constants')

class Elevator {
  constructor (id, emmit, config) {
    this.id = id

    /*
    Current floor the elevator is located at
    */
    this.floor = config.minFloor // all elevators will start the service on the lowest floor
    this.emmit = emmit
    this.direction = null // UP, DOWN

    this.queueUp = [] // floors to stop when the elevator is going up
    this.queueDown = [] // floors to stop when the elevator is going down

    /*
    Used to calculate the occupancy
    */
    // @TODO Map requests Up/Down made inside/outside the elevator
    // in order to distingquish Pickups and Dropoffs
    // this.occupancy = 0
  }

  getETA (floor, requestedDirection) {
    let moves = 0

    // Elevator is moving UP
    if (this.direction === Constants.UP) {
      // Request to go UP
      if (requestedDirection === Constants.UP) {
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
    } else if (this.direction === Constants.DOWN) {
      // Request to go DOWN
      if (requestedDirection === Constants.DOWN) {
        if (floor < this.floor) {
          moves = this.floor - floor
        } else {
          // 1. reaches the min floor in the queueDown
          let lowerFloorDown = this.queueDown[this.queueDown.length - 1]
          moves += this.floor - lowerFloorDown
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
        // 2. reaches the requested floor
        moves += Math.abs(lowerFloorDown - floor)
      }
    // If the elevator is idle
    } else {
      moves = Math.abs(this.floor - floor)
    }

    return moves
  }

  trace (requestId, travelIdx, moves) {
    this.tracing[requestId].moves += moves
    this.tracing[requestId].travelIdx = travelIdx

    return this.tracing[requestId]
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
    if (direction === Constants.UP) {
      this.AddQueueUp(floor)
    } else if (direction === Constants.UP) {
      this.AddQueueDown(floor)

    // Direction is not set means it is a dropoff request
    } else {
      if (this.direction === Constants.UP) {
        // On the way
        if (this.floor < floor) {
          this.AddQueueUp(floor)
        } else {
          this.AddQueueDown(floor)
        }
      } else if (this.direction === Constants.DOWN) {
        // On the way
        if (this.floor > floor) {
          this.AddQueueDown(floor)
        } else {
          this.AddQueueUp(floor)
        }
      }
    }

    this.setDirection()
  }

  stop (floor) {
    // Set current floor
    this.currentFloor = floor

    // Remove floor from the queue
    if (this.direction === Constants.UP) {
      this.queueUp.shift()
    } else if (this.direction === Constants.DOWN) {
      this.queueDown.pop()
    }

    this.setDirection()
  }

  setDirection () {
    let direction = null

    if (this.queueUp.length > 0 && this.direction !== Constants.DOWN) {
      direction = Constants.UP
    } else if (this.queueDown.length > 0 && this.direction !== Constants.UP) {
      direction = Constants.DOWN
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
      direction: this.direction,
      currentFloor: this.currentFloor
    })
  }
}

module.exports = Elevator
