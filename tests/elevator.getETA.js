import test from 'ava'
const Elevator = require('../src/elevator')
const Constants = require('../src/constants')
const Config = require('../demo/config')

// ELEVATOR UP
// =======================
test(`ETA - elevator is going UP, user is going UP (on the way)`, t => {
  const elevator = new Elevator(0, null, Config)
  elevator.floor = 3
  elevator.direction = Constants.UP

  elevator.queueUp = [5, 6, 7, 8]
  elevator.queueDown = [10]

  // 3 -> 10 = 7

  const res = elevator.getETA(10, Constants.UP)

  t.is(res, 7)
})

test(`ETA - elevator is going UP, user is going UP (not on the way)`, t => {
  const elevator = new Elevator(0, null, Config)
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
  const elevator = new Elevator(0, null, Config)
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
  const elevator = new Elevator(0, null, Config)
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
  const elevator = new Elevator(0, null, Config)
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
  const elevator = new Elevator(0, null, Config)
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
