/** @flow */
import gulp from 'gulp'
import yargs from 'yargs'
import Gulper from './gulper'

let argv = yargs
  .option('sourceMaps', {
    alias: 'sm',
    describe: 'Include sourcemaps when compiling',
    type: 'boolean'
  }).argv

// Enable source maps if running default task or --sourceMaps is passed
let enableSourceMaps = argv.sourceMaps || (argv['_'].length === 0)

let rootImportPlugin = ['babel-root-import', {'rootPathPrefix': '~', 'rootPathSuffix': './lib'}]

let rootImportPluginTest = ['babel-root-import',
  [{'rootPathPrefix': '~', 'rootPathSuffix': './lib'},
    {'rootPathPrefix': '@', 'rootPathSuffix': './test/compiled'}
  ]]

// Module source
new Gulper('./src', './lib', {includeSourceMaps: enableSourceMaps, rootImportPlugin})
  .defineTasks('lib')

// Test source (always build with sourcemaps)
new Gulper('./test/src', './test/compiled', {includeSourceMaps: true, rootImportPlugin: rootImportPluginTest})
  .defineTasks('test')

// Clean compile everything
gulp.task('all', gulp.parallel('lib', 'test'))

// Watch everything
gulp.task('watch', gulp.parallel('lib:watch', 'test:watch'))

gulp.task('default', gulp.series('lib', 'watch'))
