const gulp        = require('gulp');
const rev         = require('gulp-rev');
const del         = require('del');
const revReplace  = require('gulp-rev-replace');

gulp.task('clean', (done) => {
  return del(['build/*']);
});

gulp.task('rev', () => {
  return gulp.src('public/**/*')
      .pipe(rev())
      .pipe(gulp.dest('build/public'))
      .pipe(rev.manifest())
      .pipe(gulp.dest('build/public'));
});

gulp.task('js:server', () => {
  return gulp.src('app.js')
      .pipe(gulp.dest('build'));
});

gulp.task('views', () => {
  return gulp.src('views/**/*')
      .pipe(gulp.dest('build/views'));
});

gulp.task('rev-replace', () => {
  const manifest = gulp.src('build/public/rev-manifest.json');

  return gulp.src('build/views/**/*')
      .pipe(revReplace({
        manifest: manifest,
        replaceInExtensions: ['.ejs']
      }))
      .pipe(gulp.dest('build/views'));
});
