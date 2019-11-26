import crypto from 'crypto'
import moment from 'moment'
import Url from 'url'

export type RequestParam = {
  apiKey: string,
  secret: string,
  url: string,
  method: string,
  queryString?: string,
  body?: Record<string, any> | null,
  json?: boolean,
  accept?: string
}

/**
 * Creates options for http request
 * Adds Authorization headers
 */
export function createRequestOptions(param: RequestParam) {
  const {apiKey, secret, url, method, queryString, body, json, accept = 'application/json'} = param

  const fullPath = queryString ? `${url}?${queryString}` : url
  // This creates ISO 8601 date string (required format)
  const dateStr = moment.utc().format()
  const parsedUrl = Url.parse(fullPath)
  const stringToSign = [
    method.toUpperCase(),
    parsedUrl.path,
    parsedUrl.hostname,
    accept,
    dateStr
  ].join('\n')
  const hash = crypto
    .createHmac('sha256', secret)
    .update(stringToSign)
    .digest('base64')
  const auth = `XEALTH ${apiKey}:${hash}`
  let options: Record<string, any> = {
    url,
    method,
    headers: {
      Accept: accept,
      Date: dateStr,
      Authorization: auth
    }
  }

  if (body) {
    options = Object.assign(options, {body})
  }
  if (json) {
    options = Object.assign(options, {json})
  }
  if (queryString) {
    options = Object.assign(options, {qs: queryString})
  }
  return options
}
