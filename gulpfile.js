'use strict';

var pngquant = require('imagemin-pngquant'),
    glob = require('glob'),
    gulp = require('gulp'),
    gulpicon = require('gulpicon/tasks/gulpicon'),
    plugins = require('gulp-load-plugins')();

var dirs = {
  bower: 'bower_components',
  css: 'assets/css',
  js: 'assets/js',
  images: 'assets/images',
  icons: 'assets/icons'
}

var jsdirs = [
  dirs.js + '/*.js',
  '!' + dirs.js + '/modernizr.js',
  '!' + dirs.js + '/build.js'
]

var autoprefixerOptions = {
  browsers: ['last 2 versions']
};

gulp.task('sass:dev', function () {
  gulp.src(dirs.css + '/*.scss')
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass().on('error', plugins.sass.logError))
    .pipe(plugins.autoprefixer(autoprefixerOptions))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(dirs.css))
    .pipe(plugins.livereload());
});

gulp.task('sass', function () {
  gulp.src(dirs.css + '/*.scss')
    .pipe(plugins.sass({outputStyle: 'compressed'}).on('error', plugins.sass.logError))
    .pipe(plugins.autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest(dirs.css))
    .pipe(plugins.livereload());
});

gulp.task('imagemin', function () {
  gulp.src(dirs.images + '/**/*')
    .pipe(plugins.imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(dirs.images));
});

gulp.task('js', function () {
  gulp.src([dirs.bower + '/modernizr/modernizr.js'])
    .pipe(plugins.uglify())
    .pipe(gulp.dest(dirs.js + '/'));

  gulp.src(jsdirs)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'));

  var jsdirsClone = jsdirs.slice(0);
  jsdirsClone.unshift(dirs.bower + '/jquery/dist/jquery.js');

  gulp.src(jsdirsClone)
    .pipe(plugins.concat('build.js'))
    .pipe(plugins.uglify())
    .pipe(gulp.dest(dirs.js + '/'))
    .pipe(plugins.livereload());
});

gulp.task('gulpicon',
  gulpicon(glob.sync(dirs.icons + '/**/*.svg'), {
    cssprefix: ".icon--",
    customselectors: {
      "*": [".icon--$1:before"]
    },
    dest: dirs.icons + '/grunticon'
  })
);

gulp.task('watch', function () {
  plugins.livereload.listen();
  gulp.watch(dirs.css + '/*.scss', ['sass:dev']);
  gulp.watch(jsdirs, ['js']);
  gulp.watch(dirs.icons + '/**/*.svg', ['gulpicon']);
});

gulp.task('default', ['sass', 'js', 'imagemin', 'gulpicon'], function () {});
gulp.task('dev', ['default', 'watch'], function () {});
