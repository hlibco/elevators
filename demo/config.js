const config = {
  // Building settings
  minFloor: 0, // ground floor
  maxFloor: 40, // pent house \o/
  elevators: 3, // # of elevators

  // Elevators settings
  speed: 1, // speed of the elevators (# of floors / unit of time)
  repair: [1] // Elevators under maintenance

  // @NOTE can be tweaked to use "maxLoad"
  // @TODO Implement later
  // maxPassengers: 10 // max passengers per car
}

module.exports = config
