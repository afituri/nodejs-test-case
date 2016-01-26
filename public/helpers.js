$(document).ready(function(){
  // Custom function for bootstrap notify
  custNotify = function(notType,msgType,msg,sign,enterAnimat,exitAnimat){
    $.notify({
      message: "<p class='font h5 text-center'><i class='glyphicon glyphicon-"+sign+"'></i>&nbsp;<strong>"+msgType+":</strong> "+msg+" </p>"
      },{
      type: notType,
      allow_dismiss: true,
      showProgressbar: false,
      placement: {
        from: 'top',
        align: 'center'
      },
      mouse_over: null,
      newest_on_top: true,
      animate: {
        enter: 'animated '+enterAnimat,
        exit: 'animated '+exitAnimat,
      },
    });
  }
});