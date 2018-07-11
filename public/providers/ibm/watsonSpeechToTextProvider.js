var watsonSpeechToTextProvider = (function() {

    var micIsReadyListener = null
    var micBlockedListener = null
    var micAcceptedListener = null
    var micRequiresAcceptListener = null
    var micEnabledListener = null
    var micCancelledListener = null
    var speechDataListener = null
    var recording = false
    var records = 0

    return {
        Initialize: Initialize,
        SetupMic: SetupMic,
        Stop: Stop,
        SpeechToText: SpeechToText,
        onMicReadyListener: onMicReadyListener,
        onMicBlockedListener: onMicBlockedListener,
        onMicRequiresAcceptListener: onMicRequiresAcceptListener,
        onMicAcceptedListener: onMicAcceptedListener,
        onMicEnabledListener: onMicEnabledListener,
        onMicCancelledListener: onMicCancelledListener,
        onSpeechDataListener: onSpeechDataListener,
        onSpeechDataFinalListener: onSpeechDataFinalListener,
        onSpeechTimeoutListener: onSpeechTimeoutListener
    };


    function onMicReadyListener(listener) {
        micReadyListener = listener
    }

    function onMicBlockedListener(listener) {
        micBlockedListener = listener
    }

    function onMicRequiresAcceptListener(listener) {
        micAcceptedListener = listener
    }

    function onMicAcceptedListener(listener) {
        micAcceptedListener = listener
    }

    function onMicEnabledListener(listener) {
        micEnabledListener = listener
    }

    function onMicCancelledListener(listener) {
        micCancelledListener = listener
    }

    function onSpeechDataListener(listener) {
        speechDataListener = listener
    }

    function onSpeechDataFinalListener(listener) {
        speechDataFinalListener = listener
    }

    function onSpeechTimeoutListener(listener) {
        speechTimeoutListener = listener
    }

    function Initialize(rec) {
        records = rec
    }

    function SetupMic() {

        if (recording === false) {

            if (records === 0) { // The first time the mic is clicked - inform user

                if (micRequiresAcceptListener) {
                    micRequiresAcceptListener()
                }

                navigator.getUserMedia({
                    audio: true
                }, function(stream) {

                    //if permission is accepted
                    records = 1

                    if (micAcceptedListener) {
                        micAcceptedListener()
                    }

                    if (micEnabledListener) {
                        micEnabledListener()
                    }

                    console.log(stream)
                }, function(e) {
                    //if permission fo the mic has been previously denied
                    if (micBlockedListener) {
                        micBlockedListener()
                    }
                    console.log(e)
                })

            } else {
                if (micEnabledListener) {
                    micEnabledListener()
                }
            }
        } else {
            recording = false;
            try {
                stream.stop();
            } catch (e) {
                console.log(e);
            }
        }

    }

    function SpeechToText() {

        //mic.setAttribute('class', 'active-mic'); // Set CSS class of mic to indicate that we're currently listening to user input

        recording = true; // We'll be recording very shortly
        fetch(Common.apiURL() + '/api/speech-to-text/token') // Fetch authorization token for Watson Speech-To-Text
            .then(function(response) {
                return response.text();
            })
            .then(function(token) { // Pass token to Watson Speech-To-Text service

                var model = 'en-US_BroadbandModel'
                if (Global.getLanguage() == 'ja-JP') {
                    model = 'ja-JP_BroadbandModel'
                }

                stream = WatsonSpeech.SpeechToText.recognizeMicrophone({
                    token: token, // Authorization token to use this service, configured from /speech/stt-token.js file
                    extractResults: true, // True = automatically pipe results through a ResultStream stream
                    //outputElement: '#textInput', // CSS selector or DOM Element
                    inactivity_timeout: 5, // Number of seconds to wait before closing input stream
                    format: false, // Inhibits errors
                    keepMicrophone: true, // Avoids repeated permissions prompts in FireFox,
                    model: model
                });

                stream.on('data', function(data) {
                    if (data.final === true) {
                        stream.stop();
                    }
                    if (speechDataListener) {
                        if (data.alternatives.length > 0) {
                            speechDataListener(data.alternatives[0].transcript)
                        }
                    }
                });


                stream.promise() // Once all data has been processed...
                    .then(function(data) { // ...put all of it into a single array

                        recording = false; // We aren't recording anymore
                        if (data.length !== 0) { // If data is not empty (the user said something)

                            var dialogue = data.pop(); // Get the last data variable from the data array, which will be the finalized Speech-To-Text transcript

                            if ((dialogue.alternatives[0].transcript !== '') && (dialogue.final === true)) { // Another check to verify that the transcript is not empty and that this is the final dialog
                                if (speechDataFinalListener) {
                                    speechDataFinalListener(dialogue.alternatives[0].transcript)
                                }
                            }

                        } else { // If there isn't any data to be handled by the conversation, display a message to the user letting them know

                            if (micCancelledListener) {
                                micCancelledListener()
                            }

                        }
                    })
                    .catch(function(err) { // Catch any errors made during the promise
                        if (err !== 'Error: No speech detected for 5s.') { // This error will always occur when Speech-To-Text times out, so don't log it (but log everything else)
                            console.log(err);
                        }

                        //ensure the recording state is fully reset
                        recording = false

                        if (speechTimeoutListener) {
                            speechTimeoutListener()
                        }


                    });
            })
            .catch(function(error) { // Catch any other errors and log them
                console.log(error);
            });

    }

    function Stop() {

    }



})();
