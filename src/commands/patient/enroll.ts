import _ from 'lodash'
import PartnerApi from '~/partnerApi'
import loadConfig from '~/config'

import {EnrollPatientBody} from '~/partnerApi'

function getEnrollBody(config: Record<string, any>, argv: any): EnrollPatientBody {
  const {deployment, id: patientId, type: patientIdType} = argv
  return {
    deployment: deployment || _.get(config, 'test.deployment'),
    patientId: patientId || _.get(config, 'test.patient.id'),
    patientIdType:
      patientIdType || _.get(config, 'test.patient.type') || 'enterprise'
  }
}

function main(argv) {
  const config = loadConfig(argv)
  const api = new PartnerApi(config.partnerId, config.keyInfo, {
    baseUrl: config.serverBase,
    verbose: argv.verbose
  })
  return api.enrollPatient(getEnrollBody(config, argv)).then(response => {
    console.log(response.body.xpdat)
  })
}

exports.command = 'enroll'
exports.describe = 'Enrolls patient with Xealth (returns xpdat)'
exports.builder = {
  id: {
    alias: 'i',
    describe: 'Patient id (overrides default from config)'
  },
  type: {
    alias: 't',
    default: 'external',
    choices: ['external', 'enterprise'],
    describe: 'Patient id type (overrides default from config)'
  }
}
exports.handler = function(argv: Record<string, any>) {
  return Promise.resolve()
    .then(function() {
      return main(argv)
    })
    .catch(function(err) {
      console.error('Oops:\n', err)
    })
}
