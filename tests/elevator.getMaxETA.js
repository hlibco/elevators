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

  // 3 -> 10 = 7

  const res = elevator.getMaxETA(10, Constants.UP)

  t.is(res.time, 7 * Config.speed)
})

test(`ETA - elevator is going UP, user is going UP (not on the way)`, t => {
  const elevator = new Elevator(0, null, Config)
  elevator.floor = 3
  elevator.direction = Constants.UP
  const requestedFloor = 2
  const res = elevator.getMaxETA(requestedFloor, Constants.UP)

  let moves = 0
  moves += Math.abs(elevator.floor - Config.maxFloor)
  moves += Math.abs(Config.maxFloor - Config.minFloor)
  moves += Math.abs(Config.minFloor - requestedFloor)
  t.is(res.time, moves * Config.speed)
})

test(`ETA - elevator is going UP, user is going DOWN (on the way)`, t => {
  const elevator = new Elevator(0, null, Config)
  elevator.floor = 3
  elevator.direction = Constants.UP
  const requestedFloor = 5
  const res = elevator.getMaxETA(requestedFloor, Constants.DOWN)

  let moves = 0
  moves += Math.abs(elevator.floor - Config.maxFloor)
  moves += Math.abs(Config.maxFloor - requestedFloor)

  t.is(res.time, moves * Config.speed)
})

test(`ETA - elevator is going UP, user is going DOWN (not on the way)`, t => {
  const elevator = new Elevator(0, null, Config)
  elevator.floor = 3
  elevator.direction = Constants.UP
  const requestedFloor = 2
  const res = elevator.getMaxETA(requestedFloor, Constants.DOWN)

  let moves = 0
  moves += Math.abs(elevator.floor - Config.maxFloor)
  moves += Math.abs(Config.maxFloor - requestedFloor)

  t.is(res.time, moves * Config.speed)
})

// ELEVATOR DOWN
// =======================
test(`ETA - elevator is going DOWN, user is going DOWN (on the way)`, t => {
  const elevator = new Elevator(0, null, Config)
  elevator.floor = 30
  elevator.direction = Constants.DOWN

  // 30 -> 4 = 26

  const res = elevator.getMaxETA(4, Constants.DOWN)

  t.is(res.time, 26 * Config.speed)
})

test(`ETA - elevator is going DOWN, user is going DOWN (not on the way)`, t => {
  const elevator = new Elevator(0, null, Config)
  elevator.floor = 15
  elevator.direction = Constants.DOWN
  const requestedFloor = 17
  const res = elevator.getMaxETA(17, Constants.DOWN)

  let moves = 0
  moves += Math.abs(elevator.floor - Config.minFloor)
  moves += Math.abs(Config.maxFloor - Config.minFloor)
  moves += Math.abs(Config.maxFloor - requestedFloor)

  t.is(res.time, moves * Config.speed)
})
