/** @flow */
import PartnerApi from '~/partnerApi'
import loadConfig from '~/config'

/**
 * Demonstrates:
 *
 *  1) setting up your partner endpoint with default profile (dev only)
 *  2) using endpoint test api to trigger test call to your endpoint
 *
 */

function registerEndpointAndProfile(config, api) {
  let endpoint = config.endpoints.registerPatient
  if (endpoint === null || endpoint === undefined) {
    console.log('Skipping patient register endpoint step (no endpoint in config)')
    return Promise.resolve()
  }

  const profile = {
    // Name is arbitrary
    profileId: 'partner_profile',
    // Attributes that identify what data you need (what you want sent in the POST to your endpoint)
    attributes: ['demographicsV1']
  }

  return api.setPatientRegisterEndpointCreateProfile(profile, endpoint)
}

function demo(config, api) {
  return registerEndpointAndProfile(config, api).then(function() {
    // Test data to send to Xealth
    let requestBody = {
      // deployment and patient id must be set correctly for test to work
      deployment: config.test.deployment,
      patientId: config.test.patient.id,
      patientIdType: config.test.patient.type || 'external',
      // the following are just passed through (arbitrary)
      programId: 'myprogramid',
      orderId: 'someorderid'
    }
    return api.triggerTestEvent(requestBody).then(function(response) {
      // Your endpoint should have been called by the time this function is called
      return response
    }).then(function(resp) {
      console.log(JSON.stringify(resp, null, 2))
    })
  })
}

function main(argv) {
  let config = loadConfig(argv)
  const api = new PartnerApi(config.partnerId, config.keyInfo, {baseUrl: config.serverBase, verbose: argv.verbose})
  return demo(config, api)
}

exports.command = 'register'
exports.describe = 'Patient registration endpoint example'
exports.handler = function(argv: Object) {
  return Promise.resolve().then(function() {
    return main(argv)
  }).catch(function(err) {
    console.error('Oops:\n', err)
  })
}
