import React from "react";
import UIButton from "./UIElements/UIButton";
class UIGuiOverlay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <div className="gui-overlay">
          <UIButton
            title="Screen Shot"
            buttonText="Save Image"
            onClick={this.props.screenshotButtonPress}
            iconName="camera_alt"
            classNames="icon_btn "
          />
          <UIButton
            title="Crop Image"
            buttonText="Crop Image"
            onClick={this.props.iconCrop}
            iconName="crop"
            classNames="icon_btn dev_warning"
          />
          <UIButton
            title="XXXX"
            buttonText="XXXX"
            onClick={this.props.iconFormatColorFill}
            iconName="format_color_fill"
            classNames="icon_btn dev_warning"
          />
          <UIButton
            title="XXXX"
            buttonText="XXXX"
            onClick={this.props.iconTextFields}
            iconName="text_fields"
            classNames="icon_btn dev_warning"
          />
        </div>
      </div>
    );
  }
}

export default UIGuiOverlay;

/* LIFECYCLE METHODS:
	componentWillReceiveProps(){ }
	componentWillMount(){ }
	componentDidMount(){ }
	componentWillUpdate(){ }
	componentDidUpdate(){ }
	componentWillUnmount(){ }
*/
