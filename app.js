'use strict'

const reekoh = require('reekoh')
const _plugin = new reekoh.plugins.Service()

const _get = require('lodash.get')
const _isNaN = require('lodash.isnan')
const inRange = require('lodash.inrange')
const isNumber = require('lodash.isnumber')
const isString = require('lodash.isstring')

let googleMapsClient = null
let geocodingType = null

_plugin.on('data', (data) => {
  if (geocodingType === 'Forward') {
    if (!isString(data.address)) return _plugin.logException(new Error('Invalid address.'))

    let geocodeParams = {
      address: data.address,
      language: 'en'
    }

    googleMapsClient.geocode(geocodeParams, (error, results) => {
      if (error) {
        _plugin.logException(error)
      } else if (results.status === 'ZERO_RESULTS') {
        _plugin.pipe(data, null)
      } else if (results.status !== 'OK') {
        _plugin.logException(new Error(results.errorMessage))
      } else {
        let result = {
          lat: _get(results, 'results[0].geometry.location.lat'),
          lng: _get(results, 'results[0].geometry.location.lng')
        }

        _plugin.pipe(data, JSON.stringify(result))
          .then(() => {
            _plugin.log(JSON.stringify({
              title: 'Google Geocoding Service Result',
              input: data.address,
              result: result
            }))
          })
          .catch((error) => {
            _plugin.logException(error)
          })
      }
    })
  } else {
    if (_isNaN(data.lat) || !isNumber(data.lat) || !inRange(data.lat, -90, 90) ||
      _isNaN(data.lng) || !isNumber(data.lng) || !inRange(data.lng, -180, 180)) {
      _plugin.logException(new Error('Latitude (lat) and Longitude (lng) are not valid. lat: ' + data.lat + ' lng:' + data.lng))
    } else {
      let reverseGeocodeParams = {
        latlng: data.lat + ',' + data.lng,
        language: 'en',
        locationType: 'APPROXIMATE'
      }

      googleMapsClient.reverseGeocode(reverseGeocodeParams, (error, results) => {
        if (error) {
          _plugin.logException(error)
        } else if (results.status === 'ZERO_RESULTS') {
          _plugin.pipe(data, null)
        } else if (results.status !== 'OK') {
          _plugin.logException(new Error(results.errorMessage))
        } else {
          _plugin.pipe(data, JSON.stringify({
            address: _get(results, 'results[0].formatted_address')
          }))
            .then(() => {
              _plugin.log(JSON.stringify({
                title: 'Google Geocoding Service Result',
                data: {
                  lat: data.lat,
                  lng: data.lng
                },
                result: _get(results, 'results[0].formatted_address')
              }))
            })
            .catch((error) => {
              _plugin.logException(error)
            })
        }
      })
    }
  }
})

/**
 * Emitted when the platform bootstraps the plugin. The plugin should listen once and execute its init process.
 */
_plugin.once('ready', () => {
  const GoogleMaps = require('googlemaps')

  let googleMapsClientConfig = {
    staggerTime: 1000, // for elevationPath
    encodePolylines: false,
    secure: true // use https
  }

  if (_plugin.clientId) {
    googleMapsClientConfig.googleClientId = _plugin.config.clientId
    googleMapsClientConfig.googlePrivateKey = _plugin.config.key
  } else {
    googleMapsClientConfig.key = _plugin.config.key
  }

  geocodingType = _plugin.config.geocodingType || _plugin.config.geocodingType.default

  googleMapsClient = new GoogleMaps(googleMapsClientConfig)

  _plugin.log('Google Geocoding Service Initialized.')
  _plugin.emit('init')
})

module.exports = _plugin
