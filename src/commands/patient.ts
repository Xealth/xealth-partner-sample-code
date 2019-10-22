import {Argv} from 'yargs'
exports.command = 'patient <command>'
exports.describe = 'Performs patient command (enroll, unenroll, etc.)'
exports.builder = function(yargs: Argv) {
  return yargs.commandDir('patient')
}
exports.handler = function(argv: Record<string, any>) {
  // no nothing
}
