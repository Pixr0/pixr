//this function generates a random background each time page is refreshed
$(document).ready(function(){
  var i = Math.floor((Math.random() * 13) + 1);
  (function () {document.body.style.backgroundImage= "url('https://s3.amazonaws.com/nycdapixr/assets/backdrops/loginbg"+i+".jpg')";})();
}); //doc ready close
