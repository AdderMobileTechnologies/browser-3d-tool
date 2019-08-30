import React, {Component} from "react";
class UISelectDynamic extends Component {
    constructor(props) {
        super(props);
        this.callback = this.props.callback;
        this.state = {
            id: this.props.id,
            options: this.props.options,
            value: this.props.value,
        };
    }
    handleChange = e => {
        var data = {};
        data.selectedOption = e.target.value;
        data.id = this.state.id;
        this.callback(data);
    }
    render() {
        let optionTemplate = this.state.options.map(v => (
            <option  value={v.id} className="ui-select-option" >{v.name}</option>
          ));
          //FIX:change:this.state.value to this.props.value....//
       
        return (
            <select className="ui-select" value={this.props.value} onChange={this.handleChange} 
             
           
            >
                {optionTemplate}
            </select>
        );
    }
}

export default UISelectDynamic;

/*
example options:
options_model: [
        { name: 'One', id: 1 },
        { name: 'Two', id: 2 },
        { name: 'Three', id: 3 },
        { name: 'four', id: 4 }
],

or 

  var  options_model = [
            { name: 'One', id: 1 },
            { name: 'Two', id: 2 },
            { name: 'Three', id: 3 },
            { name: 'four', id: 4 }
    ]

    
*/