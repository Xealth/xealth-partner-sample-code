import { Argv } from 'yargs'
exports.command = 'demo <command>'
exports.describe = 'Performs demo calls'
exports.builder = function(yargs: Argv) {
  return yargs.commandDir('demo')
}
exports.handler = function(argv: Record<string, any>) {
  // do nothing
}
