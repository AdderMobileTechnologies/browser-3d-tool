import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import UIButton from './UIButton';
import MUI_IconButtons from './MUI_IconButtons'

export default function MUI_FormDialog(props) {
  const [open, setOpen] = React.useState(false);
  
      
    
    console.log("MUI_FormDialog props:",props)
      
   

  function handleClickOpen() {
    setOpen(true);
  }

  function handleClose(e) {
    console.log(e.target);
     let textValue = e.target.innerHTML.toLowerCase();
     console.log(textValue)
     var data = {}
    
    data.selectedOption = textValue;
    props.callback(data);

    setOpen(false);
  }

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        BG
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Background Scene</DialogTitle>
        <DialogContent>
          <DialogContentText>
             Select A Background Scene fro Your Design.
          </DialogContentText>
         
        </DialogContent>
        <DialogActions>
        <Button onClick={handleClose} color="primary" text="City">
            City
          </Button>
          <Button onClick={handleClose} color="primary" text="mountain">
            Mountain
          </Button>
         <UIButton title="landscape"
                                          buttonText="landscape"
                                          onClick={handleClose}
                                          iconName="landscape"
                                          classNames="icon_btn "
                                >fooey</UIButton> 

          <MUI_IconButtons></MUI_IconButtons>
          <Button onClick={handleClose} color="primary">
            x
          </Button>
          
        </DialogActions>
      </Dialog>
    </div>
  );
}