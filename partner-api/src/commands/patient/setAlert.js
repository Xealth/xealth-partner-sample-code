/** @flow */
import _ from 'lodash'
import moment from 'moment'
import PartnerApi from '~/partnerApi'
import loadConfig from '~/config'

function main(argv) {
  const config = loadConfig(argv)
  const api = new PartnerApi(config.partnerId, config.keyInfo, {baseUrl: config.serverBase, verbose: argv.verbose})
  let expiration
  if (argv.seconds) {
    expiration = moment().add(argv.seconds, 'seconds')
  }
  return api.setAlert(argv.xpdat, argv.programId, expiration)
}

exports.command = 'alert <xpdat>'
exports.describe = 'Sets alert for patient program'
exports.builder = {
  seconds: {
    alias: 's',
    default: '300',
    describe: 'Expiration from now (in seconds). Pass 0 to remove alert.'
  },
  programId: {
    alias: 'p',
    describe: 'Program id associated with xpdat'
  }
}
exports.handler = function(argv: Object) {
  return Promise.resolve().then(function() {
    return main(argv)
  }).catch(function(err) {
    console.error('Oops:\n', err)
  })
}
