//function below handles instance of individual message deletion
$(document).ready(function(){
  $('.delMsg').on('click', function(){
    var id = $(this).data('id');
    var url = 'delete/'+id;
    if(confirm('Are you sure you want to delete this message?')){
      $.ajax({
        url: url,
        type: 'DELETE',
        success: function(result){
          window.location.href='/manager';
        },
        error: function(err){
          console.log(err);
          window.location.href='/manager';
        }
      });
    }
  });

// delete all messages
  $('.delAll').on('click', function(){
    var url = '/delete';
    if(confirm('Are you sure you want to delete all messages?')){
      $.ajax({
        url: url,
        type: 'DELETE',
        success: function(result){
          window.location.href='/';
        },
        error: function(err){
          console.log(err);
          window.location.href='/';
        }
      });
    }
  });

//this function generates a random background each time page is refreshed
// var i = Math.floor((Math.random() * 8) + 1);
// (function () {document.body.style.backgroundImage= "url('../media/resources/loginbg"+i+".jpg')";})();

}); //doc ready close
