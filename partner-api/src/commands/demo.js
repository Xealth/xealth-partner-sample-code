/** @flow */
import yargs from 'yargs'
exports.command = 'demo <command>';
exports.describe = 'Performs demo calls';
exports.builder = function(yargs: yargs) {
  return yargs.commandDir('demo');
}
exports.handler = function(argv: Object) {}
