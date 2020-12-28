import React, { Component } from "react";

import { connect } from "react-redux";

import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";

// dispatch interface
type setCredentialType = (Credential: __esri.Credential) => void;
type setPortalUrlType = (portalUrl: string) => void;

interface LoginModalProps { 
  setCredential: setCredentialType;
  setPortalUrl: setPortalUrlType;
}

interface LoginModalState {
  open: boolean;
  Credential: string;
  portalUrl: string;
  appId: string;
  [propName: string]: any;
}

const _PORTAL_ITEM_KEY = "__PORTAL__ITEM__KEY__";
const _APP_ID_KEY = "__APP__ID__";

class LoginModal extends Component<LoginModalProps, LoginModalState> {
  constructor(props: LoginModalProps) {
    super(props);
    this.state = {
      open: true,
      Credential: null,
      portalUrl: null,
      appId: null
    };
  }

  componentDidMount() {
    this._checkForSavedInfo();
  }

  render() {
    const portalUrlId: string = "portalUrl";
    const appId: string = "appId";
    return (
      <calcite-modal aria-labelledby="modal-title" active={this.state.open}>
        <h3 slot="header" id="modal-title">
          Login
        </h3>
        <div slot="content">
          <input
            type="text"
            name={appId}
            id={appId}
            placeholder="App Id" 
            onChange={this._handleInputChange.bind(this, appId)}/>

          {/* <select 
            defaultValue="https://devext.arcgis.com"
            name={portalUrlId} 
            id={portalUrlId} 
            onChange={this._handleInputChange.bind(this, portalUrlId)}>
            <option value="https://devext.arcgis.com">Devext(dev)</option>
            <option value="https://arcgis.com">arcgis.com(Prod)</option>
          </select> */}

          <input
            type="text"
            name={portalUrlId}
            id={portalUrlId}
            placeholder="Portal Url" 
            onChange={this._handleInputChange.bind(this, portalUrlId)}/>


          <calcite-button
            onClick={() => {
              console.log("IN METHOD");
              const {appId, portalUrl} = this.state;
              // 1. Check for form fill out properly
              // If yes, save to LocalStorage
              // then perform login
              this.performLogin(appId, portalUrl);
            }}
          >
            Login
          </calcite-button>
        </div>
      </calcite-modal>
    );
  }

  closeModal(): void {
    this.setState({ open: false });
  }

  performLogin(appId: string, portalUrl: string) {
    localStorage.setItem(_PORTAL_ITEM_KEY, portalUrl);
    localStorage.setItem(_APP_ID_KEY, appId);
    
    var oAuthInfo = new OAuthInfo({
      appId, //"Tft60txnHGixGVUj", // TODO - make inputable (then save to local storage?)
      popup: false,
      portalUrl //: "https://devext.arcgis.com" // TODO - make inputable (then save to local storage?)
    });
    IdentityManager.registerOAuthInfos([oAuthInfo]);

    IdentityManager
    .checkSignInStatus(oAuthInfo.portalUrl + "/sharing")
    .then((cred: __esri.Credential) => {
      this.props.setCredential(cred);
      this.props.setPortalUrl(portalUrl);
      this.closeModal();
    })
    .catch(() => {
      IdentityManager.getCredential(oAuthInfo.portalUrl + "/sharing");
    });
  }

  private _handleInputChange(stateKey: string, event: any){
    const { value } = event.target;
    this.setState({
      [stateKey]: value
    });
  }

  private _checkForSavedInfo(){
    const savedPortalItem = localStorage.getItem(_PORTAL_ITEM_KEY);
    const savedAppItem = localStorage.getItem(_APP_ID_KEY);
    if(savedPortalItem != null && savedAppItem != null){
      this.performLogin(savedAppItem, savedPortalItem);
    }
  }
}




function mapStateToProps(state) {
  return {
    ...state
  };
}

function mapDispatchToProps(
  dispatch
): {
  setCredential: setCredentialType,
  setPortalUrl: setPortalUrlType
} {
  return {
    setCredential: (Credential: __esri.Credential) => {
      dispatch({ type: "SET_CRED", payload: Credential });
    },
    setPortalUrl: (portalUrl: string) => {
      dispatch({ type: "SET_PORTAL_URL", payload: portalUrl });
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginModal);
