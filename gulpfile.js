'use strict';

// All used modules.
var babel = require('gulp-babel');
var gulp = require('gulp');
var livereload = require('gulp-livereload');
var runSeq = require('run-sequence');

// Development tasks
// --------------------------------------------------------------

// Live reload business.
gulp.task('reload', function () {
    livereload.reload();
});

gulp.task('default', function () {

    livereload.listen();
	
    gulp.watch(['client/js/*.js'], function () {
		runSeq('reload');
	});
	
    gulp.watch(['server/game/*.js'], function () {
		setTimeout(function(){
			runSeq('reload');
		}, 1000);
	});
    return gulp.src(['./client/js/*.js'])
	.pipe(babel());
	
});
