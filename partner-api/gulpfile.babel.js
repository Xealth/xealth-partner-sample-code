/** @flow */
import gulp from 'gulp'
import yargs from 'yargs'
import Gulper from './gulper'
import sequence from 'run-sequence'

let argv = yargs
  .option('sourceMaps', {
    alias: 'sm',
    describe: 'Include sourcemaps when compiling',
    type: 'boolean'
  }).argv

// Enable source maps if running default task or --sourceMaps is passed
let enableSourceMaps = argv.sourceMaps || (argv['_'].length === 0);

let rootImportPlugin = ['babel-root-import', {'rootPathPrefix': '~', 'rootPathSuffix': './lib'}]

let rootImportPluginTest = ['babel-root-import',
[{'rootPathPrefix': '~', 'rootPathSuffix': './lib'},
 {'rootPathPrefix': '@', 'rootPathSuffix': './test/compiled'}
]]

// Module source
let src = new Gulper('./src', './lib', { includeSourceMaps: enableSourceMaps, rootImportPlugin })
src.defineTasks('lib');

// Test source (always build with sourcemaps)
let test = new Gulper('./test/src', './test/compiled', { includeSourceMaps: true, rootImportPlugin: rootImportPluginTest })

test.defineTasks('test');

// Clean compile everything
gulp.task('all', ['lib', 'test']);

// Watch everything
gulp.task('watch', ['lib:watch', 'test:watch']);

gulp.task('default', function(done) {
  sequence('lib', 'watch', done);
});
