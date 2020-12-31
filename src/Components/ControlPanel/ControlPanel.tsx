import React, { Component } from "react";

import { connect } from "react-redux";

import "./ControlPanel.scss";

import Portal from "@arcgis/core/portal/Portal";
import PortalQueryParams from "@arcgis/core/portal/PortalQueryParams";
import CreateApp from "../CreateApp/CreateApp";
import EditorModal from "../EditorModal/EditorModal";
import { AppProps } from "../../App";

type addToSavedJsonConfig = (id: string, value: string) => void;

interface ControlPanelProps extends AppProps {
  addToSavedJsonConfig: addToSavedJsonConfig;
}

interface ControlPanelState {
  mapDiv: HTMLDivElement;
  portalItems: JSX.Element;
  portal: __esri.Portal;
  isEditorOpen: boolean;
}

const CSS = {
  base: "esri-control-panel",
  heading: "esri-control-panel__heading",
  items: "esri-control-panel__items",
  item: "esri-control-panel__item",
  launchButtons: "esri-control-panel__launchButtons",
};

const DEFAULT_EDITOR_JSON: string = `{
  "test" : "test1"
}`;

class ControlPanel extends Component<ControlPanelProps, ControlPanelState> {

  componentDidUpdate() {
    if (this.props.credential != null && this?.state?.portal == null) {
      var portal = new Portal({ url: this.props.credential.server });
      // Setting authMode to immediate signs the user in once loaded
      portal.authMode = "immediate";
      this.setState({ ...this.state, portal: portal });
      this._triggerPortalItemsLoad(portal);
    }
  }

  generalJSONEditorToggle(){
    this.setState({
      ...this.state,
      isEditorOpen: !this.state.isEditorOpen
    })
  }

  render() {
    return <div className={CSS.base}>

      <h3 className={CSS.heading}>Control Panel</h3>
      <div style={{ textAlign: "right", marginRight: "70px" }}>
        <calcite-button onClick={this.generalJSONEditorToggle.bind(this)}>
          Open Editor
        </calcite-button>
      </div>
      <CreateApp
        portal={this?.state?.portal}
        itemsReload={this._triggerPortalItemsLoad.bind(this, this?.state?.portal)} />
      {this?.state?.portalItems}
      <EditorModal 
        isOpen={this?.state?.isEditorOpen} 
        toggleIsOpen={this.generalJSONEditorToggle.bind(this)} 
        inputEditorText={DEFAULT_EDITOR_JSON}
        confirmInput={(id: string, value: string)=>{
          this.props.addToSavedJsonConfig(id, value);
        }} 
      />
    </div>;
  }

  private _triggerPortalItemsLoad(portal: __esri.Portal): void {
    portal.load().then((loadObj) => {
      console.log("loadObj:", loadObj);
      // Create query parameters for the portal search
      var queryParams = new PortalQueryParams({
        query: `owner: "${portal.user.username}" AND type: "Web Mapping Application"`,
        sortField: "modified",
        sortOrder: "desc",
        num: 100
      });

      // Query the items based on the queryParams created from portal above
      portal.queryItems(queryParams).then(this._renderPortalItems.bind(this));
    });
  }

  private _renderPortalItems(items: __esri.PortalQueryResult) {
    console.log("items: ", items);
    this.setState({
      ...this.state,
      portalItems: (
        <div className={CSS.items}>
          {
            items.results.map((item: any) => {
              return (
                <div key={item.id} className={CSS.item}>
                  <div>
                    <img src={item.thumbnailUrl} alt={item.thumbnail} />
                    <div style={{display: "inline", paddingBottom: "30px"}}>{item.title}</div>
                    {/* <span>{item.description}</span> */}
                  </div>

                  <div>

                    <calcite-button
                      className={CSS.launchButtons}
                      appearance="outline"
                      onClick={() => {
                        const appUrl: string = item.url;
                        window.open(`${appUrl.substring(0, appUrl.indexOf("apps"))}apps/configure-template/index.html?appid=${item.id}`, "_blank");
                      }}>
                      Launch Config Panel
                    </calcite-button>

                    <calcite-button
                      className={CSS.launchButtons}
                      onClick={() => {
                        console.log("ITEM:", item);
                        window.open(item.url, "_blank");
                      }}>
                      Launch App
                    </calcite-button>

                  </div>
                </div>
              );
            })
          }
        </div>
      )
    });
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
  addToSavedJsonConfig: addToSavedJsonConfig,
} {
  return {
    addToSavedJsonConfig: (id: string, value: string) => {
      dispatch({ type: "ADDTO_SAVED_JSON_CONFIG", payload: {id, value} });
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);
