/** @flow */
import Url from 'url'
import _ from 'lodash'
import promisify from 'es6-promisify'
const request = promisify(require('request'))
import HttpStatus from 'http-status-codes'
import chalk from 'chalk'

import {createRequestOptions} from './auth'

function dumpResponse(response, verbosity) {
  let colorize = response.statusCode === HttpStatus.OK ? chalk.green : chalk.red
  console.log(colorize(`Response: ${response.statusCode}`))
  if (verbosity > 0) {
    if (response.headers) {
      // Xealth adds the request id (x-request-id) so we can later reference the request in our logs (for debugging).
      let pick = ['x-request-id'];
      if (verbosity > 1) {
        pick = Object.keys(response.headers)
      }
      pick.forEach(function(header) {
        let headerVal = response.headers[header]
        if (headerVal) {
          console.log(`${header}: ${headerVal}`)
        }
      });
    }
    if (response.body) {
      console.log(JSON.stringify(response.body, null, 2))
    }
  }
}

export type Opts = {
  verbose?: number,
  baseUrl?: string
}

const DEFAULT_OPTS: Opts = {
  verbose: 1
}

export type KeyInfo = {
  apiKey: string,
  secret: string
}

export default class Sender {
  keyInfo: KeyInfo
  verbosity: number
  baseUrl: ?string
  constructor (keyInfo: KeyInfo, opts: Opts = {}) {
    opts = Object.assign({}, DEFAULT_OPTS, opts)
    this.keyInfo = keyInfo
    this.baseUrl = opts.baseUrl
    this.verbosity = opts.verbose || 0
  }

  sendRequest(url: string, method: string, body: ?Object, expectedStatus: number = HttpStatus.OK) {
    if (this.baseUrl) {
      url = [this.baseUrl, url].map((str) => _.trim(str, '/')).join('/')
    }
    console.log(chalk.bold(`${method} ${url}`))
    if (body) {
      console.log(JSON.stringify(body, null, 2))
    }

    let options = createRequestOptions({
      apiKey: this.keyInfo.apiKey,
      secret: this.keyInfo.secret,
      url,
      method,
      body,
      json: true,
      accept: 'application/json,application/vnd.error+json'
    })

    if (this.verbosity > 0) {
      console.log(' ** Request Headers **')
      console.log(options)
    }

    return request(options).then(response => {
      dumpResponse(response, this.verbosity)
      // Throw an error to abort promise chain
      if (expectedStatus && response.statusCode != expectedStatus) {
        throw new Error(`Unexpected response status: ${response.statusCode}`)
      }
      return response
    })
  }
}
