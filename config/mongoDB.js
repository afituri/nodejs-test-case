'use strict';
var domain = require('domain').create();
var mongoose = require( 'mongoose' );
var config = require( './index.js' );


domain.on('error', function(er) {
  console.log('There is an error in the DB');
});

domain.run(function() {
  mongoose.connect(config.mongoURI);
});
