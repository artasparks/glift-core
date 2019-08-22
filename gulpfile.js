'use strict';

const gulp = require('gulp'),
    ts = require('gulp-typescript');

gulp.task('default', function() {
  // TODO(kashomon): replace with a glob
  return gulp.src([
      'src/**/*.ts',
    ])
    .pipe(ts({
        noImplicitAny: true,
        strictNullChecks: true
    }))
    .pipe(gulp.dest('dist'));
});
