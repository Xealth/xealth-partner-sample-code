/** @flow */
import PartnerApi from '~/partnerApi'
import loadConfig from '~/config'

function demo(api: PartnerApi) {
  return api.registerProfile('myProfile', {
    attributes: ['demographics', 'medications']
  }).then(() => {
    return api.listProfiles()
  }).then(() => {
    return api.deleteProfile('myProfile')
  }).then(() => {
    return api.listProfiles()
  });
}

function main(argv: Object) {
  const config = loadConfig(argv)
  const api = new PartnerApi(config.partnerId, config.keyInfo, {baseUrl: config.serverBase, verbose: argv.verbose})
  return demo(api)
}

exports.command = 'profile'
exports.describe = 'Creates and then deletes a profile'
exports.handler = function(argv: Object) {
  return Promise.resolve().then(function() {
    return main(argv)
  }).catch(function(err) {
    console.error('Oops:\n', err)
  });
}
