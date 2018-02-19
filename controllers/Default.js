'use strict';

var url = require('url');

var Default = require('./DefaultService');

module.exports.getTaxiByLocation = function getTaxiByLocation (req, res, next) {
  Default.getTaxiByLocation(req.swagger.params, res, next);
};

module.exports.getTaxiCurrentGps = function getTaxiCurrentGps (req, res, next) {
  Default.getTaxiCurrentGps(req.swagger.params, res, next);
};
