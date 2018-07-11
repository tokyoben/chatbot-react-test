var luisConversationProvider = (function() {

    var answerReceivedListeners = []
    var payloadReceivedListener = null
    var messageEndpoint = null
    var requestPayload = null
    var responsePayload = null
    var context = null
    var messageEndpoint = Common.apiURL() + '/api/ms/message'

    return {
        Initialize: Initialize,
        onAnswerReceivedListener: onAnswerReceivedListener,
        onPayloadReceivedListener: onPayloadReceivedListener,
        askQuestion: askQuestion
    };

    function Initialize() {

    }

    function onAnswerReceivedListener(listener) {
        answerReceivedListeners.push(listener)
    }

    function onPayloadReceivedListener(listener) {
        payloadReceivedListener = listener
    }

    function answerReceivedListener(payload) {

        for (var i = 0; i < answerReceivedListeners.length; i++) {
            answerReceivedListeners[i](payload)
        }

    }

    function clearContext() {
        context = null
    }

    function askQuestion(message) {

        var data = {
            "question": message,
            "top": 3
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

                var answer = {}
                answer.output = {}
                answer.output.text = ""
                if (responsePayload.answers) {
                    if (responsePayload.answers.length > 0) {
                        answer.output.text = responsePayload.answers[0].answer
                    }
                }

                if(payloadReceivedListener){
                  payloadReceivedListener(responsePayload)
                }

                answerReceivedListener(answer)

            } else {
                responsePayload = {
                    output: {
                        text: [
                            'The service is not available'
                        ]
                    }
                };

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
