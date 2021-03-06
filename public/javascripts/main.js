'use strict';

/*global Stripe:true*/
/*global $form:true*/

//set Public key for Stripe payments
Stripe.setPublishableKey( 'pk_test_85VyP3zKQsCiE2XQZAGXHQhb' );
var isSubmit = false;
$( document ).ready( function() {
    var msgtype = "success", msg ="Success";
    $( '#submittransaction' ).click( function() {
        if ( !isSubmit ) {
            Stripe.card.createToken( {
                number: $( '.card-number' ).val(),
                cvc: $( '.card-cvc' ).val(),
                exp_month: $( '.card-expiry-month' ).val(),
                exp_year: $( '.card-expiry-year' ).val()
            }, function( status, response ) {
                if ( response.error ) {
                    // Show the errors on the form
                    custNotify('danger',"Error",response.error.message,"bounceIn","bounceOut");
                    //$( '.payment-errors' ).text( response.error.message );
                }
                else {
                    // response contains id and card, which contains additional card details
                    var token = response.id;
                    //var token = $('#token').text();
                    // Insert the token into the form so it gets submitted to the server
                    $('#transaction-form').append( $( '<input type="hidden" name="stripeToken" />' ).val( token ) );
                    // and submit
                    $.ajax( {
                        url: '/createtransaction',
                        type: 'POST',
                        headers: {
                            'x-access-token': $( '#token' ).html()
                        },
                        data: {
                            amount: $( '#amount' ).val(),
                            currency: $( '#currency' ).val(),
                            token: token,
                            user : $('#user').val()
                        }
                    } ).done( function( response ) {
                        //successfult transaction
                        custNotify(msgtype,msg,response.message,"bounceIn","bounceOut");
                        $('.old').hide();
                        $('#submitexist').removeClass("hide");
                        $('.submitexist').show();
                        // if(!$('#submitexist').val()){
                        //     $('<input type="button" class="submitexist btn btn-md btn-success btn-block" id="submitexist" value="Use Existing Card info">').insertAfter('#submittransaction');
                        // }
                        
                    } ).error( function(e) {
                        //error in transaction
                        var obj = JSON.parse(e.responseText);
                        if ( obj ) {
                            if(!obj.success){
                                msgtype = "danger";
                                msg="Error";
                            }
                            custNotify(msgtype,msg,obj.message,"bounceIn","bounceOut");
                        }
                    });
                }

            } );
        }

    } );
/***********add charge if user chose existing card**************/
    $( '.submitexist' ).on('click', function() {
        $.ajax( {
            url: '/createexisting',
            type: 'POST',
            headers: {
                'x-access-token': $( '#token' ).html()
            },
            data: {
                amount: $( '#amount' ).val(),
                currency: $( '#currency' ).val(),
                user:$( '#user' ).val()
            }
        } ).done( function( response ) {
            //successfult transaction
            custNotify(msgtype,msg,response.message,"bounceIn","bounceOut");
        } ).error( function(e) {
            //error in transaction
            var obj = JSON.parse(e.responseText);
            if ( obj ) {
                if(!obj.success){
                    msgtype = "danger";
                    msg="Error";
                }
                custNotify(msgtype,msg,obj.message,"bounceIn","bounceOut");
            }
        });
    });
} );
