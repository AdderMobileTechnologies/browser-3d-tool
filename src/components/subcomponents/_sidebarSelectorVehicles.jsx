import React from "react";
import GrayCar from "../../assets/Adder_3D_Tool2/carMeshSelectorTransparent.png";
import Grid from "@material-ui/core/Grid"; //

export default function SidebarSelectorVehicles(props) {
  console.log("SidebarSelectorVehicles: props:", props);

  const handleSubcomponentClick = e => {
    console.log("handleSubcomponentClick .....");
    console.log("e.target.id = ", e.target.id);
    console.log("e.target.name =", e.target.name);
    console.log("props sent in during constructor:", props);
    let returnData = { id: e.target.id, name: e.target.name };
    props.callback(returnData);
  };

  return (
    <Grid
      container
      style={{
        backgroundImage: "url(" + GrayCar + ")",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        height: "300px",
        backgroundPosition: "center"
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs></Grid>
        <Grid item xs></Grid>
        <Grid item xs></Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs></Grid>
        <Grid item xs>
          <button
            className="buttonSidebar xbuttonHood"
            id="buttonHood"
            name={props.data["hoodMeshId"]}
            onClick={handleSubcomponentClick}
          >
            HOOD
          </button>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs></Grid>
        <Grid item xs></Grid>
        <Grid item xs></Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs>
          <button
            className="buttonSidebar xbuttonLeft"
            id="buttonLeft"
            name={props.data["leftMeshId"]}
            onClick={handleSubcomponentClick}
          >
            LEFT
          </button>
        </Grid>
        <Grid item xs>
          <button
            className="buttonSidebar xbuttonRoof"
            id="buttonRoof"
            name={props.data["roofMeshId"]}
            onClick={handleSubcomponentClick}
          >
            ROOF
          </button>
        </Grid>
        <Grid item xs>
          <button
            className="buttonSidebar xbuttonRight"
            id="buttonRight"
            name={props.data["rightMeshId"]}
            onClick={handleSubcomponentClick}
          >
            RIGHT
          </button>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs></Grid>
        <Grid item xs>
          <button
            className="buttonSidebar xbuttonTrunk"
            id="buttonTrunk"
            name={props.data["trunkMeshId"]}
            onClick={handleSubcomponentClick}
          >
            TRUNK
          </button>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
    </Grid>
  );
}

/*
<div
className="relativeContainer car"
id="ButtonContainer"
style={{ height: "300px", position: "relative" }}
>
<p>Select a Component to Edit</p>

 
<button
  className="buttonSidebar buttonHood"
  id="buttonHood"
  name={props.data["hoodMeshId"]}
  onClick={handleSubcomponentClick}
>
  HOOD
</button>
<button
  className="buttonSidebar buttonLeft"
  id="buttonLeft"
  name={props.data["leftMeshId"]}
  onClick={handleSubcomponentClick}
>
  LEFT
</button>
<button
  className="buttonSidebar buttonRoof"
  id="buttonRoof"
  name={props.data["roofMeshId"]}
  onClick={handleSubcomponentClick}
>
  ROOF
</button>
<button
  className="buttonSidebar buttonRight"
  id="buttonRight"
  name={props.data["rightMeshId"]}
  onClick={handleSubcomponentClick}
>
  RIGHT
</button>
<button
  className="buttonSidebar buttonTrunk"
  id="buttonTrunk"
  name={props.data["trunkMeshId"]}
  onClick={handleSubcomponentClick}
>
  TRUNK
</button>
</div>
*/
