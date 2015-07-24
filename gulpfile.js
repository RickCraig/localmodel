'use strict';

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  jip = require('jasmine-istanbul-phantom');

var paths = {
  scripts: 'src/js/*.js'
};

gulp.task('test', function (done) {
  jip({
    base: './',
    spec: 'spec/*.js',
    callback: done
  });
});

gulp.task('minify', function() {
  return gulp.src(paths.scripts)
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(rename('localmodel.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('lint', function() {
  return gulp.src([paths.scripts])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['lint']);
});

gulp.task('default', ['watch', 'lint']);
