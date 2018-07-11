var watsonTextToSpeechProvider = (function() {

    var micIsReadyListener = null


    var audio = null;
    var records = 0
    var mute = true

    return {
        Initialize: Initialize,
        TextToSpeech: TextToSpeech,
        Interrupt: Interrupt,
        SetMute: SetMute
    };


    function onMicReadyListener(listener) {
        micReadyListener = listener
    }


    function Initialize() {

    }

    function SetMute(m) {
        mute = m
        if(mute){
          if (audio) {
              audio.pause();
          }
        }
    }

    function Interrupt() {
        if (audio) {
            audio.pause();
        }
    }

    function TextToSpeech(text) {

        if (!mute) {

            fetch(Common.apiURL() + '/api/text-to-speech/token') // Retrieve TTS token
                .then(function(response) {
                    return response.text();
                }).then(function(token) {

                    // Takes text, voice, and token and returns speech
                    if (text) { // If payload.text is defined
                        // Pauses the audio for older message if there is a more current message
                        if (audio !== null && !audio.ended) {
                            audio.pause();
                        }

                        var voice = 'en-US_MichaelVoice'
                        if (Global.getLanguage() == 'ja-JP') {
                            voice = 'ja-JP_EmiVoice'
                        }

                        audio = WatsonSpeech.TextToSpeech.synthesize({
                            text: text, // Output text/response
                            voice: voice, // Default Watson voice ja-JP_EmiVoice
                            autoPlay: true, // Automatically plays audio
                            token: token
                        });
                        // When the audio stops playing
                        audio.onended = function() {
                            //prevent endless loop of mic being enabled and timed-out
                            // if (payload.ref) {
                            //     if (payload.ref == 'STT') {
                            //         return;
                            //     }
                            // }
                            //allowSTT(payload); // Check if user wants to use STT
                        };
                    } else {
                        // Pauses the audio for older message if there is a more current message
                        if (audio !== null && !audio.ended) {
                            audio.pause();
                        }
                        // When payload.text is undefined
                        //allowSTT(payload); // Check if user wants to use STT
                    }

                });
        }
    }



    function Stop() {

    }



})();
