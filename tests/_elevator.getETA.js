import test from 'ava'
const Elevator = require('../src/elevator')
const Constants = require('../src/constants')
const Config = require('../demo/config')


/**
 * @DEPRECATED - Removed from the implementation <elevator.js>
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

// ELEVATOR UP
// =======================
test(`ETA - elevator is going UP, user is going UP (on the way)`, t => {
  const elevator = new Elevator(0, Config)
  elevator.floor = 3
  elevator.direction = Constants.UP

  elevator.queueUp = [5, 6, 7, 8]
  elevator.queueDown = [10]

  // 3 -> 10 = 7

  const res = elevator.getETA(10, Constants.UP)

  t.is(res, 7)
})

test(`ETA - elevator is going UP, user is going UP (not on the way)`, t => {
  const elevator = new Elevator(0, Config)
  elevator.floor = 3
  elevator.direction = Constants.UP

  elevator.queueUp = [8]
  elevator.queueDown = []

  // 3 -> 8 = 5
  // 8 -> 2 = 6

  const res = elevator.getETA(2, Constants.UP)

  t.is(res, 11)
})

test(`ETA - elevator is going UP, user is going DOWN (on the way)`, t => {
  const elevator = new Elevator(0, Config)
  elevator.floor = 3
  elevator.direction = Constants.UP

  elevator.queueUp = [8]
  elevator.queueDown = [12]

  // 3 -> 8 = 5
  // 8 -> 12 = 4
  // 12 -> 5 = 7

  const res = elevator.getETA(5, Constants.DOWN)

  t.is(res, 16)
})

test(`ETA - elevator is going UP, user is going DOWN (not on the way)`, t => {
  const elevator = new Elevator(0, Config)
  elevator.floor = 3
  elevator.direction = Constants.UP

  elevator.queueUp = [8]
  elevator.queueDown = [12]

  // 3 -> 8 = 5
  // 8 -> 12 = 4
  // 12 -> 2 = 10

  const res = elevator.getETA(2, Constants.DOWN)

  t.is(res, 19)
})

// ELEVATOR DOWN
// =======================
test(`ETA - elevator is going DOWN, user is going DOWN (on the way)`, t => {
  const elevator = new Elevator(0, Config)
  elevator.floor = 30
  elevator.direction = Constants.DOWN

  elevator.queueUp = [5, 6, 7, 8]
  elevator.queueDown = [10]

  // 30 -> 10 = 20
  // 10 -> 4 = 6

  const res = elevator.getETA(4, Constants.DOWN)

  t.is(res, 26)
})

test(`ETA - elevator is going DOWN, user is going DOWN (not on the way)`, t => {
  const elevator = new Elevator(0, Config)
  elevator.floor = 15
  elevator.direction = Constants.DOWN

  elevator.queueUp = [8]
  elevator.queueDown = [10]

  // 15 -> 10 = 5
  // 10 -> 8 = 2
  // 8 -> 17 = 9

  const res = elevator.getETA(17, Constants.DOWN)

  t.is(res, 16)
})
