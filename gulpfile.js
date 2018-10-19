var gulp = require('gulp'); //引入gulp
util = require('util'); //格式format
os = require('os'); //用来获取计算机的一些信息
sourcemaps = require('gulp-sourcemaps'); //生成sourcemap
sass = require('gulp-sass'); //编译sass
insert = require('gulp-insert'); //在pipe插入指定内容
fileinclude = require('gulp-file-include'); //用来合并html
uglify = require('gulp-uglify'); //压缩js的插件
browserSync = require('browser-sync').create();
clean = require('gulp-clean'); //清除dist目录
del = require('del'); //删除文件
reload = browserSync.reload;
clean = require('gulp-clean'); //清除dist目录

//定义的变量
var components = ['css', 'imgs', 'js', 'font'];
var username = os.hostname().replace(/-.*/, '').toLowerCase(); //获取当前用户名称
var pwd = process.env.PWD || process.cwd(); //当前路径
var path = {
	src: pwd + '/src/', //编译前存放目录
	dist: pwd + '/dist/', //编译后的文件存放在根目录
}

gulp.task('css', () => {
	return gulp.src(path.src + '**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.write())
		.pipe(insert.append('\n#' + username + '{content:"' + getTime() + '"}')) //给文件打上时间戳
		.pipe(gulp.dest(path.dist));
})

gulp.task('html', () => {
	gulp.src(path.src + '**/*.html')
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(gulp.dest(path.dist));
});

//编译js
gulp.task('js', () => {
	gulp.src(path.src + '**/*.js')
		.pipe(uglify())
		.pipe(gulp.dest(path.dist));
});

//图片处理
gulp.task('imgs', () => {
	gulp.src(path.src + 'imgs/**')
		.pipe(gulp.dest(path.dist + 'imgs'));
})

gulp.task('font', () => {
	gulp.src(path.src + 'font/**')
		.pipe(gulp.dest(path.dist + 'font'));
})

gulp.task('build', ['css', 'html', 'js', 'imgs', 'font']);

//监听文件
gulp.task('dev', ['watchFiles', 'webserver']);

//监听文件
gulp.task('watchFiles', () => {
	gulp.watch(path.src+'css/**/*.scss', ['css']).on('change', function (event) {
		showFileChange(event);
		reload;
	})
	gulp.watch(path.src+'html/**/*.html', ['html']).on('change', function (event) {
		showFileChange(event);
	});
	gulp.watch(path.src+'js/**/*.js', ['js']).on('change', function (event) {
		showFileChange(event);
	});
	gulp.watch(path.src+'imgs/**', ['imgs']).on('change', function (event) {
		showFileChange(event);
	});
	console.log("start watching...")
})

//启动本地服务器
gulp.task('webserver', () => {
	// connect.server({
	// 	root: 'style',
	// 	port: 8888
	// });
	browserSync.init({
		server: {
			baseDir: path.dist
		},
		notify: false,
		directory: true,
		port: '8888',
		open: 'external'
	})
})

//清除dist目录
gulp.task('clean', () => {
	return gulp.src(path.dist, {
			read: false
		})
		.pipe(clean());
})

//获取本地时间
function getTime() {
	var now = new Date();
	return timestamp = now.getFullYear().toString() + pad2(now.getMonth() + 1) + pad2(now.getDate()) + pad2(now.getHours()) + pad2(now.getMinutes()) + pad2(now.getSeconds());
}

var pad2 = function (n) {
	return n < 10 ? '0' + n : n
}

/**
 * 监听删除文件操作
 * @param {object} event 
 */
function showFileChange(event) {
	console.log(event.type);
	console.log(event.path);
	if (event.type == 'deleted') {
		var delFile = event.path.replace(path.src, path.dist);
		if (delFile.indexOf('.scss') > -1) {
			delFile = delFile.replace('.scss', '.css');
		}
		del.sync(delFile);
	}
}
