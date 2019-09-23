import React, { Component } from "react";

import IconSave from "./../../../assets/icons/saveTransparent.png";
import IconDelete from "./../../../assets/icons/deleteTransparent.png";
import IconRedo from "./../../../assets/icons/redoTransparent.png";
import IconDownload from "./../../../assets/icons/downloadTransparent.png";
import IconShare from "./../../../assets/icons/shareTransparent.png";
import IconUndo from "./../../../assets/icons/undoTransparent.png";
import Landscape from "./../../../assets/icons/landscape_2x.png";
import Location_City from "./../../../assets/icons/location_city_2x.png";

// Old Material UI Stuff
import Avatar from "@material-ui/core/Avatar";
import CameraAlt from "@material-ui/icons/CameraAlt";
import CropIcon from "@material-ui/icons/Crop";
import FormatColorFill from "@material-ui/icons/FormatColorFill";
import TextFields from "@material-ui/icons/TextFields";

//icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoffee,
  faBinoculars,
  faFillDrip,
  faCamera,
  faTextsize,
  faLock,
  faCrop,
  faObjectGroup,
  faTextHeight
} from "@fortawesome/free-solid-svg-icons";

const element = <FontAwesomeIcon icon={faCoffee} />;

const iconStyle = {
  common: {
    width: "54px",
    height: "54px",
    backgroundColor: "#eee",
    borderRadius: "10px",
    xboxShadow: "5px 10px 8px #2f2f2f"
  },
  small: {
    width: "44px",
    height: "44px",
    backgroundColor: "#ddd",
    borderRadius: "6px",
    xboxShadow: "2px 3px 3px #ccc"
  }
};

class UIButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTitle: false
    };
    this.callback = this.props.callback;
    this.title = this.props.title;
    this.buttonText = this.props.buttonText;
    this.action = this.props.action;
    this.bgimg = this.props.bgimg;
  }

  render() {
    let alt;
    let src;

    /*const styles = {
            largeIcon: {
                width: 60,
                height: 60,
            }
        };*/

    switch (this.props.iconName) {
      case "save":
        alt = "save";
        src = IconSave;
        break;
      case "delete":
        alt = "delete";
        src = IconDelete;
        break;
      case "redo":
        alt = "redo";
        src = IconRedo;
        break;
      case "download":
        alt = "download";
        src = IconDownload;
        break;
      case "share":
        alt = "share";
        src = IconShare;
        break;
      case "undo":
        alt = "undo";
        src = IconUndo;
        break;
      case "landscape":
        alt = "landscape";
        src = Landscape;
        // break;
        return (
          <input
            type={"image"}
            onClick={this.props.onClick}
            alt={alt}
            src={src}
            style={{ ...iconStyle.small }}
          />
        );
      case "location_city":
        alt = "location_city";
        src = Location_City;
        // break;
        return (
          <input
            type={"image"}
            onClick={this.props.onClick}
            alt={alt}
            src={src}
            style={{ ...iconStyle.small }}
          />
        );
      case "camera_alt":
        return (
          <form
            onSubmit={formSubmitEvent => {
              formSubmitEvent.preventDefault();
              this.props.onClick();
            }}
          >
            <button className={this.props.classNames} type="submit">
              <Avatar>
                <CameraAlt fontSize={"small"} />
              </Avatar>
            </button>
          </form>
        );
      case "crop":
        return (
          <form
            onSubmit={formSubmitEvent => {
              formSubmitEvent.preventDefault();
              // this.props.onClick();
            }}
          >
            <button className={this.props.classNames} type="submit">
              <Avatar>
                <CropIcon fontSize={"small"} onClick={this.props.onClick} />
              </Avatar>
            </button>
          </form>
        );
      case "format_color_fill":
        return (
          <form
            onSubmit={formSubmitEvent => {
              formSubmitEvent.preventDefault();
              // this.props.onClick();
            }}
          >
            <button className={this.props.classNames} type="submit">
              <Avatar>
                <FormatColorFill
                  fontSize={"small"}
                  onClick={this.props.onClick}
                />
              </Avatar>
            </button>
          </form>
        );
      case "text_fields":
        return (
          <form
            onSubmit={formSubmitEvent => {
              formSubmitEvent.preventDefault();
              // this.props.onClick();
            }}
          >
            <button className={this.props.classNames} type="submit">
              <Avatar>
                <TextFields fontSize={"small"} onClick={this.props.onClick} />
              </Avatar>
            </button>
          </form>
        );
      case "faCrop":
        return (
          <form
            onSubmit={formSubmitEvent => {
              formSubmitEvent.preventDefault();
              // this.props.onClick();
            }}
          >
            <button
              className={this.props.classNames}
              type="submit"
              onClick={this.props.onClick}
            >
              <Avatar>
                <FontAwesomeIcon icon={faCrop} />
              </Avatar>
            </button>
          </form>
        );
      case "faFillDrip":
        return (
          <form
            onSubmit={formSubmitEvent => {
              formSubmitEvent.preventDefault();
              // this.props.onClick();
            }}
          >
            <button
              className={this.props.classNames}
              type="submit"
              onClick={this.props.onClick}
            >
              <Avatar>
                <FontAwesomeIcon icon={faFillDrip} />
              </Avatar>
            </button>
          </form>
        );
      case "faTextHeight":
        return (
          <form
            onSubmit={formSubmitEvent => {
              formSubmitEvent.preventDefault();
              // this.props.onClick();
            }}
          >
            <button
              className={this.props.classNames}
              type="submit"
              onClick={this.props.onClick}
            >
              <Avatar>
                <FontAwesomeIcon icon={faTextHeight} />
              </Avatar>
            </button>
          </form>
        );
      case "faBinoculars":
        return (
          <form
            onSubmit={formSubmitEvent => {
              formSubmitEvent.preventDefault();
              // this.props.onClick();
            }}
          >
            <button
              className={this.props.classNames}
              type="submit"
              onClick={this.props.onClick}
              style={{ ...iconStyle.common }}
            >
              <Avatar style={{ backgroundColor: "green" }}>
                <FontAwesomeIcon
                  icon={faBinoculars}
                  style={{ backgroundColor: "green" }}
                />
              </Avatar>
            </button>
          </form>
        );
      case "faLock":
        return (
          <form
            onSubmit={formSubmitEvent => {
              formSubmitEvent.preventDefault();
              // this.props.onClick();
            }}
          >
            <button
              className={this.props.classNames}
              type="submit"
              onClick={this.props.onClick}
              style={{ ...iconStyle.small }}
            >
              <Avatar style={{ backgroundColor: "green" }}>
                <FontAwesomeIcon
                  icon={faLock}
                  style={{ backgroundColor: "green" }}
                />
              </Avatar>
            </button>
          </form>
        );
      default:
        alt = "null";
        src = null;
        break;
    }

    return (
      <input
        type={"image"}
        onClick={this.props.onClick}
        alt={alt}
        src={src}
        style={{ ...iconStyle.common }}
      />
    );
  }
}

export default UIButton;
/*
<FontAwesomeIcon icon={faCoffee} />
<FontAwesomeIcon icon={faBinoculars} />
<FontAwesomeIcon icon={faFillDrip} />
<FontAwesomeIcon icon={faCamera} />
 
<FontAwesomeIcon icon={faLock} />
<FontAwesomeIcon icon={faCrop} />
<FontAwesomeIcon icon={faObjectGroup} />
*/
