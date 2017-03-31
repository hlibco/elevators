# Elevators

[![Build Status](https://travis-ci.org/hlibco/elevators.svg?branch=master)](https://travis-ci.org/hlibco/elevators) [![Coverage Status](https://coveralls.io/repos/github/hlibco/elevators/badge.svg)](https://coveralls.io/github/hlibco/elevators) [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![node](https://img.shields.io/node/v/elevators.svg)]()
---

## Context

This project implements an elevator system where users indicate the direction of their destination at the time of the request. The direction of the destination is relative to the floor they are located at. While inside the lift cabin, it's possible to choose the destination floor to be dropped off.

---

## Installation

`yarn` or `npm install`

---

## Settings

Edit the file `config.js` with information about the building and each elevator in the grid.

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

All requests to the API are HTTP Requests handled by an Express Server and return a JSON object. The attribute `port` (3002) is defined in the file `nodemon.json`.


#### Endpoints

URL Parameters:
- `floor`: integer *(required)*
- `direction`: enum (up | down) *(required)*
- `elevatorIdx`: integer (starts on 0)

Request a pickup (request comes from the outside of the cabin)
[GET] http://localhost:3002/v1/pickup/:floor/:direction

Request a drop off (request comes from the inside of the cabin)
[GET] http://localhost:3002/v1/dropoff/:floor/:elevatorIdx

Query the state of all elevators
[GET] http://localhost:3002/v1/status/

Query the state of one specific elevator
[GET] http://localhost:3002/v1/status/:elevatorIdx

---

## Design

Each elevator has its own queues to store the floors the elevator has to stop. Two queues are used per elevator.
1. Queue of floors with users who want to go UP
2. Queue of floors with users who want to go DOWN

There is a controller responsible to scan the elevators (query them) in order to find the one with the smallest most predictable ETA.

The elevator reports its status to the controller when:
- After receiving a pickup / drop off request
- On each stop

---

### About the elevator system

**Estimated Time of Arrival (ETA)**

For the sake of simplicity, the number of stops already provisioned between the floor the elevator is currently traversing and the floor the user is located at is not being taken into consideration.

I implemented 2 ways to calculate the ETA but deprecated one of them:

**In use:**

Pessimist - It considers that more requests will come in order to fill up all queues used in the travel itinerary.
Example:
User: Floor 2 wants to go UP
Elevator: Floor 5 going UP
Building: 12 floors

The max number of stops will be:
5 -> 12 [queue up] = 7
12 -> 0 [queue down] = 12
0 -> 2 [queue up] = 2
Total = 21 stops


**Deprecated:**

Optimistic - It considers the current path the lift will take IF there is no other requests that extend the current and future travels which may impact the ETA.


How to dispatch a Pickup / Drop off request?
- Pickups are requested by users on the floor they are located at, only mentioning the direction they want to move towards
- Drop offs are requested by users when they are inside the elevator

This implementation allocates elevators to serve each request in a building in the following manner:
- An elevator first serves requests in the same direction it's going to (if the requested floor is ahead) and putting on hold requests for the opposite direction.

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

## TODO

- Unregister elevators `controller.js` (eg: for maintenance)

(settings)
- Speed of each elevator
- Floors served per elevator
- SLA per floor where the request is made (maximum amount of time someone may wait until the elevator arrives)
