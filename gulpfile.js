// Node & NPM packages
const del = require('del'),
	fs = require('fs'),
	merge = require('merge-stream'),
	path = require('path'),
	gulp = require('gulp'),
	gulpif = require('gulp-if'),
	gch = require('gulp-compile-handlebars'),
	htmlmin = require('gulp-html-minifier-terser'),
	sourcemaps = require('gulp-sourcemaps'),
	rename = require('gulp-rename'),
	zip = require('gulp-zip');

// Custom modules & config
const config = require('./src/config.json'),
	helper = require('./lib/hbHelpers'),
	util = require('./lib/fsUtils'),
	previewUtil = require('./lib/previewSiteUtils');

// Directory structure
const dir = {
	backups:'./src/backups/',
	css:'./src/templates/css/',
	config:'./src/config.json',
	dist:'./build/html/',
	fpo:'./build/fpo/',
	images:'./src/shared_images/',
	preview:'./preview/categories/english/',
	srcBanners:'./src/banners/',
	templates:'./src/templates/',
	modules:'./src/templates/css/modules/',
	zips:'./build/zips/'
}

const b1 = ['english', 'Concept1'],
	b2 = ['english', 'Concept2'],
	b3 = ['english', 'Concept3'],
	b4 = ['english', 'Concept4'],
	b5 = ['english', 'Concept5'],
	b6 = ['english', 'Concept6'];
;

const currentGroup = b1,
	isProduction = true;

function build(version, copyImages=false, showFpoImg='') {

	// console.log('build '+version);
	const config = JSON.parse(fs.readFileSync(dir.config));
	const [ _category, _concept ] = version;
	const groupToLoopThrough = config[_category][_concept];

	let task = Object.entries(groupToLoopThrough).map(function (obj) {
		if (obj[0] === 'group') return;
		
		const _name = obj[0],
			_data = obj[1],
			_dist = util.mkDirByPathSync(path.join(dir.dist, _data.name)),
			_src = path.join(`${dir.srcBanners}${_concept}`, _name),
			_sharedImages = dir.images+_data.width+'x'+_data.height;

		_data['global'] = config.global;
		_data['name'] = _data.name ? _data.name : _name; // use "name" property if listed in config.
		_data['group'] = config[_category][_concept].group;
		_data['size'] = config.global[`${_data.width}x${_data.height}`]; // Set globals by banner size.

		let option = {
			ignorePartials:false,
			batch:[_src, dir.css, dir.templates+'html', dir.templates+'js', dir.templates+'svg', dir.modules],
			helpers : {
				bannerCss: function(){return `${this.name}.css` },
				getCss: function () { return this.cssToUse ? this.cssToUse : `${this.width}x${this.height}.css`; },
				cssCheck: function () { return util.fileCheck(`${dir.srcBanners}${this.name}/${this.name}.css.hbs`) },
				sharedCss: function(){ return `${this.width}x${this.height}.css` },
				isHorizontal: function(scope){ return scope.height <= 90 },
				isModMobile: function(scope){ return scope.height <= 50 },
				isMobile: function(){ return this.height == 50 },
				isLeader: function(){ return this.width >= 728 },
				getBannerTimelineJs: function () { return this.jsToUse ? this.jsToUse : this.size.jsToUse ? this.size.jsToUse :  `timelineDefault.js`; },
				isNextLast: function (index, length) { return index == length-2; },
				getCta1Txt: function (scope) { return this.cta?.txt1 ? this.cta?.txt1 : scope.group.cta1Txt; },
				getCta2Txt: function (scope) { return this.cta?.txt2 ? this.cta?.txt2 : scope.group.cta2Txt; },
				showFpo: function() { return showFpoImg; },
				getName : function(arg){ return arg},
				int2: function(num){ return parseInt(num) + 2 },
				int: helper.int,
				times: helper.times,
				if_eq: helper.if_eq
			}
		}

		const minOptions = { collapseWhitespace: true, minifyCSS:true, minifyJS:true, removeComments:true };

		let _html = gulp.src(dir.templates+'html/main.html.hbs')
			.pipe(gch(_data, option))
			.pipe(gulpif(isProduction,sourcemaps.init()))
			.pipe(gulpif(isProduction, htmlmin(minOptions)))
			.pipe(rename('index.html'))
			.pipe(gulpif(isProduction,sourcemaps.write('./')))
			.pipe(gulp.dest(_dist));

		if(copyImages){
			let _images = gulp.src([_sharedImages+'/**', `${_src}/images/**`]).pipe(gulp.dest(_dist+'/images/'));

			if(showFpoImg){
				let _fpoDir = util.mkDirByPathSync(path.join(dir.fpo, _data.name))
				let _fpo = gulp.src(`${_src}/fpo/**`).pipe(gulp.dest(_fpoDir));
			}

			return merge(_html, _images);
		}
		return _html;
	});
	let lastStream = task[task.length-1];
	return lastStream;
}

// Copy Backup Imgs to build
function copyBackups(){

	return gulp.src(dir.backups+'**').pipe(gulp.dest(dir.dist));
	/*let _pngs = gulp.src(dir.backups+'*.png')
		.pipe(buffer())// DEV: We must buffer our stream into a Buffer for imagemin
		.pipe(imagemin([pngquant({quality: [0.2, 0.6]})]));

	let _jpgs = gulp.src(dir.backups+'*.jpg');

	return merge(_pngs, _jpgs).pipe(gulp.dest(dir.dist));*/
};

function zipFiles(){

	let groupFolders = util.getFolders(dir.dist);

	let task = groupFolders.map(function(folder) {
		let _dist = path.join(dir.dist, folder),
			_name = path.basename(folder);

		let _html = gulp.src(_dist+'/index.html')
			.pipe(rename(`${_name}.html`))// Rename html for trafficking

		let _assets = gulp.src([_dist+'/images/**',_dist+'/*.js'],{base:_dist})

		// Zip up named HTML and images folder
		return merge(_html, _assets)
			.pipe(zip(_name+'.zip'))
			.pipe(gulp.dest(dir.zips));

	});
	let lastStream = task[task.length-1];
	return lastStream;
};

function previewCatConfig(){

	let _data = config;

	let option = {
		ignorePartials:false,
		batch:[ dir.templates+'/js'],
		helpers : {
			isStatics : function(){ return !util.isDirEmpty('./build/statics')},
			imgList : function(){ return previewUtil.getImgFiles('./build/statics')}
		}
	}
	return gulp.src(dir.templates+'/js/contentDataSinglePage.js.hbs')
		.pipe(gch(_data, option))
		.pipe(rename('contentData.js'))
		.pipe(gulp.dest(dir.preview));
};

gulp.task('backups', copyBackups);

// Build tasks
gulp.task('build', () => { return build(currentGroup, false, '') });
gulp.task('b1', () => { return build(b1, false, '') });
gulp.task('b2', () => { return build(b2, false, '') });
gulp.task('b3', () => { return build(b3, false, '') });
gulp.task('b4', () => { return build(b4, false, '') });
gulp.task('b5', () => { return build(b5, false, '') });
gulp.task('b6', () => { return build(b6, false, '') });


gulp.task('build:img', () => { return build(currentGroup, true, '') });
gulp.task('bi1', () => { return build(b1, true, '') });
gulp.task('bi2', () => { return build(b2, true, '') });
gulp.task('bi3', () => { return build(b3, true, '') });
gulp.task('bi4', () => { return build(b4, true, '') });
gulp.task('bi5', () => { return build(b5, true, '') });
gulp.task('bi6', () => { return build(b6, true, '') });

gulp.task('all', gulp.series('b1','b2','b3','b4','b5','b6'));
gulp.task('build:all', gulp.series('bi1','bi2','bi3','bi4','bi5','bi6'));

// Inject FPO JPGs to check alignment
gulp.task('fpo1', () => { return build(currentGroup, true, 'FPO_Layer Comp 1.jpg')});
gulp.task('fpo2', () => { return build(currentGroup, true, 'FPO_Layer Comp 2.jpg')});
gulp.task('fpo3', () => { return build(currentGroup, true, 'FPO_Layer Comp 3.jpg')});
gulp.task('fpo4', () => { return build(currentGroup, true, 'FPO_Layer Comp 4.jpg')});
gulp.task('fpo5', () => { return build(currentGroup, true, 'FPO_Layer Comp 5.jpg')});
gulp.task('fpo6', () => { return build(currentGroup, true, 'FPO_Layer Comp 6.jpg')});

// Clean Tasks
gulp.task('clean', () => { return del([dir.dist+'**/*']); });
gulp.task('clean:backups', (done) => { return del([dir.dist+'*png',dir.dist+'*jpg'], done); });
gulp.task('clean:fpo', () => { return del([dir.fpo+'**']); });
gulp.task('clean:zips', () => { return del([dir.zips+'**']); });
gulp.task('clean:all', gulp.parallel('clean','clean:zips') );

// Watch Tasks
gulp.task('watch', () => { return gulp.watch([dir.srcBanners+'*/**', dir.templates+'*/**', dir.config], gulp.series('default'))});
gulp.task('w1', () => { return gulp.watch([dir.srcBanners+'*/**', dir.templates+'*/**', dir.config], gulp.series('fpo1'))});
gulp.task('w2', () => { return gulp.watch([dir.srcBanners+'*/**', dir.templates+'*/**', dir.config], gulp.series('fpo2'))});
gulp.task('w3', () => { return gulp.watch([dir.srcBanners+'*/**', dir.templates+'*/**', dir.config], gulp.series('fpo3'))});
gulp.task('w4', () => { return gulp.watch([dir.srcBanners+'*/**', dir.templates+'*/**', dir.config], gulp.series('fpo4'))});
gulp.task('w5', () => { return gulp.watch([dir.srcBanners+'*/**', dir.templates+'*/**', dir.config], gulp.series('fpo5'))});
gulp.task('w6', () => { return gulp.watch([dir.srcBanners+'*/**', dir.templates+'*/**', dir.config], gulp.series('fpo6'))});

gulp.task('zip', zipFiles);
// gulp.task('all', gulp.series('clean:all', 'build:all', 'backups'));
gulp.task('default', gulp.series('build'));
gulp.task('p', previewCatConfig);
