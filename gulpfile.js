var gulp = require('gulp')
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var ngAnnotate = require('gulp-ng-annotate')
var sass = require('gulp-sass')
var gulpFilter = require('gulp-filter')
var bower = require('main-bower-files');
var cssnano = require('gulp-cssnano');

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

var dist = {
    js : 'public/',
    css : 'public/',
    vendor : 'public/'
}


gulp.task('bower', function() {
    var jsFilter = gulpFilter('**/*.js')
    var cssFilter = gulpFilter('**/*.css')
    return gulp.src(bower())
        .pipe(jsFilter)
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dist.js))
        //.pipe(jsFilter.restore)
        //.pipe(cssFilter)
        //.pipe(concat('vendor.css'))
        //.pipe(gulp.dest(dist.css))
        //.pipe(cssFilter.restore)
/*        .pipe(rename(function(path) {
            if (~path.dirname.indexOf('fonts')) {
                path.dirname = '/fonts'
            }
        }))*/
        .pipe(gulp.dest(dist.vendor))
})


gulp.task('bower-css', function() {
    var files = [
        'bower_components/angular-gridster/dist/angular-gridster.min.css',
        'bower_components/nvd3/build/nv.d3.min.css',
        'bower_components/angular-material/angular-material.min.css',
    ]

    return gulp.src(files)
        .pipe(concat('vendor.css'))
        .pipe(cssnano())
        .pipe(gulp.dest(dist.css))
})
