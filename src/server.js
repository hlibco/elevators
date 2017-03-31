'use strict'

const Debug = require('debug')('elevators:server')
const Express = require('express')
const BodyParser = require('body-parser')

const router = Express.Router()
const express = Express()
const version = '/v1'

const port = process.env.PORT || 8080

let ECS
module.exports = (instance) => {
  ECS = instance
}

/**
 * Setup web server
 */
express.set('port', port)

/**
 * Setup middlewares
 */
express.use(BodyParser.urlencoded({ extended: true }))
express.use(BodyParser.json())
express.use('/', router)

/**
 * Exposing the API
 */
const routes = {
  'status': version + '/status/:elevatorId?',
  'pickup': version + '/pickup/:floor/:direction',
  'dropoff': version + '/dropoff/:floor/:elevatorId'
}

router.get('/', (req, res) => {
  res.json(routes)
})

router.get(routes.pickup, (req, res) => {
  res.json(ECS.pickup(parseInt(req.params.floor), req.params.direction.toUpperCase()))
})

router.get(routes.dropoff, (req, res) => {
  res.json(ECS.dropoff(parseInt(req.params.floor), parseInt(req.params.elevatorId)))
})

router.get(routes.status, (req, res) => {
  res.json(ECS.getStatus(req.params.elevatorId))
})

/**
 * Start the server
 */
express.listen(port, () => {
  Debug(`Server is running on port ${port} | http://localhost:${port}`)
})
