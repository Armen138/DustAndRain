var fs = require('fs');
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var zip = require('gulp-zip');
var del = require('del');
var gutil = require('gulp-util');

var paths = {
    archive: 'build/**/*',
    client: 'js/**/*.js',
    server: ['server/simplex.js', 'server/server.js'],
    html: 'html/*.html'
};

gulp.task('clean', function(cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    del(['build'], cb);
});

gulp.task('html', function() {
    return gulp.src(paths.html)
        .pipe(gulp.dest('build'));
});
gulp.task('client', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.client)
    //.pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(concat('client.min.js'))
    //.pipe(sourcemaps.write())
    .pipe(gulp.dest('build/js'));
});

gulp.task('server', function() {
    return gulp.src(paths.server)
        //.pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('server.min.js'))
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('build/server'));
});

gulp.task('build', ['html', 'client', 'server']);

gulp.task('package', ['build'], function() {
    return gulp.src(paths.archive)
        .pipe(zip('js13k.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('verify', ['package'], function() {
    var archive = 'dist/js13k.zip';
    var stat = fs.statSync(archive);
    var out = (stat.size / 1024);
    var left = 13 - out;
    gutil.log("Size: ",gutil.colors.green('13k - '), gutil.colors.red(out.toFixed(2) + 'k ')," = ",gutil.colors.cyan(left.toFixed(2) + 'k'));

    var readme = '' + fs.readFileSync('README.md');
    readme = readme.replace(/zipped size: \*\*.*?\*\*/, 'zipped size: **' + out.toFixed(2) + 'kb**');
    readme = readme.replace(/last build:  \*\*.*?\*\*/, 'last build:  **' + new Date() + '**');
    fs.writeFileSync('README.md', readme);
    //console.log('13k - ' + out.toFixed(2) + 'k = ' + left.toFixed(2) + 'k');
});
gulp.task('default', ['verify']);
