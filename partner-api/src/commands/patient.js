/** @flow */
import type yargs from 'yargs'
exports.command = 'patient <command>';
exports.describe = 'Performs patient command (enroll, unenroll, etc.)';
exports.builder = function(yargs: yargs) {
  return yargs.commandDir('patient');
}
exports.handler = function(argv: Object) {}
