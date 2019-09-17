import React from "react";
import Billboard from "../../assets/Adder_3D_Tool2/billboardTopView.png";
import Grid from "@material-ui/core/Grid"; //

export default function SidebarSelectorBillboards(props) {
  console.log("SidebarSelectorBillboards: props:", props);

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
        backgroundImage: "url(" + Billboard + ")",
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
        <Grid item xs></Grid>
        <Grid item xs></Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs>
          <button
            className="buttonSidebar  "
            id="buttonLeft"
            name={props.data["sign1MeshId"]}
            onClick={handleSubcomponentClick}
          >
            One
          </button>
        </Grid>
        <Grid item xs></Grid>
        <Grid item xs>
          <button
            className="buttonSidebar  "
            id="buttonRight"
            name={props.data["sign2MeshId"]}
            onClick={handleSubcomponentClick}
          >
            Two
          </button>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs></Grid>
        <Grid item xs></Grid>
        <Grid item xs></Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs></Grid>
        <Grid item xs></Grid>
        <Grid item xs></Grid>
      </Grid>
    </Grid>
  );
}

/*
 <Grid container spacing={3}>
        <Grid item xs></Grid>
        <Grid item xs></Grid>
        <Grid item xs></Grid>
      </Grid>



  <div
          className="relativeContainer car"
          id="ButtonContainer"
          style={{ height: "300px" }}
        >
          <p>Select a Component to Edit</p>

         

          <button
            className="buttonSidebar buttonLeft"
            id="buttonLeft"
            name={props.data["sign1MeshId"]}
            onClick={handleSubcomponentClick}
          >
            One
          </button>

          <button
            className="buttonSidebar buttonRight"
            id="buttonRight"
            name={props.data["sign2MeshId"]}
            onClick={handleSubcomponentClick}
          >
            Two
          </button>
        </div>




      */
