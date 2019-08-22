'use strict';

const gulp = require('gulp'),
    closureCompiler = require('google-closure-compiler').gulp();


 
gulp.task('default', function() {
  return gulp.src('src/**/*.js')
    .pipe(closureCompiler({
      language_in: 'ECMASCRIPT6_STRICT',
      language_out: 'ECMASCRIPT5_STRICT',
    }))
    .pipe(gulp.dest('dist'));
});
