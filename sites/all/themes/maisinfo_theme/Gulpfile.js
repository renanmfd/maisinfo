/*jslint browser: true, devel: true, node: true, rhino: false, nomen: true,
         regexp: true, unparam: true, indent: 4, maxlen: 80*/

/**
 * @author Tursites / Renan
 *
 * GULP
 * -- CSS
 *    > CSSLint (https://github.com/lazd/gulp-csslint)
 *    > Sourcemaps (https://github.com/floridoo/gulp-sourcemaps)
 *    > PostCSS (https://github.com/postcss/postcss)
 *    > Autoprefixer (https://github.com/postcss/autoprefixer)
 *    > PXtoREM (https://github.com/cuth/postcss-pxtorem)
 *    > CSSComb (https://github.com/koistya/gulp-csscomb)
 *    > CleanCSS (https://github.com/scniro/gulp-clean-css)
 * -- Javascript
 *    > ESLint (https://github.com/karimsa/gulp-jslint)
 *    > Complexity (https://github.com/alexeyraspopov/gulp-complexity)
 *    > Uglify (https://github.com/terinjokes/gulp-uglify)
 * -- Images
 *    > ImageMin
 */

(function gulpClosure() {
    'use strict';

    // Gulp core.
    var gulp = require('gulp'),

        // Browser sync.
        browserSync = require('browser-sync').create(),
        reload = browserSync.reload,

        // Utils.
        plumber = require('gulp-plumber'),
        rename = require('gulp-rename'),
        cache = require('gulp-cached'),
        gutil = require('gulp-util'),
        data = require('gulp-data'),
        path = require('path'),

        // CSS tools.
        lesshint = require('gulp-lesshint'),
        sourcemaps = require('gulp-sourcemaps'),
        less = require('gulp-less'),
        LessPluginCleanCSS = require('less-plugin-clean-css'),
        LessPluginAutoPrefix = require('less-plugin-autoprefix'),
        LessPluginCSScomb = require('less-plugin-csscomb'),
        cleancss = new LessPluginCleanCSS({advanced: true}),
        autoprefix = new LessPluginAutoPrefix({browsers: ["last 2 versions"]}),
        csscomb = new LessPluginCSScomb("zen"),

        // Javascript tools.
        eslint = require('gulp-eslint'),
        complexity = require('gulp-complexity'),
        uglify = require('gulp-uglify'),

        // Imaging tools.
        imageMin = require('gulp-imagemin'),

        // Configuration.
        plumberOpt = {
            handleError: function (err) {
                console.log('Plumber ->', err);
                this.emit('end');
            }
        };

    /**
     * Bootstrap compilation.
     */
    gulp.task('bootstrap', function bootstrapTask() {
  return gulp.src('./bootstrap/less/bootstrap.less')
      .pipe(plumber(plumberOpt))
      .pipe(sourcemaps.init())
      .pipe(less({
    plugins: [autoprefix, csscomb, cleancss]
      }))
      .pipe(rename({suffix: '.min'}))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./css/'))
            .pipe(reload({stream: true}));
    });

    /**
     * CSS build.
     */
    gulp.task('less-lint', function cssTask() {
        return gulp.src('./less/**/*.less')
            .pipe(plumber())
            .pipe(lesshint({
                // Options
            }))
            .pipe(lesshint.reporter())
            .on('error', function () {
                gutil.log('Less lint error');
            });
    });
    gulp.task('less', ['less-lint'], function cssTask() {
        return gulp.src('./less/style.less')
            .pipe(plumber(plumberOpt))
            .pipe(sourcemaps.init())
            .pipe(less({
                plugins: [autoprefix, csscomb, cleancss]
            }))
            .pipe(rename({suffix: '.min'}))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./css/'))
            .pipe(reload({stream: true}));
    });

    /**
     * Javascript build.
     */
    gulp.task('js-lint', function () {
        return gulp.src(['./js/**/*.js'])
            .pipe(plumber())
            .pipe(eslint('.eslintrc'))
            .pipe(eslint.format())
            .pipe(eslint.failAfterError());
    });
    gulp.task('js', ['js-lint'], function jsTask() {
        return gulp.src(['/js/**/*.js'])
            .pipe(cache('js'))
            .pipe(plumber(plumberOpt))
            .pipe(complexity())
            .pipe(gulp.dest('/js/build/'))
            .pipe(rename({suffix: '.min'}))
            .pipe(uglify())
            .pipe(gulp.dest('/js/build/'))
            .pipe(reload({stream: true}));
    });

    /**
     * Image build.
     */
    gulp.task('img', function () {
        gulp.src(['./img/*'])
            .pipe(plumber(plumberOpt))
            .pipe(cache(imageMin()))
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest('./img/'));
    });

    /**
     * Browser sync watch.
     */
    gulp.task('watch', function watchTask() {
        browserSync.init({
            proxy: {
              target: "http://192.168.33.10/maisinfo/",
              ws: true
            }
        });

        gulp.watch('/bootstrap/less/**/*.less', ['bootstrap']);
        gulp.watch('/less/**/*.less', ['less']);
        gulp.watch('/js/**/*.js', ['js']);
    });

    gulp.task('default', ['bootstrap', 'less', 'js', 'img', 'watch']);
}());
