'use strict'

const Debug = require('debug')('elevators:index')
const Config = require('./config')
const Constants = require('./constants')
const Controller = require('./controller')

const controller = new Controller(Config)

controller.elevators = [
  {
    dir: Constants.DOWN,
    floor: 19,
    travels: [
      [ // up
        [2, 5], // pickups
        [4, 7]  // dropoffs
      ],
      [ // down
        [5, 3],
        [2, 1]
      ]
    ]
  }
]
controller.request(10, 1)
controller.request(3, 7)
controller.request(4, 1)

Debug(controller.getStatus())
