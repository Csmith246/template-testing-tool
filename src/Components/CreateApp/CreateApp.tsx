import React, { Component } from "react";
import PortalQueryParams from "@arcgis/core/portal/PortalQueryParams";

import { connect } from "react-redux";

type AppType = "attachmentviewer" | "lookup";// | "" | "";
interface TemplateAppPortalInfo {
  id: string,
  title: string,
  urlSuffix: string
}

interface CreateAppProps {
  credential: __esri.Credential;
  itemsReload: () => void;
  portal: __esri.Portal;
}

interface CreateAppState {
  isCreating: boolean;
  newAppTitle: string;
  newAppTemplateInfo: TemplateAppPortalInfo;
  appTypeList: TemplateAppPortalInfo[];
}

class CreateApp extends Component<CreateAppProps, CreateAppState> {

  constructor(args) {
    super(args);
    this.state = {
      isCreating: false,
      newAppTitle: null,
      newAppTemplateInfo: null,
      appTypeList: null
    };
  }

  componentDidUpdate() {
    if (this?.props?.portal != null && this?.state?.appTypeList == null) {
      // Create query parameters for the portal search
      var queryParams = new PortalQueryParams({
        query: `owner:"esri_en" AND tags:"ArcGIS web application template" AND tags:"4.x" AND tags:"instant mapping apps"`,
        sortField: "modified",
        sortOrder: "desc",
        num: 100
      });

      // Query the items based on the queryParams created from portal above
      this.props.portal.queryItems(queryParams).then((templateTypesResult: __esri.PortalQueryResult) => {
        console.log("Portal Query Res:", templateTypesResult);
        const info: TemplateAppPortalInfo[] = templateTypesResult.results.map((item) => {
          return {
            id: item.id,
            title: item.title,
            urlSuffix: item.url
          };
        });
        this.setState({
          appTypeList: info
        });
      });
    }
  }

  render() {
    return (
      <div style={{ textAlign: "center" }}>
        {
          this.state.isCreating
            ? this._renderCreateForm()
            : this._renderCreateButton()
        }
      </div>
    );
  }

  private _renderCreateForm(): JSX.Element {
    return (
      <div>
        <input type="text" name="newAppName" id="newAppName"
          placeholder="App Title" onChange={(e) => {
            this.setState({
              newAppTitle: e.target.value
            })
          }} />
        <select name="AppType" id="AppType" placeholder="App Type"
          onChange={(e) => {
            this.setState({
              newAppTemplateInfo: JSON.parse(e.target.value)
            })
          }}
        >
          <option value={null}>Choose App Type</option>
          {
            this?.state?.appTypeList.map((appInfo: TemplateAppPortalInfo) => {
              return <option key={appInfo.id} value={JSON.stringify(appInfo)}>{appInfo.title}</option>;
            })
          }
          {/* <option value="attachmentviewer">Attachment Viewer</option>
          <option value="lookup">Lookup</option>
          <option value="nearby">Nearby</option> */}
        </select>
        <calcite-button
          onClick={() => {
            this._createApp();
          }}
        >
          Create App
        </calcite-button>
      </div>
    );
  }

  private _renderCreateButton(): JSX.Element {
    return (
      <calcite-button
        title="Create New App"
        round="true"
        icon-start="plus"
        color="blue"
        onClick={() => {
          this.setState({
            isCreating: true
          });
        }}>
      </calcite-button>
    );
  }

  private async _createApp(): Promise<void> {
    console.log("state:", this.state);

    const { newAppTitle, newAppTemplateInfo } = this.state;

    try {
      const res = await this.addItemRestCall(newAppTitle, newAppTemplateInfo)
      const appId = res.id;
      const updateRes = await this.updateItemRestCall(appId, newAppTemplateInfo);
      await new Promise((resolve, reject)=>{
        setTimeout(()=>{resolve()}, 1000); // small timeout to ensure app item has updated
      });
      console.log("Update Res: ", updateRes);

      this._setDefaultState();
      this.props.itemsReload();
    } catch (err) {
      console.error(err);
    }
  }


  async addItemRestCall(title: string, appInfo: TemplateAppPortalInfo): Promise<{ "success": boolean, "id": string, "folder": string }> {

    const { id, urlSuffix } = appInfo;

    const data = new URLSearchParams();

    const { token, userId } = this.props.credential;
    const baseUrl = this.props.credential.server;

    data.append("type", "Web Mapping Application");
    data.append("typeKeywords", "Web Map, Map, Online Map, Mapping Site, JavaScript, Ready To Use, configurableApp");
    data.append("thumbnailURL", "https://static.arcgis.com/images/webapp.png");
    data.append("url", `${baseUrl}${urlSuffix}`);
    data.append("title", title);
    data.append("tags", "test");
    data.append("text", JSON.stringify({ "source": id, "folderId": null, "values": {} }));
    data.append("f", "json");
    data.append("token", token);

    const res = await fetch(`${baseUrl}/sharing/rest/content/users/${userId}/addItem`, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: data
    });

    let json;
    try {
      json = res.json();
    } catch (err) {
      throw new Error("JSON Parsing error in addItem Call" + err);
    }
    return json;
  }


  /**
   * 2nd AGOL REST call to update newly created item's url
   * @param appId - appId returned from 1st REST call
   */
  async updateItemRestCall(appId: string, appInfo: TemplateAppPortalInfo): Promise<{ "success": boolean, "id": string }> {

    const { urlSuffix } = appInfo;

    const { token, userId } = this.props.credential;
    const baseUrl = this.props.credential.server;

    const data = new URLSearchParams();

    data.append("id", appId);
    data.append("url", `${baseUrl}${urlSuffix}?appid=${appId}`);
    data.append("f", "json");
    data.append("token", token);

    const res = await fetch(`${baseUrl}/sharing/rest/content/users/${userId}/items/${appId}/update`, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: data
    });

    let json;
    try {
      json = res.json();
    } catch (err) {
      throw new Error("JSON Parsing error in addItem Call" + err);
    }
    return json;
  }


  private _setDefaultState() {
    this.setState({
      isCreating: false,
      newAppTitle: null,
      newAppTemplateInfo: null,
      appTypeList: null
    });
  }
}




function mapStateToProps(state) {
  return {
    ...state
  };
}


export default connect(mapStateToProps, null)(CreateApp);
