import _ from 'lodash'
import Sender from '~/sender'
import loadConfig from '~/config'

// Set in main()
let config

function send(sender, body, endpointName, method = 'PUT') {
  let endpoint
  if (config.endpoints.monitor) {
    endpoint = config.endpoints.monitor[endpointName]
  }
  if (!endpoint) {
    console.log(`Skipping (no endpoint for '${endpointName}' in config)`)
    return Promise.resolve()
  }
  return sender.sendRequest(endpoint, method, body).catch(() =>
    /* err */
    {
      // Swallow error to keep going...
    }
  )
}

function getCommonBody() {
  return {
    deployment: _.get(config, 'test.deployment'),
    patientId: _.get(config, 'test.patient.id'),
    patientIdType: _.get(config, 'test.patient.type') || 'enterprise',
    providerId: _.get(config, 'test.provider.id') || 'P123456789',
    providerIdType: _.get(config, 'test.provider.type') || 'epic_user'
  }
}

/**
 * Simulates Xealth calling your endpoint
 */
function getPrograms(sender) {
  return send(sender, getCommonBody(), 'getPrograms')
}

/**
 * Simulates Xealth calling your endpoint
 */
function getProgramUrl(sender) {
  const body = Object.assign({}, getCommonBody(), {
    programId: '1'
  })
  return send(sender, body, 'getProgramUrl')
}

function main(argv) {
  config = loadConfig(argv)
  const sender = new Sender(config.keyInfo, argv)
  return getPrograms(sender).then(function() {
    return getProgramUrl(sender)
  })
}

exports.command = 'monitor'
exports.describe = 'Send test requests to monitor view endpoints'
exports.handler = function(argv: Record<string, any>) {
  return Promise.resolve()
    .then(function() {
      return main(argv)
    })
    .catch(function(err) {
      console.error('Oops:\n', err)
    })
}
