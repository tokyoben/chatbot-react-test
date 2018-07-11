var watsonConversationProvider = (function() {

    var answerReceivedListeners = []
    var payloadReceivedListener = null
    var messageEndpoint = null
    var requestPayload = null
    var responsePayload = null
    var context = null
    var messageEndpoint = Common.apiURL() + '/api/ibm/message'


    return {
        Initialize: Initialize,
        onAnswerReceivedListener: onAnswerReceivedListener,
        onPayloadReceivedListener: onPayloadReceivedListener,
        askQuestion: askQuestion
    };


    function Initialize() {

    }


    function onPayloadReceivedListener(listener) {
        payloadReceivedListener = listener
    }

    function onAnswerReceivedListener(listener) {
        //answerReceivedListener = listener
        answerReceivedListeners.push(listener)
    }

    function answerReceivedListener(payload){

      for (var i = 0; i < answerReceivedListeners.length; i++) {
        answerReceivedListeners[i](payload)
      }

    }

    function clearContext(){
      context = null
    }

    function askQuestion(message) {

      var data = {'input': {'text': message}};

      if (context) {
        data.context = context;
      }

      data.language = Global.getLanguage();

      requestPayload = data

      var http = new XMLHttpRequest();
      http.open('POST', messageEndpoint, true);
      http.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      http.onload = function() {
        if (http.status === 200 && http.responseText) {
          var response = JSON.parse(http.responseText);
          context = response.context;
          responsePayload = response

          answerReceivedListener(responsePayload)

          if(payloadReceivedListener){
            payloadReceivedListener(responsePayload)
          }


        } else {
          responsePayload = {output: {text: [
            'The service may be down at the moment; please check' +
            ' <a href="https://status.ng.bluemix.net/" target="_blank">here</a>' +
            ' for the current status. <br> If the service is OK,' +
            ' the app may not be configured correctly,' +
            ' please check workspace id and credentials for typos. <br>' +
            ' If the service is running and the app is configured correctly,' +
            ' try refreshing the page and/or trying a different request.'
          ]}};

          answerReceivedListener(responsePayload)

          console.error('Server error when trying to reply!');
        }
      };

      http.onerror = function() {
        console.error('Network error trying to send message!');
      };

      http.send(JSON.stringify(data));

    }

})();
