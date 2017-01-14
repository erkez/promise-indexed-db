'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var babelify = require('babelify');
var looseEnvify = require('loose-envify');


function runBrowserify(entries, output) {
    var b = browserify({
        entries: entries,
        cache: {},
        packageCache: {},
        standalone: 'promiseIndexedDB',
        transform: [
            babelify.configure({
                presets: ['es2015'],
                only: 'src'
            }),
            looseEnvify
        ]
    });

    const bundle = () => b.bundle()
        .on('error', error => gutil.log('Browserify Error', error.stack || error.message))
        .pipe(source(output))
        .pipe(gulp.dest('dist'));

    b.on('update', bundle);
    b.on('log', msg => gutil.log('Watchify', msg));

    return bundle();
}

gulp.task('scripts:eslint', function() {
    return gulp
        .src('src/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('scripts:compile', function() {
    return runBrowserify([
        'src/index.js'
    ], 'promise-indexed-db.js');
});

gulp.task('scripts:bundle', ['scripts:eslint', 'scripts:compile'], function() {
    return gulp
        .src('dist/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});
