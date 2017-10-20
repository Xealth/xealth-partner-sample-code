  /** @flow */
import gulp from 'gulp'
import babel from 'gulp-babel'
import sourceMaps from 'gulp-sourcemaps'
import gulpWatch from 'gulp-watch'
import plumber from 'gulp-plumber'
import Path from 'path'
import del from 'del'
import { spawn } from 'child-process-promise'
import streamToPromise from 'stream-to-promise'
import sequence from 'run-sequence'

function debug(msg) {
  console.log(msg)
}

/**
 * Converts 'path' so it is relative to 'base'.
 * Returns null if 'path' does not exist at or under 'base'.
 *
 * Examples:
 * /Users/joe/code/', './foo/bar')
 *  => 'foo/bar' iff cwd is /Users/joe/code
 * /Users/joe/code/', '/Users/joe/code/foo/bar')
 *  => 'foo/bar'
 *
 * @param  {string} base
 * @param  {string} path
 * @return {[type]} returns relative path from base to path iff path under base
 */
function relativeToBase(base, path): ?string {
  let out = Path.relative(base, path);
  if (out.startsWith('..')) {
    debug(`Bad path: ${path} not under ${base}`);
    return null;
  }
  return out;
}

function relative(path): ?string {
  return relativeToBase(__dirname, path);
}

function runCommand(cmd, args, verbosity = 0) {
  let prom = spawn(cmd, args);
  if (verbosity > 0) {
    prom.childProcess.stdout.on('data', function(data) {
      console.log(data.toString());
    });
  }
  prom.childProcess.stderr.on('data', function(data) {
    console.log(require('chalk').red(data.toString()));
  });
  return prom;
}

export type DataOpts = {
  srcPat: Array<string>,
  dstPath: string
}

export type GulperOpts = {
  includeSourceMaps: boolean,
  ignorePipelineErrors: boolean,
  rootImportPlugin: Array<string|Object>,
  data?: DataOpts
}

function getDefaultOpts(dest: string): GulperOpts {
  return {
    // Include sourcemaps
    includeSourceMaps: false,
    // Ignore errors in pipeline (e.g. while running gulp-watch)?
    ignorePipelineErrors: false,
    // Transforms symbol in import/require path (e.g. '~') to root of compile output (or other path)
    rootImportPlugin: ['babel-root-import', {'rootPathPrefix': '~', 'rootPathSuffix': dest}]
  }
}

export default class Gulper {
  // Pre-tranformed source
  src: string;
  // Where compiled source goes
  dest: string;
  // Pattern that matches source files in source dir (for gulp-watch)
  pat: Array<string>;
  // Other options
  opts: GulperOpts;

  constructor(src: string, dest: string, opts: {}) {
    this.opts = Object.assign({}, getDefaultOpts(dest), opts);
    this.src = src;
    this.dest = dest;
    this.pat = [`${src}/**/*.js`];
  }

  /**
   * Maps source path (from gulp-watch event notification) to output path
   */
  mapToDest(path: string): string {
    // Source path includes src base. Get rid of it.
    path = Path.relative(this.src, path);
    return Path.join(this.dest, Path.dirname(path));
  }

  /**
   * Deletes output file corresponding to given source file.
   * Called when we see source file was deleted.
   */
  deleteDestFile(srcFile: string): Promise<> {
    let destDir = this.mapToDest(srcFile)
    let fileName = Path.basename(srcFile, '.js')
    debug(`Delete build files in ${destDir} matching source ${srcFile}`)
    let files = ['.js', '.js.map'].map((ext) => {
      return Path.join(destDir, fileName + ext)
    })
    debug(files)
    return del(files)
  }

  /**
   * Compiles file or array of file patterns.
   * If no argument is passed compiles default file pattern ('compile all').
   */
  compile(pat?: string|Array<string>): Promise<> {
    if (!pat) {
      pat = this.pat;
    }
    let onError = err => {
      if (!this.opts.ignorePipelineErrors) {
        throw err;
      }
      // Just log the error
      console.log(err.toString());
    }
    let plumberOpts = {
      errorHandler: onError
    }

    let pipeline;
    debug(`Compiling ${JSON.stringify(pat)} to ${this.dest} (base: ${this.src})...`)
    if (this.opts.includeSourceMaps) {
      debug('Including sourcemaps...');
      pipeline = gulp.src(pat, {base: this.src})
        .pipe(plumber(plumberOpts))
        .pipe(sourceMaps.init())
        .pipe(babel({
          plugins: [this.opts.rootImportPlugin, 'babel-plugin-source-map-support-for-6']
        }))
        // Passing destPath makes source paths show up correctly
        .pipe(sourceMaps.write('.', {destPath: this.dest}))
        .pipe(gulp.dest(this.dest))
    } else {
      pipeline = gulp.src(pat, {base: this.src})
        .pipe(plumber(plumberOpts))
        .pipe(babel({
          plugins: [this.opts.rootImportPlugin]
        }))
        .pipe(gulp.dest(this.dest))
    }
    return streamToPromise(pipeline).then(() => {
      debug(`Generating *.js.flow files in ${this.dest}...`)
      return this.flow();
    });
  }

  /**
   * Generates *.flow.js files with flow type information so types are
   * available to modules that import this one.
   */
  flow(): ?Promise<> {
    let cmd = `./node_modules/.bin/flow-copy-source`;
    let args = ['-v', this.src, this.dest];
    return runCommand(cmd, args);
  }

  clean(): ?Promise<> {
    let deleteDir = relativeToBase(__dirname, this.dest);
    if (deleteDir) {
      let pattern = Path.join(deleteDir, '**');
      debug(`Deleting: ${pattern}`);
      return del([pattern, `!${deleteDir}`]);
    }
  }

  watch() {
    // "Keep going" when error occurs while watching
    this.opts.ignorePipelineErrors = true;
    return gulpWatch(this.pat, {base: this.src})
      .on('change', what => {
        let fileName = relative(what);
        if (fileName) {
          debug(`*** Changed: ${fileName}`);
          this.compile(fileName);
        }
      })
      .on('add', what => {
        let fileName = relative(what);
        if (fileName) {
          debug(`*** Added: ${fileName}`);
          this.compile(fileName);
        }
      })
      .on('unlink', what => {
        let fileName = relative(what);
        if (fileName) {
          debug(`*** Deleted: ${fileName}`);
          this.deleteDestFile(fileName);
        }
      });
  }

    /**
     * Adds standard tasks. For example, if name is 'dist':
     *  dist:clean
     *  dist:compile
     *  dist (clean compile)
     */
  defineTasks(name: string) {
    gulp.task(`${name}:clean`, () => {
      return this.clean();
    });

    // Copy data files. We only support one folder for now.
    gulp.task(`${name}:data`, () => {
      if (this.opts.data) {
        let data = this.opts.data
        let outputRoot = this.dest
        let dest = Path.join(outputRoot, data.dstPath)
        debug(`Copying ${JSON.stringify(data.srcPat)} => ${dest}...`)
        return gulp.src(data.srcPat)
        .pipe(gulp.dest(dest))
      }
    })

    gulp.task(`${name}:compile`, () => {
      return this.compile();
    });

    // clean and copy data once clean completes
    gulp.task(`${name}:prepare`, function(done) {
      sequence(`${name}:clean`, `${name}:data`, done);
    });

    // lib -> clean, copy data, then compile
    gulp.task(name, [`${name}:prepare`], () => {
      return this.compile();
    });

    gulp.task(`${name}:watch`, () => {
      return this.watch();
    });
  }
}
