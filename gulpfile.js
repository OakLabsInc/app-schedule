const { join } = require('path')
const gulp = require('gulp')
const watch = require('gulp-watch')
const stylus = require('gulp-stylus')
const pug = require('gulp-pug')
const nib = require('nib')

const SRC_PATH = join(__dirname, 'src', 'admin')
const DIST_PATH = join(__dirname, 'src', 'admin', 'public')

gulp.task('stylus', function () {
  return watch(
    join(join(SRC_PATH, '**', '*.styl')),
    {
      ignoreInitial: false
    }
  )
    .pipe(
      stylus({
        use: nib(),
        compress: false,
        translate_tabs_to_spaces: false
      })
    )
    .pipe(gulp.dest(DIST_PATH))
})

gulp.task('pug', function () {
  return watch(
    [join(SRC_PATH, '**', '*.pug'), '!' + join(SRC_PATH, 'includes', '*.pug')],
    { ignoreInitial: false }
  )
    .pipe(
      pug({
        pretty: true
      })
    )
    .pipe(gulp.dest(DIST_PATH))
})

gulp.task('default', gulp.parallel('stylus', 'pug'))
