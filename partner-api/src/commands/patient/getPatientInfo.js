/** @flow */
import _ from 'lodash'
import moment from 'moment'
import PartnerApi from '~/partnerApi'
import loadConfig from '~/config'
import chalk from 'chalk'

function getPatientInfoBody(config, argv) {
  return {
    xpdat: argv.xpdat
  }
}

function main(argv) {
  const config = loadConfig(argv)
  const api = new PartnerApi(config.partnerId, config.keyInfo, { baseUrl: config.serverBase, verbose: argv.verbose })
  if (!argv.profile) {
    console.log(chalk.blue('Missing profile argument (listing available profiles)'))
    return api.listProfiles().then(res => {
      let list = res.body.profiles.map(item => {
        return `${item.profileId} [${item.attributes.join(', ')}]`
      })
      console.log(chalk.blue(list.join('\n')))
    })
  }

  return api.getPatientInfo(argv.profile, getPatientInfoBody(config, argv)).then(response => {
    console.log(response.body)
  })
}


exports.command = 'get-info <xpdat>'
exports.describe = 'Gets patient info using given xpdat (obtained from call to register patient endpoint)'
exports.builder = {
  profile: {
    alias: 'p',
    describe: 'profile name'
  }
}
exports.handler = function (argv: Object) {
  return Promise.resolve().then(function () {
    return main(argv)
  }).catch(function (err) {
    console.error('Oops:\n', err)
  })
}
