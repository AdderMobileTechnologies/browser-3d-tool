import React, { Component } from "react";

//import './UIRadioGroup.css'

class UIRadioGroup extends Component {
  constructor(props) {
    super(props);
    //this.appState = this.props.appState;
    this.callback = this.props.callback;
    this.title = this.props.title;
    this.state = {
      selectedOption: this.props.appState.currentRatio,
      
    };
   
  }
componentWillReceiveProps(nextProps){
  if(nextProps){
    console.log("RADIO BUTTON: nextProps:",nextProps);
    //set the radio button selected to the appState.currentRatio  that has cahnged as a result of a mesh selection.

  }
}
  handleOptionChange = changeEvent => {
    this.setState({
   selectedOption: changeEvent.target.value
   });
   // alert("option change")
   //TODO: need to change editingMesh.mesh_id in ModalImageEditor appropriately. 
   // ie. if mesh_id was leftside_large, and imageSizeData.selectedOption is small, then the new mesh_id is 'leftside_small'
   // or this.group +' _'+ this.selectedOption
    var imageSizeData = {};
    imageSizeData.selectedOption = changeEvent.target.value;
    this.callback(imageSizeData);
  };

  handleFormSubmit = formSubmitEvent => {
    formSubmitEvent.preventDefault();

    console.log("You have submitted:", this.state.selectedOption);
    var imageSizeData = {};
    imageSizeData.selectedOption = this.state.selectedOption;
    this.callback(imageSizeData);
  };

  render() {
    return (
      
        <div className="row  ">
          <div className="rg-col col-8">
            <p className="rg-title" >{this.props.title}</p>
            <form onSubmit={this.handleFormSubmit}>
              <div className="rg-form-group form-check">
                <label className="rg-label">
                  <input
                    type="radio"
                    name="react-tips"
                    value="small"
                    checked={ this.props.appState.currentRatio === "small"}
                    onChange={this.handleOptionChange}
                    className="rg-input-radio form-check-input"
                  />
                  small
                </label>
              </div>
              <div className="rg-form-group form-check">
                <label className="rg-label">
                  <input
                    type="radio"
                    name="react-tips"
                    value="medium"
                    checked={ this.props.appState.currentRatio=== "medium"}
                    onChange={this.handleOptionChange}
                    className="rg-input-radio form-check-input"
                  />
                  medium
                </label>
              </div>
              <div className="rg-form-group  form-check">
                <label className="rg-label">
                  <input
                    type="radio"
                    name="react-tips"
                    value="large"
                    checked={ this.props.appState.currentRatio === "large"}
                    onChange={this.handleOptionChange}
                    className="rg-input-radio form-check-input"
                  />
                  large
                </label>
              </div>
              {/**
                <div className="rg-form-group form-group">
                <button className=" rg-button btn btn-primary mt-2" type="submit">
                  Change
                </button>
              </div>
              */}
            
            </form>
          </div>
        </div>
       
    );
  }
}

export default UIRadioGroup;