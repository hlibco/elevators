'use strict'

const Debug = require('debug')('elevators:demo')

// Elevator Control System
const ECS = require('../src/index')
const Config = require('./config')

const UP = ECS.constants.UP
const DOWN = ECS.constants.UP

// Create a controller instance
const controller = new ECS(Config)

// Add the controller to the web server
ECS.server(controller)

/**
 * Some requests to quickly check
 * the state machine
 */
controller.pickup(10, UP)
controller.dropoff(12, 0)

controller.pickup(8, UP)
controller.dropoff(15, 0)

controller.pickup(20, DOWN)
controller.pickup(17, DOWN)

Debug('---------------------------------')
Debug('Current allocation')
Debug('---------------------------------')
Debug(controller.getStatus())
