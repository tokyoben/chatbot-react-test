import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor(props){
    super(props)

    window.conversationProvider.onAnswerReceivedListener(function(message){
      console.log(message.output.text)
    })

  }

  handleClick() {

    window.conversationProvider.askQuestion("ご僧侶のお食事の用意については、どのようにすればよいですか？")

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro" onClick={this.handleClick}>
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
