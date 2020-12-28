import React, { Component } from "react";
import { connect } from "react-redux";

import Header from "./Components/Header/Header";
import ControlPanel from "./Components/ControlPanel/ControlPanel";
import LoginModal from "./Components/LoginModal/LoginModal";

import "./App.scss";
import { ApplicationConfig } from "./ApplicationBase/interfaces";

interface AppProps {
  portal: __esri.Portal;
  config: ApplicationConfig;
  webmap: string;
  setWebmap: any;
}

interface AppState {
  webmap: string;
}

class App extends Component<AppProps, AppState> {

  render() {
    return (
      <div className="App">
        <Header />
        <ControlPanel />
        <LoginModal />
      </div>
    );
  }
}

function mapStateToProps(state: AppState): AppState {
  return {
    ...state
  };
}

export default connect(mapStateToProps, null)(App);
