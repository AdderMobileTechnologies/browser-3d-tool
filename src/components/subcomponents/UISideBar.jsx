import React from 'react';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import GrayCar from '../../assets/Adder_3D_Tool2/carMeshSelectorTransparent.png'
//TODO: NEED TO REMOVE GrayCar ASSET AND REPLACE WITH OUR OWN IMAGE!!!!!
import BillBoard from '../../assets/Adder_3D_Tool2/billboardTopView.png'
import UISelectDynamic from './UIElements/UISelectDynamic';
 

//import MUI_TextFieldFilled from './UIElements/MUI_TextFieldFilled';

 //IMPORT: 
 import UISelectCascading from './UISelectCascading';
const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    title: {
        align:"center",
        marginTop:"30px",
        marginBottom:"30px",
        marginRight:"auto",
        marginLeft:"auto",
    },
    card: {
        minWidth: 275,
        backgroundColor:"#f4f6f8",
        boxShadow: "none"
    },
    image: {
        backgroundImage: 'url('+GrayCar+')',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center'
    },
    image_billboard: {
        backgroundImage: 'url('+BillBoard+')',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
    },
    ui_panel: {

    }

}));

const meshSelectorContainerStyle = {
    margin: "0px",
    width: "100%",
    height: "651px",
    boxShadow: "none",
    color: "#2f2f2f",
};

const meshSelectorCenterXOffset = 51;
const meshSelectorCenterYOffset = 41;
const meshSelectorButtonStyles = {
    common: {
        position:"absolute",
        fontSize:"1em",
        height: "30px",
        width: "70px",
        color: "#2f2f2f",
        boxShadow: "3px 3px 8px #2f2f2f"
    },
    vehicle: {
        hood: {
            top:`${meshSelectorCenterXOffset - 32}%`,
            left:`${meshSelectorCenterYOffset}%`,
        },
        roof: {
            top:`${meshSelectorCenterXOffset}%`,
            left:`${meshSelectorCenterYOffset}%`,
        },
        trunk: {
            top:`${meshSelectorCenterXOffset + 32}%`,
            left:`${meshSelectorCenterYOffset}%`,
        },
        left: {
            top:`${meshSelectorCenterXOffset}%`,
            left:`${meshSelectorCenterYOffset - 35}%`,
        },
        right: {
            top:`${meshSelectorCenterXOffset}%`,
            left:`${meshSelectorCenterYOffset + 35}%`,
        }
    },
    billboard: {
        left: {
            top:`${meshSelectorCenterXOffset - 5}%`,
            left:`${meshSelectorCenterYOffset + 3 - 20}%`,
        },
        right: {
            top:`${meshSelectorCenterXOffset - 5}%`,
            left:`${meshSelectorCenterYOffset + 3 + 20}%`,
        }
    }
};

export default function UISideBar(props){
    const classes = useStyles();
    function designNameChange(e){
        props.changeDesignName(e.target.value)
    }
    function designNameEditing(e){
        props.editingDesignName(e.target.value)
    }
    // designName={this.state.userSession.designModel.designName}
    // props.designName
   /* const styles = {
        input: {
            color: "white"
        }
    };
        */
 
    let existing_designs = JSON.parse(localStorage.getItem('savedDesignsArray')) || [];
    let optionsArray = [];
    optionsArray.push({ name: 'select', id: 'none'});
    for(var i=0; i < existing_designs.length; i++){
        optionsArray.push({ name: existing_designs[i]['designName'], id: existing_designs[i]['designName'] })
    }



    var  size_options = [
            { name: 'small', id: 'small' },
            { name: 'medium', id: 'medium' },
            { name: 'large', id: 'large' },
            
    ]
 
    return (
        <div id="UISideBarRootDiv" style={{height: "875px", boxShadow: "5px 10px 8px #2f2f2f", backgroundColor:"#afafaf", paddingLeft: "10px", paddingRight: "10px", marginLeft: "20px", marginRight: "10px", borderRadius: "16px"}}>
            {/* .UI- Design Name Field*/}
            <Grid container >
                
               
                 <TextField
                    id="filled-name"
                    label="Design Name"
                    className={classes.textField}
                    value={props.designName}
                    //onChange={handleChange('name')}
                    onBlur={designNameChange}
                    onChange={designNameEditing}
                    margin="normal"
                    variant="filled"
                    inputProps={{
                        inputstyle: {
                            color: "#ffffff",
                            fontSize: "1.5em"
                        }
                    }}
                    style={{width: "100%", fontSize: "1.5em", color: "#2f2f2f"}}
                />


                
            </Grid>
            {/* .UI- Dropdown Boxes */}
          
              
                 <UISelectCascading 
                    manageCascadingSelects_AdType=  {props.manageCascadingSelects_AdType} 
                    ad_type_active=                 {props.appState.ui_status.ad_type_active}
                    ad_type=                        {props.appState.ui_selections.ad_type}
                    ad_type_selected=               {props.appState.ui_status.ad_type_selected}
                    ad_subtype=                     {props.appState.ui_selections.ad_subtype}
                    ad_subtype_selected=            {props.appState.ui_status.ad_subtype_selected}
                    ad_detail=                      {props.appState.ui_selections.ad_detail}
                    ad_detail_selected=             {props.appState.ui_status.ad_detail_selected}
                    ad_asset=                       {props.appState.ui_selections.ad_asset}
                    ad_asset_selected=              {props.appState.ui_status.ad_asset_selected}
                    iconDelete=                     {props.iconDelete}
                ></UISelectCascading>  

            <hr style={{color: "#727272", backgroundColor: "#727272", height: "1px", border: "none"}}/>
            { props.adType === "vehicle" &&
                <Grid container> 
                    <Grid item xs={8}>
                        
                    </Grid>
                    <Grid item xs={4}>
                   
       

                        <UISelectDynamic
                            callback={props.uvProportionsCallback}
                            options={size_options}
                            />
                    
                    </Grid>
                    
                    <hr style={{color: "#727272", backgroundColor: "#727272", height: "1px", border: "none"}}/>
                </Grid>
            }
            {/* .UI- Mesh Selectors*/}
            { props.adType === 'vehicle'  &&
            <Grid item xs={12} className={classes.image} style={meshSelectorContainerStyle}>
                <div className="relativeContainer"
                     id="ButtonContainer"
                     style={meshSelectorContainerStyle}>

                    <Typography className={classes.title}
                                color="textSecondary"
                                style={{textAlign:"center", color: "#2f2f2f"}}>
                        Select a Component to Edit
                    </Typography>
                    <button onClick={props.clickHood}
                            className="buttonSidebar"
                            style={{...meshSelectorButtonStyles.common, ...meshSelectorButtonStyles.vehicle.hood}}>
                        HOOD
                    </button>
                    <button onClick={props.clickLeft}
                            className="buttonSidebar"
                            style={{...meshSelectorButtonStyles.common, ...meshSelectorButtonStyles.vehicle.left}}>
                        LEFT
                    </button>
                    <button onClick={props.clickRoof}
                            className="buttonSidebar"
                            style={{...meshSelectorButtonStyles.common, ...meshSelectorButtonStyles.vehicle.roof}}>
                        ROOF
                    </button>
                    <button onClick={props.clickRight}
                            className="buttonSidebar"
                            style={{...meshSelectorButtonStyles.common, ...meshSelectorButtonStyles.vehicle.right}}>
                        RIGHT
                    </button>
                    <button onClick={props.clickTrunk}
                            className="buttonSidebar"
                            style={{...meshSelectorButtonStyles.common, ...meshSelectorButtonStyles.vehicle.trunk}}>
                        TRUNK
                    </button>
                </div>
             
            </Grid>
            }

            { props.adType === 'billboard'  &&
            <Grid item xs={12} className={classes.image_billboard} style={meshSelectorContainerStyle} >
                <div className="relativeContainer"
                     id="ButtonContainer"
                     style={meshSelectorContainerStyle}>

                    <Typography className={classes.title}
                                color="textSecondary"
                                style={{textAlign:"center"}}>
                        Select a Component to Edit
                    </Typography>
                    <button id="left_billboard_button"
                            onClick={props.clickLeftBillboard}
                            style={{...meshSelectorButtonStyles.common, ...meshSelectorButtonStyles.billboard.left}}>
                        LEFT
                    </button>
                    <button id="right_button_click"
                            onClick={props.clickRightBoard}
                            style={{...meshSelectorButtonStyles.common, ...meshSelectorButtonStyles.billboard.right}}>
                        RIGHT
                    </button>
                </div>
                 
            </Grid>
            }
            <Grid container>
                <Grid item>
                    Existing Designs:
                    <UISelectDynamic 
                        id="saved_designs" 
                        options = {optionsArray}
                        callback={props.callback_UISelect_Existing_Designs}
                    >
                    </UISelectDynamic>
                </Grid>
            </Grid>
        </div>
    );
}