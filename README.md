# Elevators

[![Build Status](https://travis-ci.org/hlibco/elevators.svg?branch=master)](https://travis-ci.org/hlibco/elevators) [![Coverage Status](https://coveralls.io/repos/github/hlibco/elevators/badge.svg)](https://coveralls.io/github/hlibco/elevators) [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![node](https://img.shields.io/node/v/elevators.svg)]()
---

## Context

### About the elevator system

How to dispatch a Pickup / Drop off request?
- Pickups are requested by users on the floor they are located at, only mentioning the direction they want to move towards
- Drop offs are requested by users when they are inside the elevator

This implementation allocates elevators to serve each request in a building in the following manner:

- An elevator first serves requests in the same direction it's going to and putting on hold requests for the opposite direction.

### (TODO)
- Serving the requests according to the SLA (service level agreement) that sets the maximum waiting time from the request and the pick up.
- The SLA is the same for all requests regardless of origin and destination.

---

## Constraints

- The capacity of each elevator is immutable and the same for all elevators **(Infinity for now)**.
- Each request is considered **only** 1 user going from origin to destination.
- The user DOES NOT provide the final destination at the time of the pickup request.
- All elevators move at the same speed.
- The acceleration and breaking times are not considered (it means, elevators start moving and stop instantaneously).
- The stop times (time to open/close doors and people get on/off) are the same for all elevators on every floor.
- This implementation is not optimized for peak hours (9am / 11am - 1pm / 5pm).
- Requests do not follow any kind of distribution but are totally random over the day and floors (hypothetically).
- All floors have a numeric identifier, where 0 is the ground, positive integers up to the top and negative integers up to the lowest level.

---

## Definitions

- The origin of the request is the floor the user requesting a lift is located at (pickup request).
- The destination is the floor the user inside the elevator wants to go to.

---

## Installation

`yarn` or `npm install`

---

## Settings

Edit the file `config.js` with information about the building and each elevator in the grid.

(TODO)
- Speed of each elevator
- Floors served per elevator
- SLA per floor where the request is made (maximum amount of time someone may wait until the elevator arrives)

---

## Start

`npm start`

---

## Unit test

`npm t` will execute all tests in the `/tests/**/*` and execute the **lint**.

## Coverage test

`npm run coverage` will run the coverage test, display the result in the console and publish it to **Coveralls.io**


---

## API

### .getState(elevator)
Querying the state of the elevators (what floor are they on and where they are going)

`elevator` is optional. If not defined, it returns the state of all elevators (current floor / next floor).

---

## TODO

- Unregister elevators `controller.js` (eg: for maintenance)
