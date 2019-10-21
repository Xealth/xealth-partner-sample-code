/** @flow */
import yargs from 'yargs'

// Ignore errors re self-signed certs on dev servers
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

yargs
  .usage('Usage: $0 <name> [<command-options>]')
  .demand(1, 'Please provide a valid command')
  .help('help')
  .alias('h', 'help')
  .option('verbose', {
    alias: 'v',
    describe: 'verbosity level',
    count: true,
    default: 0,
    global: true
  })
  .option('config', {
    alias: 'c',
    default: './config.yaml',
    describe: 'path to config yaml',
    global: true
  })
  .commandDir('./commands', {
    recurse: false
  })
  .strict()
  .showHelpOnFail(true, 'Specify --help for available options')
  .completion('completions', 'mytest-completion')
  .argv
