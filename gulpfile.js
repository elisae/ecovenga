'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var cleanCSS = require('gulp-clean-css');
var newer = require('gulp-newer');

var dirs = {
  source: "./frontend/dev",
  build: "./frontend/public"
}

// helper function to copy files only if they have changed
function justCopy(source, dest) {
  gulp.src(source)
    .pipe(newer(dest))
    .pipe(gulp.dest(dest));
}

gulp.task('html', function () {
  // copy all .html files in /views
  var dest = dirs.build + '/views';
  var src = dirs.source + '/views/**/*.html'
  justCopy(src, dest);
  // also the index.html in the dir above
  justCopy(dirs.source + '/index.html', dirs.build);
});

gulp.task('assets', function() {
  justCopy(dirs.source + '/assets/**', dirs.build + '/assets');
});

gulp.task('sass_to_css', function () {
  var src = dirs.source + '/scss/**/*.scss';
  var dest = dirs.build + '/css';
  var dest_filename = 'style.min.css';

  return gulp.src(src)
    .pipe(newer(dest + '/' + dest_filename))
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: ['node_modules/foundation-sites/scss']
    }))
    .pipe(sass().on('error', sass.logError))
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3']
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(rename(dest_filename))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest));
});

gulp.task('javascript', function() {
  var src = dirs.source + '/js/**/*.js';
  var dest = dirs.build + '/js';
  var dest_filename = 'script.min.js';
  gulp.src(src)
    .pipe(newer(dest))
    .pipe(sourcemaps.init())
    .pipe(concat(dest_filename))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest));
});

// gulp in dev mode: watch for changes (until ctrl+c)
gulp.task('watch', ['html', 'assets', 'sass_to_css', 'javascript'], function() {
  var js = dirs.source + '/js/*.*';
  var css = dirs.source + '/scss/*.*';
  var html = dirs.source + '/views/*.*';
  var assets = dirs.source + '/assets/*.*';

  gulp.watch(js, ['javascript']);
  gulp.watch(css, ['sass_to_css']);
  gulp.watch([html, dirs.source + '/index.html'], ['html']);
  gulp.watch(assets, ['assets']);
});

// The default task (called when you run `gulp` from cli), run once
gulp.task('default', ['html', 'assets', 'sass_to_css', 'javascript']);
