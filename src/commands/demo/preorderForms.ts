import PartnerApi from '~/partnerApi'
import loadConfig from '~/config'

const FORM_ID = 'registration_form_1'
const REGISTRATION_FORM = {
  title: 'Registration form',
  type: 'object',
  required: ['firstName'],
  properties: {
    lastName: {
      type: 'string',
      title: 'Last name'
    },
    firstName: {
      type: 'string',
      title: 'First name'
    },
    age: {
      type: 'integer',
      title: 'Age'
    }
  }
}
const ADD_FORM_BODY = {
  formSchema: REGISTRATION_FORM,
  uiSchema: {}
}

function demo(api: PartnerApi) {
  return api
    .putPreorderForm(FORM_ID, ADD_FORM_BODY)
    .then(() => {
      return api.getPreorderForm(FORM_ID)
    })
    .then(form => {
      console.log(form.body)
      return api.deletePreorderForm(FORM_ID)
    })
    .then(() => {
      return api.getPreorderForms()
    })
    .then(forms => {
      console.log(forms.body)
    })
}

function main(argv: any) {
  const config = loadConfig(argv)
  const api = new PartnerApi(config.partnerId, config.keyInfo, {
    baseUrl: config.serverBase,
    verbose: argv.verbose
  })
  return demo(api)
}

exports.command = 'forms'
exports.describe = 'Creates and then deletes a preorder form'
exports.handler = function(argv: Record<string, any>) {
  return Promise.resolve()
    .then(function() {
      return main(argv)
    })
    .catch(function(err) {
      console.error('Oops:\n', err)
    })
}
