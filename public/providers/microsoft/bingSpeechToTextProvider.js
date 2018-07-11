var bingSpeechToTextProvider = (function() {

    var micIsReadyListener = null
    var micBlockedListener = null
    var micAcceptedListener = null
    var micRequiresAcceptListener = null
    var micEnabledListener = null
    var micCancelledListener = null
    var speechDataListener = null
    var recording = false
    var records = 0

    var recognizer = null

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
        recognizer = RecognizerSetup(window.SDK, "Interactive", "en-US", SDK.SpeechResultFormat["Simple"], "")
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


    function RecognizerSetup(SDK, recognitionMode, language, format, subscriptionKey) {

        switch (recognitionMode) {
            case "Interactive":
                recognitionMode = SDK.RecognitionMode.Interactive;
                break;
            case "Conversation":
                recognitionMode = SDK.RecognitionMode.Conversation;
                break;
            case "Dictation":
                recognitionMode = SDK.RecognitionMode.Dictation;
                break;
            default:
                recognitionMode = SDK.RecognitionMode.Interactive;
        }

        var recognizerConfig = new SDK.RecognizerConfig(
            new SDK.SpeechConfig(
                new SDK.Context(
                    new SDK.OS(navigator.userAgent, "Browser", null),
                    new SDK.Device("SpeechSample", "SpeechSample", "1.0.00000"))),
            recognitionMode,
            language, // Supported languages are specific to each recognition mode. Refer to docs.
            format); // SDK.SpeechResultFormat.Simple (Options - Simple/Detailed)


        var useTokenAuth = false;

        var authentication = function() {

            var callback = function() {
                var tokenDeferral = new SDK.Deferred();
                try {
                    var xhr = new(XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
                    xhr.open('GET', Common.apiURL() + '/api/ms/speech/token', 1);
                    xhr.onload = function() {
                        if (xhr.status === 200) {
                            tokenDeferral.Resolve(xhr.responseText);
                        } else {
                            tokenDeferral.Reject('Issue token request failed.');
                        }
                    };
                    xhr.send();
                } catch (e) {
                    window.console && console.log(e);
                    tokenDeferral.Reject(e.message);
                }
                return tokenDeferral.Promise();
            }

            return new SDK.CognitiveTokenAuthentication(callback, callback);
        }();

        return SDK.CreateRecognizer(recognizerConfig, authentication);

    }


    function SpeechToText() {

        //mic.setAttribute('class', 'active-mic'); // Set CSS class of mic to indicate that we're currently listening to user input

        recording = true; // We'll be recording very shortly
        recognizer.Recognize((event) => {
                /*
                 Alternative syntax for typescript devs.
                 if (event instanceof SDK.RecognitionTriggeredEvent)
                */
                switch (event.Name) {
                    case "RecognitionTriggeredEvent":
                        //UpdateStatus("Initializing");
                        break;
                    case "ListeningStartedEvent":
                        //UpdateStatus("Listening");
                        break;
                    case "RecognitionStartedEvent":
                        //UpdateStatus("Listening_Recognizing");
                        break;
                    case "SpeechStartDetectedEvent":
                        //UpdateStatus("Listening_DetectedSpeech_Recognizing");
                        console.log(JSON.stringify(event.Result)); // check console for other information in result
                        break;
                    case "SpeechHypothesisEvent":
                        //UpdateRecognizedHypothesis(event.Result.Text, false);
                        speechDataListener(event.Result.Text)
                        console.log(JSON.stringify(event.Result)); // check console for other information in result
                        break;
                    case "SpeechFragmentEvent":
                        //UpdateRecognizedHypothesis(event.Result.Text, true);
                        console.log(JSON.stringify(event.Result)); // check console for other information in result
                        break;
                    case "SpeechEndDetectedEvent":
                        //OnSpeechEndDetected();
                        //UpdateStatus("Processing_Adding_Final_Touches");
                        console.log(JSON.stringify(event.Result)); // check console for other information in result
                        break;
                    case "SpeechSimplePhraseEvent":
                        speechDataFinalListener(event.Result.DisplayText)

                        recognizer.AudioSource.TurnOff();
                        recording = false

                        //UpdateRecognizedPhrase(JSON.stringify(event.Result, null, 3));
                        break;
                    case "SpeechDetailedPhraseEvent":
                        //UpdateRecognizedPhrase(JSON.stringify(event.Result, null, 3));
                        break;
                    case "RecognitionEndedEvent":
                        //OnComplete();
                        //UpdateStatus("Idle");
                        //
                        console.log(JSON.stringify(event)); // Debug information
                        break;
                    default:
                        console.log(JSON.stringify(event)); // Debug information
                }
            })
            .On(() => {
                    // The request succeeded. Nothing to do here.

                },
                (error) => {
                    console.error(error);
                });

    }

    function Stop() {
        recognizer.AudioSource.TurnOff();
    }


})();
