/* global ConversationPanel: true, PayloadPanel: true*/
/* eslint no-unused-vars: "off" */

// Other JS files required to be loaded first: apis.js, conversation.js, payload.js
var Global = (function() {

    // Initialize all modules

    //see if any providers are passed in url for local testing

    var apiURL = "http://localhost:3000"

    var params = parseHash()

    //Get the system configuration and initialize the APIs

    var defaultLanguage = "ja-JP"

    var language = defaultLanguage

    //load the default language

    AppStrings.init(defaultLanguage, function(err) {

        Global.setLanguage("ja-JP")

        $(document).attr("title", AppStrings.strings["title"])


        var speechToTextProviderType = "watsonSpeechToTextProvider" //bingSpeechToTextProvider
        var textToSpeechProviderType = "watsonTextToSpeechProvider" //
        var conversationProviderType = "watsonConversationProvider" //luisConversationProvider

        //only for local dev testing
        if(params["stt"]){
          speechToTextProviderType = params["stt"]
          console.log(speechToTextProviderType)
        }
        if(params["tts"]){
          textToSpeechProviderType = params["tts"]
          console.log(textToSpeechProviderType)
        }
        if(params["conv"]){
          conversationProviderType = params["conv"]
          console.log(conversationProviderType)
        }

        var speechToTextProvider = getProvider(speechToTextProviderType)
        var textToSpeechProvider = getProvider(textToSpeechProviderType)
        var conversationProvider = getProvider(conversationProviderType)

        window.speechToTextProvider = speechToTextProvider
        window.speechToTextProvider = textToSpeechProvider
        window.conversationProvider = conversationProvider

        textToSpeechProvider.Initialize()
        speechToTextProvider.Initialize(0)
        conversationProvider.Initialize()


    });

    function parseHash() {
        // Alternate args should be names and values
        if (location.hash.substring(0, 3) != '#!/') {
            return {};
        }
        var arg_arr = location.hash.substring(3).split('/');
        var args = {};
        for (var i = 0; i < arg_arr.length + 1; i = i + 2) {
            var n = arg_arr[i];
            var v = arg_arr[i + 1];
            if (n && v) {
                args[n] = v;
            }
        }
        return args;
    }

    function setLanguage(lang) {
        language = lang
        AppStrings.updateLanguage(lang, function(err) {
            $(document).attr("title", AppStrings.strings["title"])

            //extraInfoController.updateStrings()
            //conversationController.updateStrings()

        })
    }

    function getProvider(providerType){

      if (providerType=="watsonSpeechToTextProvider") {
          return watsonSpeechToTextProvider
      }
      if (providerType=="bingSpeechToTextProvider") {
          return bingSpeechToTextProvider
      }
      if (providerType=="watsonTextToSpeechProvider") {
          return watsonTextToSpeechProvider
      }
      if (providerType=="bingTextToSpeechProvider") {
          return bingTextToSpeechProvider
      }
      if (providerType=="watsonConversationProvider") {
          return watsonConversationProvider
      }
      if (providerType=="luisConversationProvider") {
          return luisConversationProvider
      }

    }

    // $("#languageToggle").click(function(err) {
    //
    // })

    function getLanguage() {
        return language
    }

    return {
        setLanguage: setLanguage,
        getLanguage: getLanguage
    }

})();
