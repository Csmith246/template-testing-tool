import React, { Component, createRef } from "react";

import { connect } from "react-redux";

import Editor from "@monaco-editor/react";


interface EditorModalProps {
  isOpen: boolean;
  inputEditorText: string;
  toggleIsOpen: Function;
  confirmInput: Function;
}

interface EditorModalState {
  open: boolean;
  Credential: string;
  portalUrl: string;
  appId: string;
  editorValue: string;
  idValue: string;
  [propName: string]: any;
}

class EditorModal extends Component<EditorModalProps, EditorModalState> {
  private editorRef = createRef();
  private _getEditorVal: Function;
  private _valueIdInput: string = "idValue";

  constructor(props: EditorModalProps) {
    super(props);
    this.state = {
      open: false,
      Credential: null,
      portalUrl: null,
      appId: null,
      editorValue: null,
      idValue: null
    };
  }

  componentDidMount() {
  }

  _handleSaveChangesBtn() {
    const editorValue = this._getEditorVal();
    console.log("EIDTOR VALUE", editorValue);
    this.setState({
      ...this.state,
      editorValue
    });
    this.props.toggleIsOpen();

    this.props.confirmInput(this.state.idValue, editorValue);
  }

  render() {
    return (
      <calcite-modal
        fullscreen="true"
        aria-labelledby="modal-title"
        active={this.props.isOpen}
      >
        <h3 slot="header" id="modal-title">
          JSON Editor
        </h3>
        <div slot="content">

          <Editor
            height="80vh"
            language="json"
            editorDidMount={(getEditorVal, editor) => {
              this._getEditorVal = getEditorVal;
            }}
            value={this._rTabs(this.props.inputEditorText)}
          />

        </div>
        <div
          slot="primary">
          <input
            type="text"
            name={this._valueIdInput}
            id={this._valueIdInput}
            placeholder="Json Template ID"
            onChange={this._handleInputChange.bind(this, this._valueIdInput)}
          />
          <calcite-button
            // disabled={!this.state.idValue}
            onClick={this._handleSaveChangesBtn.bind(this)}
          >
            Confirm Changes
        </calcite-button>
        </div>
      </calcite-modal>
    );
  }

  private _rTabs = str => str.trim().replace(/^ {4}/gm, "");

  private _handleInputChange(stateKey: string, event: any) {
    const { value } = event.target;
    console.log("editorModal Change", value);
    this.setState({
      ...this.state,
      [stateKey]: value
    });
  }

}


function mapStateToProps(state) {
  return {
    ...state
  };
}


export default connect(mapStateToProps, null)(EditorModal);
