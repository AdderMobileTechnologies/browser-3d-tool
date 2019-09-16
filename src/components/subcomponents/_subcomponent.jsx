import React from "react";

//import "./Subcomponent.css";
/**
 * Purpose:
 * This subcomponent should handle callbacks that are sent to it without choking , while not being a true React.Component.
 * I also need it to detect an 'event' and send back the e.target ...etc..
 */
/*
Call This Subcomponent Like This:
<Subcomponent
  callback={this.subCallback}
  data={{ key: "value" }}
></Subcomponent>;

...and the subCallback function looks like this...

  subCallback(args) {
    console.log("subCallback with args:", args);
  }
  
*/
export default function Subcomponent(props) {
  console.log("THE SubComponent: props:", props);

  const handleSubcomponentClick = e => {
    console.log("handleSubcomponentClick .....");
    console.log("e.target.id = ", e.target.id);
    console.log("e.target.name =", e.target.name);
    console.log("props sent in during constructor:", props);
    let returnData = { id: e.target.id, name: e.target.name };
    props.callback(returnData);
  };

  return (
    <div>
      <button
        id="buttonLeft"
        name={props.data["key"]}
        onClick={handleSubcomponentClick}
      >
        Click
      </button>
    </div>
  );
}
