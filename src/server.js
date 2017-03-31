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
 * Setup webserver
 */
express.set('port', port)

/**
 * Setup middlewares
 */
express.use(BodyParser.urlencoded({ extended: true }))
express.use(BodyParser.json())

/**
 * Exposing the API
 */
express.use('/', router)

router.get(version + '/pickup/:floor/:direction', (req, res) => {
  res.json(ECS.pickup(req.params.floor, req.params.direction.toUpperCase()))
})

router.get(version + '/dropoff/:floor/:elevatorIdx', (req, res) => {
  res.json(ECS.dropoff(req.params.floor, req.params.elevatorIdx))
})

router.get(version + '/status/:elevatorIdx?', (req, res) => {
  res.json(ECS.getStatus(req.params.elevatorIdx))
})

/**
 * Start the server
 */
express.listen(port, () => {
  Debug(`Server is running on port ${port}`)
})
