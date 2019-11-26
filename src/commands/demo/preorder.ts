import PartnerApi from '~/partnerApi'
import loadConfig from '~/config'

function registerEndpointAndProfile(config, api) {
  const endpoint = config.endpoints.preorder
  if (endpoint === null || endpoint === undefined) {
    console.log('Skipping preorder endpoint step (no endpoint in config)')
    return Promise.resolve()
  }

  const profile = {
    // Name is arbitrary
    profileId: 'partner_profile',
    // Attributes that identify what data you need (what you want sent in the POST to your endpoint)
    attributes: ['demographicsV1']
  }

  return api.setPreordeEndpointCreateProfile(profile, endpoint)
}

function demo(config, api) {
  return registerEndpointAndProfile(config, api)
    .then(() => {
      return api.getPreorderEndpoint()
    })
    .then(res => {
      console.log(res.body.preorder)
      return api.deletePreorderEndpoint()
    })
    .then(() => {
      return api.deleteProfile('partner_profile')
    })
}

function main(argv) {
  const config = loadConfig(argv)
  const api = new PartnerApi(config.partnerId, config.keyInfo, {
    baseUrl: config.serverBase,
    verbose: argv.verbose
  })
  return demo(config, api)
}

exports.command = 'preorder'
exports.describe = 'Preorder endpoint example'
exports.handler = function(argv: Record<string, any>) {
  return Promise.resolve()
    .then(function() {
      return main(argv)
    })
    .catch(function(err) {
      console.error('Oops:\n', err)
    })
}
