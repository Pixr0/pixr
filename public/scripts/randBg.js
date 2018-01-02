//this function generates a random background each time page is refreshed
$(document).ready(function(){
  var i = Math.floor((Math.random() * 10) + 1);
  (function () {document.body.style.backgroundImage= "url('../media/resources/loginbg"+i+".jpg')";})();
}); //doc ready close
