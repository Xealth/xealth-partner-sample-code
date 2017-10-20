/** @flow */
import Sender from './sender'

import type moment from 'moment'
import type {KeyInfo, Opts as SenderOpts} from './sender'

type Filters = Object
type Profile = Object

export type ProviderMessage = 'alert'|'ehrMessage'|'contextual'
export type EnrollPatientBody = {
  deployment: string,
  patientId: string,
  patientIdType: string
}

export type RegisterProfileBody = {
  attributes: Array<string>,
  startDate?: string,
  endDate?: string
}

/**
 * Wrapper for Xealth Partner API
 */
export default class PartnerApi {
  partnerId: string
  sendRequest: typeof Sender.prototype.sendRequest
  constructor(partnerId: string, keyInfo: KeyInfo, opts: SenderOpts = {}) {
    this.partnerId = partnerId
    let sender = new Sender(keyInfo, opts)
    this.sendRequest = sender.sendRequest.bind(sender)
  }

  sendProviderMessage(messageType: ProviderMessage, xpdat: string, params: Object) {
    const endpoint = `/partner/${this.partnerId}/provider/message`
    let body = Object.assign({}, {xpdat, messageType}, params)
    return this.sendRequest(endpoint, 'post', body)
  }

  /**
   * programId not needed if xpdat contains order
   */
  setAlert(xpdat: string, programId: ?string, expiration: ?moment) {
    return this.sendProviderMessage('alert', xpdat, {
      programId,
      expiration: expiration ? expiration.utc().toISOString() : null
    })
  }

  sendEhrMessage(xpdat: string, subject: string, body: string, expiration: moment) {
    return this.sendProviderMessage('ehrMessage', xpdat, {
      subject,
      body,
      expiration: expiration.utc().toISOString()
    })
  }

  putContent(body: Object) {
    const endpoint = `/partner/${this.partnerId}/content`
    return this.sendRequest(endpoint, 'put', body)
  }

  deleteContent(body: Object) {
    const endpoint = `/partner/${this.partnerId}/content`
    return this.sendRequest(endpoint, 'delete', body)
  }

  registerProfile(profileId: string, body: RegisterProfileBody) {
    const endpoint = `/partner/${this.partnerId}/profile/${profileId}`
    return this.sendRequest(endpoint, 'put', body)
  }

  getProfile(profileId: string) {
    const endpoint = `/partner/${this.partnerId}/profile/${profileId}` // TODO url
    return this.sendRequest(endpoint, 'get')
  }

  triggerTestEvent(data: Object) {
    const endpoint = `/partner/${this.partnerId}/test`
    return this.sendRequest(endpoint, 'post', data)
  }

  getPatientInfo(profileId: string, body: Object) {
    // const body = {
    //   patientId,
    //   hospital,
    //   orderId,
    //   format // optional
    // };
    const endpoint = `/partner/${this.partnerId}/patientInfo/${profileId}`
    return this.sendRequest(endpoint, 'post', body)
  }

  deleteProfile(profileId: string) {
    const endpoint = `/partner/${this.partnerId}/profile/${profileId}`
    return this.sendRequest(endpoint, 'delete')
  }

  listProfiles() {
    const endpoint = `/partner/${this.partnerId}/profiles`
    return this.sendRequest(endpoint, 'get')
  }

  putPatientRegisterEndpoint(body: Object) {
    const endpoint = `/partner/${this.partnerId}/endpoint/register_patient`
    return this.sendRequest(endpoint, 'put', body)
  }

  // Resolves to body containing endpoint info, i.e.: res.body.registerPatient
  getPatientRegisterEndpoint() {
    const endpoint = `/partner/${this.partnerId}/endpoint/register_patient`
    return this.sendRequest(endpoint, 'get')
  }

  /**
   * Registers profile then registers endpoint with profile as default
   */
  setPatientRegisterEndpointCreateProfile(profile: Profile, endpoint: string) {
    let self = this
    return this.registerProfile(profile.profileId, profile).then(function() {
      let body = {
        registerPatient: {
          endpoint,
          profile: profile.profileId
        }
      }
      return self.putPatientRegisterEndpoint(body)
    })
  }

  setFilters(filters: Filters) {
    const endpoint = `/partner/${this.partnerId}/filters`
    let body = {
      op: 'set', // default is 'set'
      filters
    }
    return this.sendRequest(endpoint, 'put', body)
  }

  addFilters(filters: Filters) {
    const endpoint = `/partner/${this.partnerId}/filters`
    let body = {
      op: 'add',
      filters
    }
    return this.sendRequest(endpoint, 'put', body)
  }

  getFilters() {
    const endpoint = `/partner/${this.partnerId}/filters`
    return this.sendRequest(endpoint, 'get')
  }

  enrollPatient(body: EnrollPatientBody) {
    const endpoint = `/partner/${this.partnerId}/patient`
    return this.sendRequest(endpoint, 'post', body)
  }

  unEnrollPatient(xpdat: string) {
    const endpoint = `/partner/${this.partnerId}/patient`
    return this.sendRequest(endpoint, 'delete', {xpdat})
  }

  renewToken(xpdat: string) {
    const endpoint = `/partner/${this.partnerId}/renew_token`
    return this.sendRequest(endpoint, 'post', {xpdat})
  }
}
