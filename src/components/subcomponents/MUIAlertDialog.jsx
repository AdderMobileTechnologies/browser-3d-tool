import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import "./MUIAlertDialog.css";

export default function AlertDialog(props) {
  // console.log("MUI_AlertDialog:props:", props);
  const [open, setOpen] = React.useState(false);

  function handleClickOpen() {
    setOpen(true);
  }

  function handleClose(e) {
    console.log("e.target", e.target.innerHTML);
    let response = e.target.innerHTML;
    if (response === "Yes") {
      // works
      props.callback_Yes();
    } else {
      // works
      props.callback_No();
    }

    setOpen(false);
  }

  return (
    <div id="deleteAreYouSure">
      <Button
        variant="outlined"
        color="primary"
        onClick={handleClickOpen}
        style={{ display: "none" }}
      >
        ...clicked programatically ...
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Are You Sure?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You will lose all the work that you have not saved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            No
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
