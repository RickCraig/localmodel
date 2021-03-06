'use strict';

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  bump = require('gulp-bump'),
  tag = require('gulp-tag-version'),
  concat = require('gulp-concat'),
  runSequence = require('run-sequence'),
  replace = require('gulp-replace'),
  jip = require('jasmine-istanbul-phantom'),
  insert = require('gulp-insert');

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

gulp.task('concat', function() {
  var closureStart = '(function(window) {\n';
  var closureEnd = '\nwindow.LocalModel = LocalModel;\n' +
    'window.LocalSchema = LocalSchema;\nwindow.LocalDocument ' +
    '= LocalDocument;\n\n}(window));';
  var startingComment = '/*!\n * LocalModel\n * Developer: Rick Craig' +
   '\n * https://github.com/RickCraig/localmodel\n*/\n\n';
  return gulp.src(paths.scripts)
    .pipe(replace(/'use strict';\n\n/g, ''))
    .pipe(concat('localmodel.js'))
    .pipe(insert.prepend(closureStart))
    .pipe(insert.prepend(startingComment))
    .pipe(insert.append(closureEnd))
    .pipe(gulp.dest('dist'));
});

gulp.task('minify', function() {
  return gulp.src('dist/localmodel.js')
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(rename('localmodel.min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('patch', function() {
  return gulp.src(paths.packages)
    .pipe(bump({type: 'patch'}))
    .pipe(gulp.dest('./'));
});

gulp.task('minor', function() {
  return gulp.src(paths.packages)
    .pipe(bump({type: 'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('major', function() {
  return gulp.src(paths.packages)
    .pipe(bump({type: 'major'}))
    .pipe(gulp.dest('./'));
});

gulp.task('tag', function() {
  return gulp.src(paths.packages[0])
    .pipe(tag());
});

gulp.task('release', function() {
  runSequence('concat', 'lint', 'test', 'concat', 'minify');
});

gulp.task('release-patch', function() {
  runSequence(
    'concat',
    'lint',
    'test',
    'concat',
    ['patch', 'minify'],
    'tag'
  );
});

gulp.task('release-minor', function() {
  runSequence(
    'concat',
    'lint',
    'test',
    'concat',
    ['minor', 'minify'],
    'tag'
  );
});

gulp.task('release-major', function() {
  runSequence('concat', 'lint', 'test',['major', 'minify'], 'tag');
});

gulp.task('lint', function() {
  return gulp.src('dist/localmodel.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['concat']);
  gulp.watch('dist/localmodel.js', ['lint']);
});

gulp.task('default', ['watch', 'lint']);
