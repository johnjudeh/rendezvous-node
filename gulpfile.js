const gulp  = require('gulp');
const rev   = require('gulp-rev');

gulp.task('default', defaultTask);

function defaultTask(done) {
  // put your default task here
  return gulp.src('public/*')
      .pipe(gulp.dest('build'))
      .pipe(rev())
      .pipe(gulp.dest('build'));

  // done();
}
