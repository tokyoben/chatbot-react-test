var AppStrings = (function() {

    var strings = {}

    return {
        init: init,
        strings: strings,
        updateLanguage: updateLanguage
    };

    function init(lang,callback) {

      updateStrings(lang,function(err){

        callback(err)

      })

    }

    function updateLanguage(lang,callback) {

      updateStrings(lang,function(err){

        callback(err)

      })
    }


    function updateStrings(lang, callback){

      var http = new XMLHttpRequest();
      http.open('GET', Common.apiURL() + "/api/strings/" + lang, true);
      http.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      http.onload = function() {
        if (http.status === 200 && http.responseText) {
          var response = JSON.parse(http.responseText);
          console.log(response)
          AppStrings.strings = response
          callback(false)
        } else {
          callback(true)
        }
      };
      http.onerror = function() {
        console.error('Network error trying to send message!');
        callback(true)
      };

      http.send();

    }


}());
