//region: MaterialUI Components
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import StarBorderIcon from '@material-ui/icons/StarBorder';


<Grid container spacing={0} id="ParentContainer">
{/** .UI-Header Grid */}
<Grid container item xs={12} id="Header" style={{marginTop: "10px"}}>
    <Grid item xs={4} id="LogoContainer"
    
   
    >
        <img src={AdderLogoAndName} style={{height: "auto", width: "500px"}} className="AdderLogoAndName" id={"AdderLogo"} alt="Adder Logo" />
    </Grid>
    <Grid item xs={5} id="Spacer"
    
     
    >
        {/** center space unoccupied */}
    </Grid>
    {/**TODO: move inline styles to style sheet. */}
    <Grid item
          xs={3}
         /* spacing={0}
          alignItems={"center"}
          justify={"center"}*/
          
    >
        <Grid container
              
              style={{
                  backgroundColor: "#afafaf",
                  marginTop: "10px",
                  height: "40px",
                  padding: "0px",
                
                  borderRadius: "16px",
                  boxShadow: "3px 3px 8px #2f2f2f"}} >
            
            <Grid item
                  xs={3}
                  
            >
                <img src={UserImage}
                     className="UserImage"
                     style={{height: "40px"}}
                     alt="The User Profile"
                     />
            </Grid>
            <Grid item
                   xs={3}
                  
                 
            >
                <p style={{
                    fontSize: "1em",
                    color: "#2f2f2f",
                    margin: "0px",
                    lineHeight: "40px",
                    textJustify: "center",
                    textAlign: "center"
                }}>
                    Ed Jellico
                </p>
            </Grid>
        </Grid>
    </Grid>
</Grid>
<Grid item xs={9} id="CanvasGrid">
   
    <Grid item xs={12}>
        <div className="babylonjsCanvasContainer">

             {/** .UI- the 3D Canvas Grid*/}

            <canvas id="gui_canvas_container"
                    className="babylonjsCanvas"
            style={{boxShadow: "5px 5px 8px #2f2f2f"}}/>

            {/** .UI- Overlaying Icons on top of 3D Canvas */}

            <div className="gui-overlay">
                <UIButton title="Screen Shot"
                          buttonText="Save Image"
                          onClick={this.screenshotButtonPress}
                          iconName="camera_alt"
                          classNames="icon_btn "
                />
                <UIButton title="Crop Image"
                          buttonText="Crop Image"
                          onClick={this.iconCrop}
                          iconName="crop"
                          classNames="icon_btn dev_warning"/>
                <UIButton title="XXXX"
                          buttonText="XXXX"
                          
                          onClick={this.iconFormatColorFill}
                          iconName="format_color_fill"
                          classNames="icon_btn dev_warning"/>
                <UIButton title="XXXX"
                          buttonText="XXXX"
                          onClick={this.iconTextFields}
                          iconName="text_fields"
                          classNames="icon_btn dev_warning"/>
                
            </div>

            <div className="gui-overlay-right">
               
                
                <MUIPopover callback={this.callbackEnvironment}></MUIPopover> {/**callback={this.callbackEnvironment} */}
            </div>


        </div>
    </Grid>

    {/** .UI- Block of Icon Actions Under the 3D Canvas */}
    <Grid container id={"iconParentContainer"} style={{marginTop: "25px", marginBottom: "5px"   }}>
        <Grid item xs={3} id={"iconRow1"}   >
            <Grid container       >

                <Grid item xs={4}   >
                    <UIButton title=""
                              buttonText=""
                              onClick={this.iconSave}
                              iconName="save"
                              // classNames="icon_btn "
                    style={{backgroundColor: "#afafaf"}}/>
                </Grid>
                <Grid item xs={4}>
                    <UIButton title=""
                              buttonText=""
                              onClick={this.iconDelete}
                              iconName="delete"
                              classNames="icon_btn "/>
                </Grid>
                <Grid item xs={4}>
                    <UIButton title=""
                              buttonText=""
                              onClick={this.iconRedo}
                              iconName="redo"
                              classNames="icon_btn "/>
                </Grid>
                
            </Grid>
            <Grid container   style={{marginTop: "15px" }}>
                <Grid item xs={4}>
                    <UIButton title=""
                              buttonText=""
                              onClick={this.iconSave_Alt}
                              iconName="download"
                              classNames="icon_btn "/>
                </Grid>
                <Grid item xs={4}>
                    <UIButton title=""
                              buttonText=""
                              onClick={this.iconShare}
                              iconName="share"
                              classNames="icon_btn "/>
                </Grid>
                <Grid item xs={4}>
                    <UIButton title=""
                              buttonText=""
                              onClick={this.iconUndo}
                              iconName="undo"
                              classNames="icon_btn "/>
                </Grid>
            </Grid>
           
        </Grid>
          {/** .UI- Screenshots Grid List  */}
        <Grid item xs={9} id={"iconRow1screenshots_row"}>
            <Grid item xs={12}  >
                {/**tileData={this.state.tileData} */}
                    <UIGridList tileData = {this.state.tileData}/>
                </Grid>
        </Grid>
      
    </Grid>
</Grid>
 {/** .UI- Sidebar  */}
<Grid item xs={3} id={"UISideBar"}>

    
{this.state.appState.ad_type === 'default' &&
    <UISideBar
        callbackScene={this.changeAdType}
        callbackEnvironment={this.callbackEnvironment}
        callback_UISelect_Existing_Designs = {this.callback_UISelect_Existing_Designs}
        iconDelete = {this.iconDelete}
        appState={this.state.appState}
        name={this.state.Ad_Scene.name}
        designName={this.state.userSession.designModel.designName}
        uvProportionsCallback={this.uvProportionsCallback}
        adType={this.state.appState.ad_type}
        changeDesignName={this.changeDesignName}
        editingDesignName={this.editingDesignName}
       
        //pass through:
        manageCascadingSelects_AdType=  {this.manageCascadingSelects_AdType} 

    />
    }
    {this.state.appState.ad_type === 'vehicle' &&
    <UISideBar
        callbackScene={this.changeAdType}
        callbackEnvironment={this.callbackEnvironment}
        callback_UISelect_Existing_Designs = {this.callback_UISelect_Existing_Designs}
        iconDelete = {this.iconDelete}
        appState={this.state.appState}
        name={this.state.Ad_Scene.name}
        designName={this.state.userSession.designModel.designName}
        uvProportionsCallback={this.uvProportionsCallback}
        adType={this.state.appState.ad_type}
        changeDesignName={this.changeDesignName}
        editingDesignName={this.editingDesignName}

        clickHood={() => this.handleOverlayMeshClicks("hood")}
        clickLeft={() => this.handleOverlayMeshClicks("left")}
        clickRoof={() => this.handleOverlayMeshClicks("roof")}
        clickRight={() => this.handleOverlayMeshClicks("right")}
        clickTrunk={() => this.handleOverlayMeshClicks("trunk")}
        //pass through:
        manageCascadingSelects_AdType=  {this.manageCascadingSelects_AdType} 

    />
    }
    {this.state.appState.ad_type === 'billboard' &&
    <UISideBar
        callbackScene={this.changeAdType}
        callbackEnvironment={this.callbackEnvironment}
        callback_UISelect_Existing_Designs = {this.callback_UISelect_Existing_Designs}
        iconDelete = {this.iconDelete}
        appState={this.state.appState}
        name={this.state.Ad_Scene.name}
        designName={this.state.userSession.designModel.designName}
        uvProportionsCallback={this.uvProportionsCallback}
        adType={this.state.appState.ad_type}
        changeDesignName={this.changeDesignName}
        editingDesignName={this.editingDesignName}

        clickLeftBillboard={() => this.handleSideBillboardClicks("sign_1")}
        clickRightBoard={() => this.handleSideBillboardClicks("sign_2")}
        //pass through 
        manageCascadingSelects_AdType=  {this.manageCascadingSelects_AdType} 

    />
    }
</Grid>
<Grid item xs={12}>
    Adder Creative Tool
   
</Grid>


               

{/** .UI- Modal Image Editor  */}
<Grid item xs={12} id="ModalImageEditorContainer">
    {this.state.currentVehicle.currentMesh.mesh_id &&
    <ModalImageEditor
        modalImageEditorWillEdit={this.modalImageEditorWillEdit}
        modalImageEditorDidEdit={this.modalImageEditorDidEdit}
        currentMesh={this.state.currentVehicle.currentMesh}
        callback_Mesh={this.callback_Mesh}
        uvProportionsCallback={this.uvProportionsCallback}
        scene_number={this.state.appState.scene_number}
    />
    }
    {this.state.currentBillboard.currentMesh.mesh_id &&
    <ModalImageEditor
        modalImageEditorWillEdit={this.modalImageEditorWillEdit}
        modalImageEditorDidEdit={this.modalImageEditorDidEdit}
        currentMesh={this.state.currentBillboard.currentMesh}
        callback_Mesh={this.callback_Mesh}
        uvProportionsCallback={this.uvProportionsCallback}
        scene_number={this.state.appState.scene_number}
    />
    }
    <a
        href="#"
        className="button"
        id="btn-download"
        download="my-file-name.png"
        style={{
            opacity: "0"
        }} >Download
    </a>
</Grid>
{/*<Grid>*/}
{/*    <Grid item xs={12}>*/}
{/*        <h3>Uploader :</h3>*/}
{/*        <Uploader/>*/}
{/*    </Grid>*/}
{/*</Grid>*/}
</Grid>