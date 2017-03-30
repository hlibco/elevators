'use strict'

const Debug = require('debug')('elevators:index')
const Config = require('./config')
const Constants = require('./constants')
const Controller = require('./controller')

const controller = new Controller(Config)

controller.pickup(10, Constants.UP)
controller.dropoff(12, 0)

controller.pickup(8, Constants.UP)
controller.dropoff(15, 0)

controller.pickup(20, Constants.DOWN)
controller.pickup(17, Constants.DOWN)

Debug(controller.getStatus())
