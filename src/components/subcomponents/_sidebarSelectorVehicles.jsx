import React from "react";
import GrayCar from "../../assets/Adder_3D_Tool2/carMeshSelectorTransparent.png";
import Grid from "@material-ui/core/Grid"; //

export default function SidebarSelectorVehicles(props) {
  //console.log("SidebarSelectorVehicles: props:", props);

  const handleSubcomponentClick = e => {
    let returnData = { id: e.target.id, name: e.target.name };
    //console.log("sidebar vehicles return data:", returnData);
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
        <Grid item xs style={{ textAlign: "center" }}>
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
        <Grid item xs style={{ textAlign: "center" }}>
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
        <Grid item xs style={{ textAlign: "center" }}>
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
