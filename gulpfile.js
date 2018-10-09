const gulp = require('gulp');

const peterparker = '/Users/daviddalbusco/Documents/projects/peterparker';

// Copy db config

gulp.task('local', () => {
    return gulp
        .src(peterparker + '/config/localhost/*')
        .pipe(gulp.dest('./config/'));
});

gulp.task('prod', () => {
    return gulp
        .src(peterparker + '/config/prod/*')
        .pipe(gulp.dest('./config/'));
});

// Copy config and resources

gulp.task('resources', () => {
    gulp.src(peterparker + '/config/amazon.js')
        .pipe(gulp.dest('./config/'));

    gulp.src(peterparker + '/config/constants.js')
        .pipe(gulp.dest('./config/'));

    gulp.src(peterparker + '/config/parser.js')
        .pipe(gulp.dest('./config/'));
});