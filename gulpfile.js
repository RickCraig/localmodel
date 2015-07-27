'use strict';

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  bump = require('gulp-bump'),
  tag = require('gulp-tag-version'),
  runSequence = require('run-sequence'),
  jip = require('jasmine-istanbul-phantom');

var paths = {
  scripts: 'src/js/*.js',
  packages: [
    'package.json'
  ]
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

gulp.task('bump-patch', function() {
  return gulp.src(paths.packages)
    .pipe(bump({type: 'patch'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bump-minor', function() {
  return gulp.src(paths.packages)
    .pipe(bump({type: 'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bump-major', function() {
  return gulp.src(paths.packages)
    .pipe(bump({type: 'major'}))
    .pipe(gulp.dest('./'));
});

gulp.task('tag', function() {
  return gulp.src(paths.packages[0])
    .pipe(tag());
});

gulp.task('release', function() {
  runSequence('lint', 'test', 'minify', 'tag');
});

gulp.task('release-patch', function() {
  runSequence('lint', 'test', ['bump-patch', 'minify'], 'tag');
});

gulp.task('release-minor', function() {
  runSequence('lint', 'test', ['bump-patch', 'minify'], 'tag');
});

gulp.task('release-major', function() {
  runSequence('lint', 'test', ['bump-patch', 'minify'], 'tag');
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
