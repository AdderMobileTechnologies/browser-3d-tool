//TODO: CALLBACKS? SHOW AND HIDE THE EDITOR FROM THE PARENT!!!

//region Components
import React, { Component } from "react";
import ImageEditor from "tui-image-editor";
import { Button, Row, Col } from "reactstrap";
//endregion

//region CSS
import "./AdderImageEditor.css";
//endregion

//region Icon Images
import IconSetA from "tui-image-editor/dist/svg/icon-a.svg";
import IconSetB from "tui-image-editor/dist/svg/icon-b.svg";
import IconSetC from "tui-image-editor/dist/svg/icon-c.svg";
import IconSetD from "tui-image-editor/dist/svg/icon-d.svg";
//endregion

//region Styles
const modalRowStyle = {
  width: "100%",
  height: "800px"
};
const modalStyle = {
  width: "100%",
  height: "800px"
};
const footerRowStyle = {
  height: "32px",
  width: "100%"
};
const footerStyleNoHover = {
  height: "32px",
  width: "100%",
  borderStyle: "none",
  backgroundColor: "#151515",
  color: "#ffffff"
};
const footerStyleHover = {
  height: "32px",
  width: "100%",
  borderStyle: "none",
  backgroundColor: "#ffffff",
  color: "#151515"
};

const tuiStyle = {
  includeUI: {
    theme: {
      "common.bi.image":
        "https://uicdn.toast.com/toastui/img/tui-image-editor-bi.png",
      "common.bisize.width": "251px",
      "common.bisize.height": "21px",
      "common.backgroundImage": "none", // The background image that takes up the entire window except for the bottom bar
      "common.backgroundColor": "#1e1e1e",
      "common.border": "0px",

      "header.backgroundImage": "none",
      "header.backgroundColor": "transparent",
      "header.border": "0px",

      "loadButton.backgroundColor": "#fff",
      "loadButton.border": "1px solid #ddd",
      "loadButton.color": "#222",
      "loadButton.fontFamily": "NotoSans, sans-serif",
      "loadButton.fontSize": "12px",

      "downloadButton.backgroundColor": "#000000",
      "downloadButton.border": "1px solid #fdba3b",
      "downloadButton.color": "#fff",
      "downloadButton.fontFamily": "NotoSans, sans-serif",
      "downloadButton.fontSize": "12px",

      "menu.normalIcon.path": IconSetA,
      "menu.normalIcon.name": "icon-a",
      "menu.activeIcon.path": IconSetB,
      "menu.activeIcon.name": "icon-b",
      "menu.iconSize.width": "24px",
      "menu.iconSize.height": "24px",

      "submenu.backgroundColor": "#1e1e1e",
      "submenu.partition.color": "#858585",

      "submenu.normalIcon.path": IconSetC,
      "submenu.normalIcon.name": "icon-c",
      "submenu.activeIcon.path": IconSetD,
      "submenu.activeIcon.name": "icon-d",
      "submenu.iconSize.width": "32px",
      "submenu.iconSize.height": "32px",

      "submenu.normalLabel.color": "#858585",
      "submenu.normalLabel.fontWeight": "lighter",
      "submenu.activeLabel.color": "#fff",
      "submenu.activeLabel.fontWeight": "lighter",

      "checkbox.border": "1px solid #ccc",
      "checkbox.backgroundColor": "#fff",

      "range.pointer.color": "#fff",
      "range.bar.color": "#666",
      "range.subbar.color": "#d1d1d1",
      "range.value.color": "#fff",
      "range.value.fontWeight": "lighter",
      "range.value.fontSize": "11px",
      "range.value.border": "1px solid #353535",
      "range.value.backgroundColor": "#151515",
      "range.title.color": "#fff",
      "range.title.fontWeight": "lighter",

      "colorpicker.button.border": "1px solid #1e1e1e",
      "colorpicker.title.color": "#fff"
    },
    initMenu: "filter",
    menuBarPosition: "bottom",
    uiSize: {
      width: "100%",
      height: "800px"
    }
  },
  cssMaxWidth: 1000,
  cssMaxHeight: 2000,
  selectionStyle: {
    cornerSize: 20,
    rotatingPointOffset: 70
  }
};
//endregion

class AdderImageEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      footerStyle: footerStyleNoHover
    };
    console.log("AdderImageEditor:props:", props);
    this.imageEditor = null;
    this.onApplyCallback = props.onApplyCallback.bind(this);
    this.onApplyClick = this.onApplyClick.bind(this);
  }

  componentDidMount() {
    this.imageEditor = new ImageEditor(
      document.querySelector("#modal"),
      tuiStyle
    );
  }

  onApplyClick() {
    //console.log(this.imageEditor.toDataURL({ format: "png" }));
    //data to apply to an image class of the current model/mesh.
    let DataURL = this.imageEditor.toDataURL({ format: "png" });
    this.onApplyCallback(DataURL);
  }

  render() {
    return (
      <Col>
        <Row style={modalRowStyle}>
          <div id="modal" style={modalStyle} />
        </Row>
        <Row style={this.state.footerStyle}>
          <Button
            className="footer"
            onClick={this.onApplyClick}
            onMouseEnter={() => {
              this.setState({
                footerStyle: footerStyleHover
              });
            }}
            onMouseLeave={() => {
              this.setState({
                footerStyle: footerStyleNoHover
              });
            }}
          >
            Apply Image
          </Button>
        </Row>
      </Col>
    );
  }
}

export default AdderImageEditor;
