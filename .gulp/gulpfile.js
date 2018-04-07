var gulp = require("gulp");
var webserver = require("gulp-webserver");

gulp.task("webserver", function () {
    var options = {
    };

    gulp.src("..").pipe(webserver(options));
});
