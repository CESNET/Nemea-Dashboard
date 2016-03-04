var gulp = require('gulp')
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var ngAnnotate = require('gulp-ng-annotate')
var sass = require('gulp-sass')
var filter = require('gulp-filter')
var bower = require('main-bower-files');
var cssnano = require('gulp-cssnano');
var debug = require('gulp-debug');

var dist = {
    js : 'public/',
    css : 'public/',
    vendor : 'public/'
}

gulp.task('js', function () {
gulp.src(['js/**/*.js', '!js/**/*.min.js','!js/config.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('js/app.min.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'))
})

gulp.task('js-nosm', function () {
gulp.src(['js/**/*.js', '!js/**/*.min.js', '!js/config.js'])
    .pipe(concat('app.min.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(gulp.dest(dist.js))
})

gulp.task('scss', function() {
    gulp.src(['scss/**/*.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle : 'compressed'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./css'))
});

gulp.task('scss-nosm', function() {
    gulp.src(['scss/**/*.scss'])
        .pipe(sass({outputStyle : 'compressed'}))
        .pipe(gulp.dest(dist.css))
});

gulp.task('watch', ['js', 'scss'], function () {
    gulp.watch('js/**/*.js', ['js'])
    gulp.watch('scss/**/*.scss', ['scss'])
})


gulp.task('bower', function() {
    var jsFilter = filter('**/*.js');
    return gulp.src(
        bower({
            paths : {
                bowerDirectory : 'bower_components',
                bowerJson : 'bower.json'
            }
        })
        )
        .pipe(jsFilter)
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dist.js))
})


gulp.task('bower-css', function() {
    var cssFilter = filter('**/*.css')

    return gulp.src(bower())
        .pipe(cssFilter)
        .pipe(concat('vendor.css'))
        .pipe(cssnano())
        .pipe(gulp.dest(dist.css))
})

gulp.task('production', ['js-nosm', 'scss-nosm', 'bower', 'bower-css'], function() {})
