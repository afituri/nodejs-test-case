'use strict';

var Transactions = require( '../models/transactions.model.js' );
var User = require( '../models/user.model.js' );
var config = require( '../config' );
var Stripe = require( 'stripe' )( config.stripeApiKey );

exports.index = function( req, res, next ) {
    if ( req.body ) {
        var transaction = new Transactions( {
            name: req.body.name
        } );
        transaction.save( function( err, trans ) {
            if ( err ) {
                return res.status(400).send({
                    success: false,
                    message: 'Something went wrong'
                });
            }
            res.status( 200 ).end();
        } );
    }
};

exports.createTransaction = function( req, res, next ) {

    Stripe.customers.create({
        source: req.body.token,
        description: 'payinguser@example.com'
    }).then(function(customer) {
        Stripe.charges.create({
            amount: req.body.amount, // amount in cents, again
            currency: req.body.currency,
            customer: customer.id
        });
    }).then(function(charge) {
// YOUR CODE: Save the customer ID and other info in a database for later!
        User.findOne({_id : req.body.user}, function(err, user){
            user.customer= customer.id;
            user.save(function(err,result){
                var transaction = new Transactions( {
                    transactionId: charge.id,
                    amount: charge.amount,
                    created: charge.created,
                    currency: charge.currency,
                    description: charge.description,
                    paid: charge.paid,
                    sourceId: charge.source.id
                });
                transaction.save( function( err ) {
                    if ( err ) {
                        return res.status(400).send({
                            success: false,
                            message: 'Something went wrong'
                        });
                    }
                    else {
                        return res.status( 200 ).json( {
                            success: true,
                            message: 'Payment is created.'
                        } );
                    }
                });
                    // asynchronously called
            });
        });
            //handling errors
    }).catch(function(err){
        return res.status(400).send({
            success: false,
            message: 'Something went wrong'
        });
    });
};

/***********add charge if user chose existing card**************/
exports.createExisting = function( req, res, next ) {

    User.findOne({_id : req.body.user}, function(err, user){
        if ( err ) {
            return res.status(400).send({
                success: false,
                message: 'Something went wrong'
            });
        }
        Stripe.charges.create({
          amount: req.body.amount, // amount in cents, again
          currency: req.body.currency,
          customer: user.customer // Previously stored, then retrieved
        }).then(function(charge) {
            var transaction = new Transactions( {
                transactionId: charge.id,
                amount: charge.amount,
                created: charge.created,
                currency: charge.currency,
                description: charge.description,
                paid: charge.paid,
                sourceId: charge.source.id
            });
            transaction.save( function( err ) {
                if ( err ) {
                    return res.status(400).send({
                        success: false,
                        message: 'Something went wrong'
                    });
                }
                else {
                    return res.status( 200 ).json( {
                        message: 'Payment is created.'
                    } );
                }
            });
        }).catch(function(err){
            return res.status( 400 ).send( {
                success: false,
                message: 'Something went wrong please try again later'
            } );
        });
    })
};
