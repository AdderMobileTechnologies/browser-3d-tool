import React, { Component } from "react";
import "./UISelect.css";
class UISelect extends Component {
  constructor(props) {
    super(props);
    this.callback = this.props.callback;
    this.state = {
      id: this.props.id,
      options: this.props.options,
      value: this.props.value
    };
  }
  handleChange = e => {
    let data = {};
    data.selectedOption = e.target.value;
    data.id = this.state.id;
    this.callback(data);
  };
  render() {
    let optionTemplate = this.props.options.map(v => (
      <option key={v.id} value={v.id} className="ui-select-option">
        {v.name}
      </option>
    ));
    //FIX:change:this.state.value to this.props.value....//

    return (
      <select
        id={this.props.id}
        className="ui-select"
        value={this.props.value}
        onChange={this.handleChange}
      >
        {optionTemplate}
      </select>
    );
  }
}

export default UISelect;

/*
example options:
options_model: [
        { name: 'One', id: 1 },
        { name: 'Two', id: 2 },
        { name: 'Three', id: 3 },
        { name: 'four', id: 4 }
],

or 

  let  options_model = [
            { name: 'One', id: 1 },
            { name: 'Two', id: 2 },
            { name: 'Three', id: 3 },
            { name: 'four', id: 4 }
    ]

    
*/
