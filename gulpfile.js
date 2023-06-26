"use strict"

const {src, dest} = require("gulp")
const gulp = require("gulp")
const autoprefixer = require("gulp-autoprefixer")
const cssbeautify = require("gulp-cssbeautify")
const removeComments = require("gulp-strip-css-comments")
const rename = require("gulp-rename")
const less = require("gulp-less")
const cssnano = require("gulp-cssnano")
const uglify = require("gulp-uglify")
const rigger = require("gulp-rigger")
const plumber = require("gulp-plumber")
const panini = require("panini")
const imagemin = require("gulp-imagemin")
const webp = require("gulp-webp")
const htmlmin = require("gulp-htmlmin")
const del = require("del")
const notify = require("gulp-notify")
const browserSync = require("browser-sync").create()

// paths
const srcPath = "src/"
const distPath = "dist/"

const path = {
    build: {
        html: distPath,
        css: distPath + "assets/css/",
        js: distPath + "assets/js/",
        images: distPath + "assets/images/",
        fonts: distPath + "assets/fonts/"
    },
    src: {
        html: srcPath + "*.html",
        css: srcPath + "assets/less/**/*.less",
        js: srcPath + "assets/js/*.js",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,ico,webp,xml,json,gif,webmanifest}",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,ttf,woff2,svg}"
    },
    watch: {
        html: srcPath + "**/*.html",
        css: srcPath + "assets/less/*.less",
        js: srcPath + "assets/js/**/*.js",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,ico,webp,xml,json,gif,webmanifest}",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,ttf,woff2,svg}"
    },
    clean: "./" + distPath
}

function server() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        }
    });
}

function html() {
    panini.refresh()
    return src(path.src.html, {base: srcPath})
        .pipe(plumber())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({stream: true}));
}

function css() {
    return src(path.src.css, {base: srcPath + "assets/less/"})
        .pipe(plumber())
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}));
}

function js() {
    return src(path.src.js, {base: srcPath + "assets/js/"})
        .pipe(plumber())
        .pipe(rigger())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));
}

function images() {
    return src(path.src.images, {base: srcPath + "assets/images/"})
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 80, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {
                        name: 'removeViewBox',
                        active: true
                    },
                    {
                        name: 'cleanupIDs',
                        active: false
                    }
                ]
            })
        ]))
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({stream: true}));
}

function webpinize() {
    return src(path.src.images, {base: srcPath + "assets/images/"})
    .pipe(webp())
    .pipe(dest(path.build.images))
    .pipe(browserSync.reload({stream: true}));
}

function clean() {
    return del(path.clean)
}

function fonts() {
    return src(path.src.fonts, {base: srcPath + "assets/fonts/"})
    .pipe(dest(path.build.fonts))
    .pipe(browserSync.reload({stream: true}));
}

function watchFiles() {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.images], images)
    gulp.watch([path.watch.fonts], fonts)
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images, webpinize, fonts))
const watch = gulp.parallel(build, watchFiles, server)


exports.html = html
exports.css = css
exports.js = js
exports.images = images
exports.webpinize = webpinize
exports.clean = clean
exports.fonts = fonts
exports.build = build
exports.watch = watch
exports.default = watch

