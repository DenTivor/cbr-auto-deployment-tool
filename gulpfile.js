var gulp = require('gulp');
var sftp = require('gulp-sftp');
var wait = require('gulp-wait');
var exec = require('gulp-exec');
var shell = require('gulp-shell')


var portletPath = '/opt/ibm/WebSphere/Profiles/wp_profile/installedApps/wp615vm/PA_claim-typology.ear/claim-typology.war';
var jsPath = 'cbr-claims/claim-typology/src/main/webapp/javascripts/custom';
var jsFiles = [
	jsPath + '/typology_main.js',
	jsPath + '/typology_event_mapping.js',
]
var javaFiles = [
	'cbr-claims/claim-typology/target/claim-typology/WEB-INF/classes/com/accenture/abc/claimtypology/TypologyModel.class'
]


var paths = {
  js :   {src : jsFiles,
  		  dest : portletPath + '/javascripts/custom' },
  jsp:   {src: ['../transfer/TypologyScreen.jsp','../transfer/TypologyScreen_DATA.jsp'],
  		  dest : portletPath + '/WEB-INF/views/jsp/'},
  java:  {src : javaFiles,
  		  dest : portletPath + '/WEB-INF/classes/com/accenture/abc/claimtypology/'},
  flow: {src: ['../transfer/typologyFlow.xml'],
        dest : portletPath + '/WEB-INF/flows/'},
  classes: {src: ['cbr-claims/claim-typology/src/main/java/com/accenture/abc/claimtypology/TypologyModel.java'],
        root: '/home/vertigo/projects/cbr-claims/claim-typology/',
        },
  integration: {src: ['claims-pl-common/CLM_PL_INTEGRATION/src/main/java/com/accenture/cbr/**/*.java'],
        root: '/home/vertigo/projects/claims-pl-common/CLM_PL_INTEGRATION/',
        target: '/home/vertigo/projects/claims-pl-common/CLM_PL_INTEGRATION/target/CLM_PL_INTEGRATION-1.0.0.jar',
        remotePath: '/opt/ibm/mcp/'
        },
  bhintegrations: {
        target: ['claims-bh-all/BPM/BPM_INTEGRATION/target/bpm-integration-1.0.0.jar',
                 'claims-bh-all/CLAIMS/CLM_INTEGRATION/target/clm-integration-1.0.0.jar',
                 'claims-pl-common/CLM_PL_INTEGRATION/target/CLM_PL_INTEGRATION-1.0.0.jar'],
        remotePath: '/opt/ibm/mcp/'
  }
  // prodfiles : ["build/*.html", "build/scripts/*.js", "build/styles/*.css"]
};


var sftpOptions = {
	  host: 'host',
    user: 'user',
    pass: 'pass'
};


gulp.task('default', function() {
  console.log("Started");
});


gulp.task('watch:source', function () {
  gulp.watch(paths.js.src, ['deploy:js']);
  gulp.watch(paths.jsp.src, ['deploy:jsp']);
  // gulp.watch(paths.java.src, ['deploy:java']);
  gulp.watch(paths.flow.src, ['deploy:flow']);

  gulp.watch(paths.classes.src, ['deploy:java']);
  gulp.watch(paths.integration.src, ['deploy:integration']);
});


gulp.task('deploy:java',['portlet:compile'], function() {
  console.log("java changed");
  var opt = sftpOptions;
  opt.remotePath = paths.java.dest;

  return gulp.src(paths.java.src)
    .pipe(sftp(opt));
});


gulp.task('deploy:js', function() {
  console.log("js changed");
  var opt = sftpOptions;
  opt.remotePath = paths.js.dest;

  return gulp.src(paths.js.src)
    .pipe(sftp(opt));
});


gulp.task('deploy:jsp', function() {
  console.log("jsp changed");
  var opt = sftpOptions;
  opt.remotePath = paths.jsp.dest;

  return gulp.src(paths.jsp.src)
    .pipe(wait(3050))
    .pipe(sftp(opt));
});


gulp.task('deploy:flow', function() {
  console.log("flow changed");
  var opt = sftpOptions;
  opt.remotePath = paths.flow.dest;

  return gulp.src(paths.flow.src)
    .pipe(wait(1050))
    .pipe(sftp(opt));
});


gulp.task('deploy:integration', ['integration:compile'], function() {
  console.log("integration changed");
  var opt = sftpOptions;
  opt.remotePath = paths.integration.remotePath;

  return gulp.src(paths.integration.target)
    .pipe(wait(1050))
    .pipe(sftp(opt));
});


gulp.task('portlet:compile', function() {
  console.log("portlet compile");

  return gulp.src(paths.classes.root)
    // .pipe(exec('mvn clean install -PskinnyWar'));
    .pipe(shell('cd cbr-claims/claim-typology && mvn clean install -PskinnyWar'));
});


gulp.task('integration:compile', function() {
  console.log("integratiom compile");

  return gulp.src(paths.integration.root)
    .pipe(shell('cd claims-pl-common/CLM_PL_INTEGRATION && mvn clean install'));
});


gulp.task('deploy:bhlibs', function() {
  console.log("BH integrations deploying");
  var opt = sftpOptions;
  opt.remotePath = paths.bhintegrations.remotePath;

  return gulp.src(paths.bhintegrations.target)
    .pipe(wait(1050))
    .pipe(sftp(opt));
}); 