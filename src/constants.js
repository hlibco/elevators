module.exports.UP = 'UP'
module.exports.DOWN = 'DOWN'

// Elevator state
module.exports.IDLE = 'IDLE' // not in use
module.exports.HANDLING = 'HANDLING' // loading | offloading
module.exports.TRAVELLING = 'TRAVELLING' // between floors

// Request type
module.exports.PICKUP = 'PICKUP'
module.exports.DROPOFF = 'DROPOFF'

// Events
module.exports.EV_STATUS = 'EV_STATUS'

module.exports.EV_STOP = 'EV_STOP'
module.exports.EV_HANDLING = 'EV_HANDLING'
module.exports.EV_TRAVELLING = 'EV_TRAVELLING'

module.exports.EV_GOING_UP = 'EV_GOING_UP'
module.exports.EV_GOING_DOWN = 'EV_GOING_DOWN'

// Errors
module.exports.ERROR_IMPOSSIBLE_ROUTE = 'ERROR_IMPOSSIBLE_ROUTE'
module.exports.ERROR_ELEVATOR_NOT_REGISTERED = 'ERROR_ELEVATOR_NOT_REGISTERED'
module.exports.ERROR_INVALID_NUMBER_OF_ELEVATORS = 'ERROR_INVALID_NUMBER_OF_ELEVATORS'
