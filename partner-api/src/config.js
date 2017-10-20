/** @flow */
import read from 'read-yaml'

function checkConfig(config) {
  if (!config.keyInfo.apiKey || !config.keyInfo.secret || !config.partnerId) {
    throw new Error('Please update the config with your key, secret and partner id')
  }
}

function _readConfig(filename: string): Object {
  let config
  try {
    config = read.sync(filename)
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`Missing config file (not found in ${process.cwd()}): ${filename}`)
    } else {
      console.log(`Error reading creds file: ${filename}`)
    }
    throw err
  }
  return config
}

export default function load(argv: Object): Object {
  let config = _readConfig(argv.config)
  checkConfig(config)
  return config
}
