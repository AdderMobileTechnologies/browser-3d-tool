import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
//import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper from "@material-ui/core/Paper";
import Draggable from "react-draggable";

import "tui-image-editor/dist/tui-image-editor.css";
import AdderImageEditor from "./AdderImageEditor";
import "./MUI_DraggableDialog.css";

function PaperComponent(props) {
  return (
    <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper
        {...props}
        style={{ width: "100%", maxWidth: "100% !important" }}
      />
    </Draggable>
  );
}
/* TODO: see console error warning in comments at bottom of page. */
export default function DraggableDialog(props) {
  // console.log("props on Draggable Dialog ...", props);
  ///////////////////////////////////////////////////////
  const [open, setOpen] = React.useState(true);
  /*
  const handleClickOpen = () => {
    // console.log("MODAL: handleClickOpen()");
    // console.log(this.state.open);
    setOpen(true);
  };
*/
  const handleClose = () => {
    // console.log("MODAL: handleClose()");
    // console.log(this.state.open); can not read property 'state' of undefined.
    setOpen(false);
    props.imageEditorClose();
  };
  /////////////////////////////////////////////////////////////
  // const handleApply = () => {
  //   console.log("handle apply .....");
  //   setOpen(false);
  // };

  const handleImageEditorResults = dataURL => {
    //COMMENT OUT ALTOGETHER
    setOpen(false); //move this before the callback
    //console.log("MODAL: handleImageEditorResults()");
    //console.log(this.state.open); result: can not read property 'state' of undefined.
    //Usage: Editing-Mesh

    props.imageEditorCallback(dataURL);

    //setOpen(false); // added here to see if order of operations ws playing  role in this.
  };

  return (
    <div>
      {/**  

      <Button
        variant="outlined"
        color="primary"
        //onLoad={handleClickOpen}
        onClick={handleClickOpen}
      >
        Open Image Editor
      </Button>
      */}
      {/** 
       React limits the number of renders to prevent an infinite loop.
      {props.isEditing && handleClickOpen()}
      {!props.isEditing && handleClose()} 
      */}

      <Dialog
        children="none"
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
        style={{ width: "96% ", marginRight: "auto", marginLeft: "auto" }}
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          Image Editor
        </DialogTitle>
        {/** IF DialogTitle does NTO have a string value it will throw an error in console. */}
        <DialogContent>
          {/** <DialogContentText> </DialogContentText> Because this was wrapped around divs and it creates itself as <p> we got those console errors.*/}
          <AdderImageEditor
            height={800}
            width={1000}
            mesh_id={props.mesh_id}
            onApplyCallback={handleImageEditorResults}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

/*
Example of Warnings in the console related to MUIDraggableDialog
index.js:1375 Warning: Failed prop type: The prop `children` is marked as required in `ForwardRef(DialogTitle)`, but its value is `undefined`.
    in ForwardRef(DialogTitle) (created by WithStyles(ForwardRef(DialogTitle)))
    in WithStyles(ForwardRef(DialogTitle)) (at MUI_DraggableDialog.jsx:88)
    in div (created by ForwardRef(Paper))....

*/
