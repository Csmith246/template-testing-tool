import React, { Component } from "react";

import { connect } from "react-redux";

import Editor from "@monaco-editor/react";


interface EditorModalProps {
  isOpen: boolean;
}

interface EditorModalState {
  open: boolean;
  Credential: string;
  portalUrl: string;
  appId: string;
  [propName: string]: any;
}

class EditorModal extends Component<EditorModalProps, EditorModalState> {
  constructor(props: EditorModalProps) {
    super(props);
    this.state = {
      open: false,
      Credential: null,
      portalUrl: null,
      appId: null
    };
  }

  componentDidMount() {
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
          />

        </div>
        <calcite-button
          onClick={() => {
            console.log("::: Confirm Changes :::");
          }}
          slot="primary"
        >
          Confirm Changes
        </calcite-button>
      </calcite-modal>
    );
  }

}




function mapStateToProps(state) {
  return {
    ...state
  };
}


export default connect(mapStateToProps, null)(EditorModal);
