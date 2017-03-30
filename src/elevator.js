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
    this.direction = Constants.IDLE // IDLE, UP, DOWN

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
    } else if (this.direction === Constants.IDLE) {
      moves = this.floor - floor
    }

    return moves
  }

  trace (requestId, travelIdx, moves) {
    this.tracing[requestId].moves += moves
    this.tracing[requestId].travelIdx = travelIdx

    return this.tracing[requestId]
  }

  request (origin, destination) {
    switch (this.direction) {
      case Constants.UP:
        // user wants to go up
        if (origin < destination) {
          this.queue.push(origin)
          this.queue.push(destination)
          this.queue.sort((a, b) => (a - b))
        } else {
          this.queue.push(origin)
          this.queue.push(destination)
        }
        break
      case Constants.DOWN:
        // user wants to go down
        if (origin > destination) {
          this.queue.push(origin)
          this.queue.push(destination)
          this.queue.sort((a, b) => (b - a))
        } else {
          this.queue.push(origin)
          this.queue.push(destination)
        }
        break
      default:
        this.queue.push(origin)
        this.queue.push(destination)
    }

    this.setDirection()
    return this
  }

  updateStops (origin, destination) {
    if (!this.stops.get(origin)) {
      this.stops.set(origin, {
        pickup: true
      })
    }
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

    return this
  }

  setDirection () {
    let direction = Constants.IDLE

    if (this.queueUp.length > 0 && this.direction !== Constants.DOWN) {
      direction = Constants.UP
    } else if (this.queueDown.length > 0 && this.direction !== Constants.UP) {
      direction = Constants.DOWN
    }

    this.direction = direction
  }

  getStatus () {
    return {
      queue: this.queue,
      direction: this.direction,
      currentFloor: this.currentFloor
    }
  }

  report () {
    this.reporter({
      id: this.id,
      queue: this.queue,
      direction: this.direction,
      occupancy: this.occupancy,
      currentFloor: this.currentFloor
    })

    return this
  }
}

module.exports = Elevator
