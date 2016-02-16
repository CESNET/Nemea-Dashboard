var gulp = require('gulp')
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var ngAnnotate = require('gulp-ng-annotate')
var sass = require('gulp-sass')
var mainBowerFiles = require('main-bower-files');

gulp.task('js', function () {
gulp.src(['js/**/*.js', '!js/**/*.min.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('js/app.min.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'))
})

gulp.task('scss', function() {
    gulp.src(['scss/**/*.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle : 'compressed'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./css'))
});

gulp.task('watch', ['js', 'scss'], function () {
    gulp.watch('js/**/*.js', ['js'])
    gulp.watch('scss/**/*.scss', ['scss'])
})

gulp.task('production', function() {
    return gulp.src(mainBowerFiles())
        .pipe(concat('js/lib.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest('.'))
})
