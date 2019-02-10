'use strict';

var gulp = require('gulp'),
    qunit = require('gulp-qunit'),
    size = require('gulp-size'),
    concat = require('gulp-concat'),
    chmod = require('gulp-chmod'),
    through = require('through2'),
    ts = require('gulp-typescript'),

    closureCompiler = require('./src/dev/closure-compiler.js'),
    updateHtmlFiles = require('./src/dev/updatehtml.js'),
    jsSrcGlobGen = require('./src/dev/srcgen.js');

// The source paths, used for generating the glob, for determining sources.
var srcPaths = [
  // :Glift Core: //
  // Top level source package must go first since it defines the namespace
  'src/glift.js',

  // Point and enums from util are depended on by everything. Perhaps they
  // should go at the top level?
  'src/util',

  'src'];

// Ignore the test files, dev files
var srcIgnore = ['!src/**/*_test.js', '!src/**/*_test.ts', '!**/dev/*']

// The glob used for determining tests
var testGlob = ['src/**/*_test.js', 'src/**/*_test.ts']

gulp.task('concat', () => {
  return gulp.src(jsSrcGlobGen(srcPaths, srcIgnore), {base: '.'})
    .pipe(concat('glift-core-concat.js'))
    .pipe(size())
    .pipe(chmod(0o666))
    .pipe(gulp.dest('./compiled/'))
})

// Compile the sources with the JS Compiler
// See https://www.npmjs.com/package/google-closure-compiler
// for more details
gulp.task('compile', () => {
  return gulp.src(jsSrcGlobGen(srcPaths, srcIgnore), {base: '.'})
    .pipe(closureCompiler('glift-core.js'))
    .pipe(size())
    .pipe(gulp.dest('./compiled/'))
})

// compile typescript + js
gulp.task('cts', () => {
  return gulp.src(jsSrcGlobGen(srcPaths, srcIgnore, true /* ts */), {base: '.'})
    .pipe(ts({
        noImplicitAny: true,
        allowJs: true,
        outFile: 'glift-core.ts.js'
    }))
    .pipe(gulp.dest('./compiled/'));
});

// compile just typescript
gulp.task('cts-o', () => {
  return gulp.src('src/**/*.ts')
    .pipe(ts({
        noImplicitAny: true,
        outFile: 'glift-core.only.js'
    }))
    .pipe(gulp.dest('./compiled/'));
});


// Update the HTML tests with the dev JS source files
gulp.task('update-html-srcs', () => {
  return gulp.src(jsSrcGlobGen(srcPaths, srcIgnore), {base: '.'})
    .pipe(updateHtmlFiles({
      filesGlob: './test/htmltests/*.html',
      outDir: './test/htmltests_gen/',
      header: '<!-- AUTO-GEN-DEPS -->',
      footer: '<!-- END-AUTO-GEN-DEPS -->',
      dirHeader: '<!-- %s sources -->',
    }))
});

// Update the HTML tests with the test JS files
gulp.task('update-html-tests', () => {
  return gulp.src(testGlob)
    .pipe(updateHtmlFiles({
      filesGlob: './test/htmltests/GCoreTest.html',
      outDir: './test/htmltests_gen/',
      header: '<!-- AUTO-GEN-TESTS -->',
      footer: '<!-- END-AUTO-GEN-TESTS -->',
      dirHeader: '<!-- %s tests -->',
    }))
})

gulp.task('src-gen', () => {
  gulp.src(jsSrcGlobGen(srcPaths, srcIgnore))
    .pipe(through.obj(function(file, enc, cb) {
      console.log(file.path);
      cb()
    }, function(cb) {
      cb()
    }));
});

gulp.task('test-simple', () => {
  return gulp.src('./test/htmltests_gen/GCoreTest.html').pipe(qunit())
});

gulp.task('test', gulp.series('update-html-tests', 'update-html-srcs', () => {
  return gulp.src('./test/htmltests_gen/GCoreTest.html').pipe(qunit())
}));

// The full build-test cycle. This:
// - Updates all the HTML files
// - Recreates the concat-target
// - Runs all the tests
// - Compiles with JSCompiler + TypeChecking
gulp.task('build-test', gulp.series('concat', 'compile', 'test'))

// A watcher for the the full build-test cycle.
gulp.task('test-watch', () => {
  return gulp.watch([
    'src/**/*.js',
    'src/**/*_test.js'], gulp.series('test'))
});

// A simpler watcher that just updates the 
gulp.task('update-html-watch', () => {
  return gulp.watch([
    'src/**/*.js',
    'src/**/*_test.js'], gulp.series('update-html-tests', 'update-html-srcs'))
})

// Update the HTML tests with the compiled glift.
gulp.task('update-html-compiled', gulp.series('compile', () => {
  return gulp.src('./compiled/glift-core.js')
    .pipe(updateHtmlFiles({
      filesGlob: './test/htmltests/*.html',
      outDir: './test/htmltests_gen/',
      header: '<!-- AUTO-GEN-DEPS -->',
      footer: '<!-- END-AUTO-GEN-DEPS -->',
      dirHeader: '<!-- %s sources -->',
    }))
}));

gulp.task('compile-test', gulp.series('update-html-compiled', () => {
  return gulp.src('./test/htmltests_gen/GCoreTest.html').pipe(qunit())
}));

gulp.task('compile-watch', () => {
  return gulp.watch([
    'src/**/*.js',
    'src/**/*_test.js'], gulp.series('update-html-compiled'))
});
