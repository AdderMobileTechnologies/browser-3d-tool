import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
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

export default function DraggableDialog(props) {
  // console.log("props on Draggable Dialog ...", props);
  ///////////////////////////////////////////////////////
  const [open, setOpen] = React.useState(true);

  const handleClickOpen = () => {
    // console.log("MODAL: handleClickOpen()");
    // console.log(this.state.open);
    setOpen(true);
  };

  const handleClose = () => {
    // console.log("MODAL: handleClose()");
    // console.log(this.state.open); can not read property 'state' of undefined.
    setOpen(false);
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
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
        style={{ width: "96% ", marginRight: "auto", marginLeft: "auto" }}
      >
        <DialogTitle
          style={{ cursor: "move" }}
          id="draggable-dialog-title"
        ></DialogTitle>
        <DialogContent>
          <DialogContentText>
            <AdderImageEditor
              height={800}
              width={1000}
              mesh_id={props.mesh_id}
              onApplyCallback={handleImageEditorResults}
            />
          </DialogContentText>
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
