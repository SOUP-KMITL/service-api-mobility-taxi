'use strict';

var requset = require('request')
var mongojs = require('mongojs')
var db = mongojs('mongodb://localhost:27017/SmartMobility', ['taxiRawData','taxiData'])
var db_place = mongojs('mongodb://localhost:27017/SocialData', ['place2'])

exports.getTaxiByLocation = function(args, res, next) {
  /**
   * Returns taxi 500 m around the location
   *
   * name String The name of the place (optional)
   * no response value expected for this operation
   **/
  let place = args.name.value
  const getPlace = () => {
    return new Promise((resolve, reject) => {
      db_place.place2.find({ 'name_id': place }, { '_id': -1, 'geolocation': 1 }).toArray(function (err, doc) {
        resolve(doc[0].geolocation)
      })
    })
  }

  const getData = () => {
    return new Promise((resolve, reject) => {
      db.taxiData.find().sort({ '_id': -1 }).limit(1).toArray(function (err, doc) {
        resolve(doc[0])
      })
    })
  }

  getPlace().then((geolocation) => {
    let coord = geolocation.split(',')
    let location_lat = parseFloat(coord[0])
    let location_long = parseFloat(coord[1])
    let new_taxi_json = {}
    getData().then((data) => {
      let new_taxi_array = []
      let taxi_json_array = data.data
      try {
        for (var i in taxi_json_array) {
          if (taxi_json_array[i].gps != null) {
            if (taxi_json_array[i].gps.recv_ts >= time_now.toISOString()) {
              //service_status == 1 maybe has passenger
              if (taxi_json_array[i].service.passenger == null) {
                let taxi_long = taxi_json_array[i].gps.loc.coordinates[0]
                let taxi_lat = taxi_json_array[i].gps.loc.coordinates[1]
                if (Math.abs(location_lat - taxi_lat) <= 0.05 && Math.abs(location_long - taxi_long) <= 0.05) {
                  delete taxi_json_array[i].service
                  new_taxi_array.push(taxi_json_array[i])
                }
              }              
            }
          }
        }
      }
      catch (e) {
        console.log(e)
        console.log('Error at id ' + taxi_json_array[i].id)
      }
      new_taxi_json.current_gps = new_taxi_array
      res.send(new_taxi_json)
      res.end();
    })
  })
}

exports.getTaxiCurrentGps = function(args, res, next) {
  /**
   * Returns current gps of taxis
   *
   * no response value expected for this operation
   **/
  let time_now = new Date()

  const getData = () => {
    return new Promise((resolve, reject) => {
      db.taxiData.find().sort({'_id':-1}).limit(1).toArray(function (err, doc) {
        resolve(doc[0])
      })
    })
  }
  let new_taxi_json = {}
  getData().then((data) => {
    let new_taxi_array = []
    let taxi_json_array = data.data
    try {
      for (var i in taxi_json_array) {
        if (taxi_json_array[i].gps != null) {
          if (taxi_json_array[i].gps.recv_ts >= time_now.toISOString()) {
            //service_status == 1 maybe has passenger
            if (taxi_json_array[i].service.passenger != null) {
              taxi_json_array[i].has_passenger = true
            }
            else {
              taxi_json_array[i].service.has_passenger = false
            }
            delete taxi_json_array[i].service
            new_taxi_array.push(taxi_json_array[i])
          }
        }
      }
    }
    catch (e) {
      console.log(e)
      console.log('Error at id ' + taxi_json_array[i].id)
    }
    new_taxi_json.current_gps = new_taxi_array

    res.send(new_taxi_json)
    res.end();
  })
}

