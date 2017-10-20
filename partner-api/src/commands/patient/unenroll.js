/** @flow */
import _ from 'lodash'
import PartnerApi from '~/partnerApi'
import loadConfig from '~/config'

function main(argv) {
  const config = loadConfig(argv)
  const api = new PartnerApi(config.partnerId, config.keyInfo, {baseUrl: config.serverBase, verbose: argv.verbose})
  return api.unEnrollPatient(argv.xpdat)
}

exports.command = 'unenroll <xpdat>'
exports.describe = 'Unrolls patient with Xealth'
exports.handler = function(argv: Object) {
  return Promise.resolve().then(function() {
    return main(argv)
  }).catch(function(err) {
    console.error('Oops:\n', err)
  })
}
