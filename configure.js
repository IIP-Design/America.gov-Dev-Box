var async = require('async'),
	fse = require('fs-extra'),
	path = require('path'),
	replaceStream = require('replacestream'),
	randomstring = require("randomstring"),
	prompt = require('prompt'),
	wp = require('wp-cli'),
	spawn = require('child_process').spawn;

var child,
	tasks = [];

msg('In vagrant box');

function msg( msg ) {
	console.log( msg) ;
}

tasks = [
	verifyConnection,
	createSalts,
	copyEnvvar,
	loginnAsRoot,
	apacheRestart
	moveConfig3,
	editConfig4,
	promptToTest,
	convertToMultisite,
	editConfig3,
	replaceHtAccess,
	promptToTest,
	editconfig6,
	activateExtender,
	enableBaseTheme,
	addSites,
	updateHosts
	activateBaseTheme,
]

// Runs on load
async.waterfall( tasks, function ( err, result ) {
    if( err ) {
    	
    	msg( 'Uh oh, something went wrong...  ');
    }
    msg("-------  Process complete -----------\nYou should now have a basic development environment, that doesn't include any data.");
});

function whereAmI() {
	 msg( 'In directory ' + process.cwd() ); 
}

function verifyConnection( callback ) {
	msg('Logged into vagrant box.'); 
	callback();
}
 
// next taks to to execute from vagrant box (need sudo)
function createSalts( callback ) {
	msg( 'Creating salts... ' ); 

	fileTpl = 'templates/envvar.tpl.conf';   	
	file = 	'templates/envvar.conf';				

	w = fse.createWriteStream( file );
	r = fse.createReadStream( fileTpl );

	// search and replace and pipe
	r.pipe( replaceStream( '<%salt1%>', randomstring.generate()) )
	 .pipe( replaceStream( '<%salt2%>', randomstring.generate()) )
	 .pipe( replaceStream( '<%salt3%>', randomstring.generate()) )
	 .pipe( replaceStream( '<%salt4%>', randomstring.generate()) )
	 .pipe( replaceStream( '<%salt5%>', randomstring.generate()) )
	 .pipe( replaceStream( '<%salt6%>', randomstring.generate()) )
	 .pipe( replaceStream( '<%salt7%>', randomstring.generate()) )
	 .pipe( replaceStream( '<%salt8%>', randomstring.generate()) )
	 .pipe(w);

	callback();
}

function copyEnvvar( callback ) {
	msg('Moving envvar.conf file...');

	fse.move( 'templates/envvar.conf', '/etc/httpd/envvar.conf', function ( err ) {
  		msg('moved')
  		callback();
	});
}

function apacheRestart( callback ) {
	msg( 'Restating apache... ' ); 

	child = spawn('apachectl', ['restart']);

    msg('Restarting apache');

    child.stdout.on('data', function (data) {
	  msg('stdout: ' + data);
	});

	child.stderr.on('data', function (data) {
	  msg('stderr: ' + data);
	});

	child.on('close', function (code) {
	 	msg( 'child process exited with code ' + code );
	 	callback();
	});
}

function moveConfig3( callback ) {
	msg('Moving wp-config.php to www folder');
	
	fse.move( 'wp-config.php', 'www/wp-config.php', function ( err ) {
  		callback();
	});
}

function editConfig4( callback ) {
	msg('Editing config...');
	
	fse.move( 'templates/wp-config.tpl-2.php', 'www/wp-config.php', function ( err ) {
  		callback();
	});
}

function promptToTest( callback ) {
	prompt.start();
	prompt.get(['Confirm that you can still connect to the DB by:\n 1. Go to http://america.dev toverify frontend loads\n 2. Confirm that you can login to http://america.dev/wp/wp-login.php.\n3. If login successful, hit enter to continue..'], function() {
		callback();
	});
}

function convertToMultisite () {
	msg('Converting to multisite installation...');

	wp.discover({path:'www/wp', user: 'admin:admin'}, function (wp) {
    	wp.core.multisite-convert( '--subdomains', function( err, result ) { //get CLI info
        	msg( result );
    	});  
	});
}

function editconfig4( callback ) {
	msg('Completing multisite installation...');
	
	fse.move( 'templates/wp-config.tpl-4.php', 'www/wp-config.php', function ( err ) {
  		callback();
	});
}

function replaceHtAccess( callback ) {
	msg('Moving .htaccess file...');
	
	fse.move( 'templates/.htaccess', 'www/.htaccess/Applications/MAMP/bin/php/php5.6.2/bin', function ( err ) {
  		callback();
	});
}

function promptToTest( callback ) {
	prompt.start();
	prompt.get(['Make sure you can still access the http://america.dev, and that you can login: http://america.dev/wp-login.php.\n Note: The login url changed! After verification, hit Enter to continue...'], function() {
		callback();
	});
}

function editconfig5( callback ) {
	msg('Enabling domain mapping...');
	
	fse.move( 'templates/wp-config.tpl-5.php', 'www/wp-config.php', function ( err ) {
  		callback();
	});
}


function activateExtender( callback ) {
	msg('Activating America Theme Extender...');

	wp.discover({path:'www/wp', user: 'admin:admin'}, function (wp) {
    	wp.plugin.activate( 'America Theme Extender', function( err, result ) { 
        	msg( result );
    	});  
	});
}


function enableBaseTheme( callback ) {
	msg('Network enabling America.gov Base Theme...');

	wp.discover({path:'www/wp', user: 'admin:admin'}, function (wp) {
    	wp.theme.enable( 'America.gov Base Theme', '--network', function( err, result ) { 
        	msg( result );
    	});  
	});
}

function addSites( callback ) {
	msg('Adding sites to the network...');

	wp.discover({path:'www/wp', user: 'admin:admin'}, function (wp) {
    	wp.site.create( 'climate', function( err, result ) { 
        	msg( result );
    	}); 
    	wp.site.create( 'interactive', function( err, result ) { 
        	msg( result );
    	}); 
    	wp.site.create( 'facts', function( err, result ) {
        	msg( result );
    	}); 
    	wp.site.create( 'docs', function( err, result ) {
        	msg( result );
    	});  
	});
}

function upateHosts( callback ) {
	msg('Update hosts')
}

function activateBaseTheme( callback ) {
	msg('activateBaseTheme')
}

