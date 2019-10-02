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
  /*
  this method is throwing a awarning and docs said to use a 'key' with the props.id. instead.
  componentWillReceiveProps = newProps => {
    // console.log("componentWillReceiveProps(newProps) ", newProps);
    //console.log(newProps.value);
    // this.setState({ value: newProps.value });
  };
  */
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
        {/** <label className="ui-text-input-label">{this.props.label}</label> */}
        <input
          key={this.props.id}
          className="ui-text-input"
          value={this.state.value}
          onChange={this.handleChange}
          onBlur={this.onBlur}
          placeholder={this.props.placeholder}
        />
      </div>
    );
  }
}

export default UITextInput;
