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
import AdderImageEditor from "../AdderImageEditor";
import "./MUI_DraggableDialog.css";
/*
Styling Issues:
 



*/
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
  console.log("props on Draggable Dialog ...", props);
  //should have 'editing_mesh_id' now as well...should get passed along to the editor or at least used to bind the results together.

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    props.callback();
    setOpen(false);
  };

  const handleApply = () => {
    console.log("handle apply .....");
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open Image Editor
      </Button>
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
              onApplyCallback={DataURL => {
                console.log("ON APPLY");
                console.log("what params do we have after applying and edti.");
                console.log("mesh_id:", props.mesh_id);
                console.log("DataURL:", DataURL);
                let data = {};
                data.mesh_id = props.mesh_id;
                data.dataURL = DataURL;
                props.callback(data);
                //What do we need in order to apply it to an image class and to a model.?
              }}
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
