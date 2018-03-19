const revReplace  = require('gulp-rev-replace'),
      server      = require('gulp-develop-server'),
      filter      = require('gulp-filter'),
      babel       = require('gulp-babel');
      gulp        = require('gulp'),
      rev         = require('gulp-rev'),
      del         = require('del');

// Deletes contents of build folder
gulp.task('clean', (done) => {
  return del(['build/*']);
});

// Transpiles app.js and moves to build
gulp.task('js:server', () => {
  return gulp.src('app.js')
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(gulp.dest('build/'));
});

// Transpiles routes and moves to build
gulp.task('js:routes', () => {
  return gulp.src('routes/*')
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(gulp.dest('build/routes'));
});

// Transpiles models and moves to build
gulp.task('js:models', () => {
  return gulp.src('models/*')
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(gulp.dest('build/models'));
})

// Transpiles to ES5, revs static assets and moves files to build
gulp.task('rev-babel', () => {
  const noSwFilter = filter(['**', '!public/sw.js', '!public/js/sw/*'], { restore: true });
  const jsFilter = filter('**/*.js', { restore: true });

  return gulp.src(['public/**/*', '!public/js/maps.js', '!public/manifest.json'])
      .pipe(jsFilter)
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(jsFilter.restore)
      .pipe(noSwFilter)
      .pipe(rev())
      .pipe(noSwFilter.restore)
      .pipe(gulp.dest('build/public'))
      .pipe(rev.manifest('build/public/rev-manifest.json', {
        base: 'build/public',
        merge: true
      }))
      .pipe(gulp.dest('build/public'));
});

// Deals seperately with maps.js as it contains
// paths that need to be rev-replaced
gulp.task('maps:rev-babel', () => {
  const manifest = gulp.src('build/public/rev-manifest.json');

  return gulp.src('public/js/maps.js', {base: 'public'})
      .pipe(revReplace({
        manifest: manifest,
        replaceInExtensions: ['.js']
      }))
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(rev())
      .pipe(gulp.dest('build/public'))
      .pipe(rev.manifest('build/public/rev-manifest.json', {
        base: 'build/public',
        merge: true
      }))
      .pipe(gulp.dest('build/public'));
});

// Deals seperately with manifest.json as it contains
// paths that need to be rev-replaced
gulp.task('manifest:rev-babel', () => {
  const manifest = gulp.src('build/public/rev-manifest.json');

  return gulp.src('public/manifest.json', {base: 'public'})
      .pipe(revReplace({
        manifest: manifest,
        replaceInExtensions: ['.json']
      }))
      .pipe(rev())
      .pipe(gulp.dest('build/public'))
      .pipe(rev.manifest('build/public/rev-manifest.json', {
        base: 'build/public',
        merge: true
      }))
      .pipe(gulp.dest('build/public'));
});


// Moves views to build and replaces revved file references
gulp.task('views:rev-replace', () => {
  const manifest = gulp.src('build/public/rev-manifest.json');

  return gulp.src('views/**/*')
      .pipe(revReplace({
        manifest: manifest,
        replaceInExtensions: ['.ejs']
      }))
      .pipe(gulp.dest('build/views'));
});

// Replaces revved file references in service worker
gulp.task('sw:rev-replace', () => {
  const manifest = gulp.src('build/public/rev-manifest.json');

  return gulp.src('build/public/*.js')
      .pipe(revReplace({
        manifest: manifest,
        replaceInExtensions: ['.js']
      }))
      .pipe(gulp.dest('build/public'));
});

// Starts the development server
gulp.task('server', () => {
    server.listen({
      path: './app.js',
      cwd: './build'
    });
});

// Watches build folder for changes and restarts server
gulp.task('watch', () => {
    gulp.watch('./build/**/*', server.restart);
});

// Default task run by the gulp command
gulp.task('default',
    gulp.series('clean',
        gulp.parallel('rev-babel', 'js:server', 'js:routes', 'js:models'),
        gulp.parallel('maps:rev-babel', 'manifest:rev-babel'),
        gulp.parallel('views:rev-replace', 'sw:rev-replace'),
        'server'
    )
);
