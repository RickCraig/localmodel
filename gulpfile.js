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

gulp.task('concat', function() {
  return gulp.src(paths.scripts)
    .pipe(replace(/'use strict';/g, ''))
    .pipe(replace(/\/\/ use strict/g, '\'use strict\';'))
    .pipe(concat('localmodel.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('minify', function() {
  return gulp.src('dist/js/localmodel.js')
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(rename('localmodel.min.js'))
    .pipe(gulp.dest('dist/js'));
});

var bump = function(type) {
  return gulp.src(paths.packages)
    .pipe(bump({type: type}))
    .pipe(gulp.dest('./'));
};

gulp.task('patch', function() {
  return bump('patch');
});

gulp.task('minor', function() {
  return bump('minor');
});

gulp.task('major', function() {
  return bump('major');
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
  return gulp.src('dist/js/localmodel.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['concat']);
  gulp.watch('dist/js/localmodel.js', ['lint']);
});

gulp.task('default', ['watch', 'lint']);
