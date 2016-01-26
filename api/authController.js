'use strict';

var User = require( '../models/user.model.js' );
var jwt = require( 'jsonwebtoken' );
var config = require( '../config' );

exports.index = function( req, res ) {

    // find the user
    User.findOne( {
        name: req.body.name
    }, function( err, user ) {

        if ( err ) {
            return res.status(400).send({
                message: 'Something went wrong'
            });
        }

        if ( !user ) {
            res.json( {
                success: false,
                message: 'Authentication failed. User not found.'
            } );
        }
        else if ( user ) {
            user.comparePassword( req.body.password, function( err, isMatch ) {
                if ( err ) {
                    return res.status( 200 ).json( {
                        success: false,
                        message: 'Something went wrong, please try again later'
                    } );
                }
                if(!isMatch) {
                    return res.status( 401 ).json( {
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    } );
                }

                // if user is found and password is right
                // create a token
                var token = jwt.sign( user, config.secret, {
                    expiresIn: 1440 // expires in 24 hours
                } );
                var exist = false;
                if(user.customer){
                    exist = true;
                }

                // return the information including token as JSON
                res.render( 'transactions', {
                    token: token,
                    user:user._id,
                    exist: exist,
                    title: 'Transactions Page'
                } );

            } );
        }

    } );
};

exports.register = function( req, res ) {

    // find the user
    User.findOne( {
        name: req.body.name
    }, function( err, user ) {

        if ( err ) {
            return res.status(400).send({
                message: 'Something went wrong'
            });
        }

        if ( user ) {
            res.json( {
                success: false,
                message: 'Register failed. Username is not free'
            } );
        }
        else {
            user = new User( {
                name: req.body.name,
                password: req.body.password
            } );
            user.save( function( err ) {
                if ( err ) {
                    return res.status(400).send({
                        success: false,
                        message: 'Something went wrong'
                    });
                }

                // if user is found and password is right
                // create a token
                var token = jwt.sign( user, config.secret, {
                    expiresIn: 1440 // expires in 24 hours
                } );

                // return the information including token as JSON
                res.render( 'transactions', {
                    token: token,
                    user:user._id,
                    exist:false,
                    title: 'Transactions Page'
                } );
            } );
        }

    } );
};
