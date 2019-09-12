import React, { Component } from "react";

import "./UITextInput.css";

class UITextInput extends Component {
  constructor(props) {
    super(props);
    this.callback = this.props.callback;
    this.state = {
      id: this.props.id,
      value: this.props.value,
      placeholder: this.props.placeholder,
      options: this.props.options
    };
  }
  handleChange = e => {
    console.log("UITextInput:handleChange() e.target:", e.target);
    this.setState({ value: e.target.value });
  };

  onBlur = e => {
    console.log("UITextInput:onBlur() e.target:", e.target);
    var data = {};
    data.id = this.state.id;
    data.value = this.state.value;
    this.callback(data);
  };
  render() {
    return (
      <div className="ui-text-input-group">
        <label className="ui-text-input-label">{this.props.label}</label>
        <input
          className="ui-text-input"
          value={this.props.value}
          onChange={this.handleChange}
          onBlur={this.onBlur}
          placeholder={this.props.placeholder}
        />
      </div>
    );
  }
}

export default UITextInput;
