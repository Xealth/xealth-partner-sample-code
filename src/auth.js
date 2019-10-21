/** @flow */
import crypto from 'crypto'
import moment from 'moment'
import Url from 'url'

export type RequestParam = {
  apiKey: string,
  secret: string,
  url: string,
  method: string,
  queryString?: string,
  body?: ?Object,
  json?: boolean,
  accept?: string
}

/**
 * Creates options for http request
 * Adds Authorization headers
 */
export function createRequestOptions(param: RequestParam) {
  let {
    apiKey, secret, url, method, queryString, body, json, accept
  } = param;

  if (!accept) {
    accept = 'application/json'
  }

  let fullPath = (queryString) ? `${url}?${queryString}` : url
  // This creates ISO 8601 date string (required format)
  let dateStr = moment.utc().format()
  let parsedUrl = Url.parse(fullPath)
  let stringToSign = [
    method.toUpperCase(),
    parsedUrl.path,
    parsedUrl.hostname,
    accept,
    dateStr
  ].join('\n');
  let hash = crypto.createHmac('sha256', secret)
    .update(stringToSign)
    .digest('base64')
  let auth = `XEALTH ${apiKey}:${hash}`
  let options: Object = {
    url,
    method,
    headers: {
      'Accept': accept,
      'Date': dateStr,
      'Authorization': auth
    }
  }

  if (body) {
    options = Object.assign(options, { body })
  }
  if (json) {
    options = Object.assign(options, { json })
  }
  if (queryString) {
    options = Object.assign(options, { qs: queryString })
  }
  return options
}
