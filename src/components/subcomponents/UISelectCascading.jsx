import React from "react";
import UISelectDynamic from './UIElements/UISelectDynamic';
import Grid from '@material-ui/core/Grid';

  class UISelectCascading extends React.Component {

			constructor(props){
                super(props);
              
                this.callback_UISelectCascading = this.callback_UISelectCascading.bind(this)
                //this.iconDelete =  props.iconDelete
            }
          
            callback_UISelectCascading(data){
                 
                
                switch (data.id) {
                    case "ad_type":
                      
                      //super cool, would be a way to scroll through images of different ad types or have them change as inputs change.

                        if(this.props.ad_type_active){
                            let cascadingData = {
                                ad_type : data.selectedOption,
                                ad_type_selected : true
                            }
                            this.props.iconDelete()
                            this.props.manageCascadingSelects_AdType(cascadingData)
                        }
                        break;

                    case "sub_type":
                        if(this.props.ad_type_selected){
                            let cascadingData = {
                                ad_type : this.props.ad_type,
                                ad_type_selected : this.props.ad_type_selected,
                                ad_subtype : data.selectedOption,
                                ad_subtype_selected : true,
                            }
                            this.props.manageCascadingSelects_AdType(cascadingData)
                        }
                        break;
                    case "detail":
                        if(this.props.ad_subtype_selected){
                           // 
                            var ad_asset =''
                            // if(data.selectedOption === "sportscar1"){
                            //     ad_asset = "porsche"
                            // }
                            // if(data.selectedOption === "stationwagon"){
                            //     ad_asset = "vw_toureg"
                            // }
                            if(data.selectedOption === "angled"){
                                ad_asset = "billboard1"
                            }

                            let cascadingData = {
                                ad_type :               this.props.ad_type,
                                ad_type_selected :      this.props.ad_type_selected,
                                ad_subtype :            this.props.ad_subtype,
                                ad_subtype_selected :   this.props.ad_subtype_selected,
                                ad_detail:              data.selectedOption,
                                ad_detail_selected:     true,
                                ad_asset:               ad_asset,
                                ad_asset_selected:      true,
                            }
                            this.props.manageCascadingSelects_AdType(cascadingData)
                            //ADD THE ASSET automatically at the 'DETAIL' level.
                        }
                        break;

                    default:
                        break;
                }
                

            }


			render() {

                
					return (
				 
                    <Grid container >
                            <Grid item xs={4}>
                                <div>
                                    
                                    <UISelectDynamic 
                                                    id="ad_type" 
                                                    options={ [
                                                        { name: 'Ad Type', id: 'none1' },
                                                        { name: 'Vehicle', id: 'vehicle' },
                                                        { name: 'Billboard', id: 'billboard' },
                                                        { name: 'Bulletin', id: 'bulletin' },
                                                        { name: 'Fleet Vehicles', id: 'fleet_vehicle' },
                                                        { name: 'Misc', id: 'misc' },
                                                    ]} 
                                                    //need current value: value = {this.props.ad_type }
                                                     value = {this.props.ad_type }
                                                    callback={this.callback_UISelectCascading}
                                                    >
                                    </UISelectDynamic>
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                {/** check if select parent has been activated. */}
                                {this.props.ad_type_selected && this.props.ad_type === 'vehicle' &&
                                    <div>
                                        
                                        <UISelectDynamic 
                                                        id="sub_type"
                                                        options={ [
                                                            { name: 'select', id: 'none2' },
                                                            { name: 'two door', id: '2door' },
                                                            { name: 'four door', id: '4door' },
                                                            
                                                        ]}
                                                        value = {this.props.ad_subtype } 
                                                        callback={this.callback_UISelectCascading}
                                                        >
                                        </UISelectDynamic>
                                    </div>
                            
                                }
                                {this.props.ad_type_selected && this.props.ad_type === 'billboard' &&
                                    <div>
                                        
                                        <UISelectDynamic 
                                                        id="sub_type"
                                                        options={ [
                                                            { name: 'select', id: 'none3' },
                                                            { name: 'single sided', id: 'single_sided' },
                                                            { name: 'two sided', id: 'two_sided' },
                                                        ]} 
                                                        value = {this.props.ad_subtype } 
                                                        callback={this.callback_UISelectCascading}
                                                        >
                                        </UISelectDynamic>
                                    </div>
                            
                                }
                                {this.props.ad_type_selected && this.props.ad_type === 'bulletin' &&
                                    <div>
                                        
                                        <UISelectDynamic 
                                                        id="sub_type"
                                                        options={ [
                                                            { name: 'select', id: 'none15' },
                                                            { name: 'bulletin_1', id: 'bulletin1' },
                                                            { name: 'bulletin_2', id: 'bulletin2' },
                                                        ]} 
                                                        value = {this.props.ad_subtype } 
                                                        callback={this.callback_UISelectCascading}
                                                        >
                                        </UISelectDynamic>
                                    </div>
                            
                                }
                                {this.props.ad_type_selected && this.props.ad_type === 'fleet_vehicle' &&
                                    <div>
                                         
                                        <UISelectDynamic 
                                                        id="sub_type"
                                                        options={ [
                                                            { name: 'select', id: 'none4' },
                                                            { name: 'Tractor Trailer', id: 'tractor_trailer' },
                                                            { name: 'Sprinter Vans', id: 'sprinter_van' },
                                                        ]} 
                                                        value = {this.props.ad_subtype } 
                                                        callback={this.callback_UISelectCascading}
                                                        >
                                        </UISelectDynamic>
                                    </div>
                            
                                }
                                 {this.props.ad_type_selected && this.props.ad_type === 'misc' &&
                                    <div>
                                         
                                        <UISelectDynamic 
                                                        id="sub_type"
                                                        options={ [
                                                            { name: 'Type Aircraft', id: 'none5' },
                                                            { name: 'Aircraft', id: 'aircraft' },
                                                            
                                                        ]} 
                                                        value = {this.props.ad_subtype } 
                                                        callback={this.callback_UISelectCascading}
                                                        >
                                        </UISelectDynamic>
                                    </div>
                            
                                }
                                
                            
                            </Grid>
                            <Grid item xs={4}>
                                  {/** vehicle details  */}
                                {this.props.ad_subtype_selected &&  this.props.ad_subtype === '2door' &&
                                    <div>
                                        
                                        <UISelectDynamic 
                                                        id="detail"
                                                        options={ [
                                                            { name: 'select', id: 'none6' },
                                                            { name: 'Sportscar', id: 'sportscar1' },
                                                            { name: 'Sportscar2', id: 'sportscar2' },
                                                            { name: 'Muscle', id: 'muscle' },
                                                            { name: 'Muscle2', id: 'muscle2' },
                                                            { name: 'Compact', id: 'compact' },
                                                            { name: 'Economy', id: 'economy' },
                                                            { name: 'Sport Sedan', id: 'sport_sedan' },
                                                            
                                                        ]} 
                                                        value = {this.props.ad_detail } 
                                                        callback={this.callback_UISelectCascading}
                                                        >
                                        </UISelectDynamic>
                                    </div>
                                }
                                {this.props.ad_subtype_selected &&  this.props.ad_subtype === '4door' &&
                                    <div>
                                        
                                        <UISelectDynamic 
                                                        id="detail"
                                                        options={ [
                                                            { name: 'select', id: 'none7' },
                                                            { name: 'Station Wagon', id: 'stationwagon' },
                                                            { name: 'Minivan', id: 'minivan' },
                                                            { name: 'SUV', id: 'suv' },
                                                            { name: 'Compact SUV', id: 'compact_suv' },
                                                            { name: 'EV-Crossover', id: 'ev_crossover' },
                                                            { name: 'Sedan', id: 'sedan' },
    
                                                            
                                                        ]} 
                                                        value = {this.props.ad_detail } 
                                                        callback={this.callback_UISelectCascading}
                                                        >
                                        </UISelectDynamic>
                                    </div>
                                }
                                {/** billboard details  */}
                                {this.props.ad_subtype_selected &&  this.props.ad_subtype === 'single_sided' &&
                                    <div>
                                        
                                        <UISelectDynamic 
                                                        id="detail"
                                                        options={ [
                                                            { name: 'Select', id: 'none8' },
                                                            { name: 'Short', id: 'short' },
                                                            { name: 'Medium', id: 'medium' },
                                                            { name: 'Tall', id: 'tall' },
                                                           
                                                            
                                                        ]} 
                                                        value = {this.props.ad_detail } 
                                                        callback={this.callback_UISelectCascading}
                                                        >
                                        </UISelectDynamic>
                                    </div>
                                }
                                  {this.props.ad_subtype_selected &&  this.props.ad_subtype === 'two_sided' &&
                                    <div>
                                        
                                        <UISelectDynamic 
                                                        id="detail"
                                                        options={ [
                                                            { name: 'Select', id: 'none9' },
                                                            { name: 'Parallel', id: 'parallel' },
                                                            { name: 'Angled', id: 'angled' },
                                                        ]} 
                                                        value = {this.props.ad_detail } 
                                                        callback={this.callback_UISelectCascading}
                                                        >
                                        </UISelectDynamic>
                                    </div>
                                }

                                 {/** fleet vehicle details  */}
                                 {this.props.ad_subtype_selected &&  this.props.ad_subtype === 'tractor_trailer' &&
                                    <div>
                                        
                                        <UISelectDynamic 
                                                        id="detail"
                                                        options={ [
                                                            { name: 'Select', id: 'none10' },
                                                            { name: '45ft Trailer', id: '45ft_trailer' },
                                                            { name: '53ft Trailer', id: '53ft_trailer' },
                                                            { name: 'Western Star 4900', id: 'western_star_4900' },
                                                            { name: 'Mac Superliner', id: 'mac_superliner' },
                                                            { name: 'Tank Trailer', id: 'tank_trailer' },
                                                           
                                                            
                                                        ]}
                                                        value = {this.props.ad_detail }  
                                                        callback={this.callback_UISelectCascading}
                                                        >
                                        </UISelectDynamic>
                                    </div>
                                }
                                  {this.props.ad_subtype_selected &&  this.props.ad_subtype === 'sprinter_van' &&
                                    <div>
                                        
                                        <UISelectDynamic 
                                                        id="detail"
                                                        options={ [
                                                            { name: 'Select', id: 'none11' },
                                                            { name: 'Mercedes Van - High Roof', id: 'mercedes_van_high_roof' },
                                                            { name: 'Mercedes Van', id: 'mercedes_van' },
                                                            { name: 'Ford Van', id: 'ford_van' },
                                                        ]} 
                                                        value = {this.props.ad_detail } 
                                                        callback={this.callback_UISelectCascading}
                                                        >
                                        </UISelectDynamic>
                                    </div>
                                }
                            
                            
                                
    
                            </Grid>
                           
                           {/**
                            <Grid item xs={3}>
                            {this.props.ad_detail_selected &&  this.props.ad_detail === 'sportscar1' &&
                                <div>
                                    
                                    <UISelectDynamic 
                                                    id="asset"
                                                    options={ [
                                                        { name: 'Select', id: 'non12e' },
                                                        { name: 'Porsche', id: 'porsche' },
                                                    
                                                        
                                                    ]} 
                                                    callback={this.callback_UISelectCascading}
                                                    >
                                    </UISelectDynamic>
                                </div>
                            }
    
                            {this.props.ad_detail_selected &&  this.props.ad_detail === 'sportscar2' &&
                                <div>
                                    
                                    <UISelectDynamic 
                                                    id="asset"
                                                    options={ [
                                                        { name: 'Select', id: 'none13' },
                                                        { name: 'Ferrari', id: 'ferrari' },
                                                        
                                                    ]} 
                                                    callback={this.callback_UISelectCascading}
                                                    >
                                    </UISelectDynamic>
                                </div>
                            }
                              {this.props.ad_detail_selected &&  this.props.ad_detail === 'stationwagon' &&
                                <div>
                                    
                                    <UISelectDynamic 
                                                    id="asset"
                                                    options={ [
                                                        { name: 'Select', id: 'none16' },
                                                        { name: 'VW Toureg', id: 'vw_toureg' },
                                                    
                                                        
                                                    ]} 
                                                    callback={this.callback_UISelectCascading}
                                                    >
                                    </UISelectDynamic>
                                </div>
                            }
                              {this.props.ad_detail_selected &&  this.props.ad_detail === 'angled' &&
                                <div>
                                    
                                    <UISelectDynamic 
                                                    id="asset"
                                                    options={ [
                                                        { name: 'Select', id: 'none14' },
                                                        { name: 'Billboard1', id: 'billboard1' },
                                                    
                                                        
                                                    ]} 
                                                    callback={this.callback_UISelectCascading}
                                                    >
                                    </UISelectDynamic>
                                </div>
                            }
                            </Grid>
                             */}
    
    
                    </Grid>
															
					);
			}
}
 
export default UISelectCascading
/*
at lowest level, we reuse the UIElement/UISelectDynamic 
next level up we create the component group of selects 
    which
        - shows/hides appropriate selects
        - sends appropriate data up to parent function for saving state.
        AT TOP LEVEL:
          manageCascadingSelects_AdType(data){

            this funtion persists data in state via the state.appState.ui_status 
            and state.appState.ui_selections objects.


            notes: 
            moving from top level babylonGui to UISidebar... 
                - need to pass the data method through UISidebar to The cascading selects. 
                - will need to include the cascader from Sidebar instead. 

            
*/
  //IMPORT: import UISelectCascading from './subcomponents/UISelectCascading';
            //CALL:
            /*
             <UISelectCascading 
                manageCascadingSelects_AdType={this.manageCascadingSelects_AdType} 
                ad_type_active={this.state.appState.ui_status.ad_type_active}
                ad_type={this.state.appState.ui_selections.ad_type}
                ad_type_selected={this.state.appState.ui_status.ad_type_selected}
                ad_subtype={this.state.appState.ui_selections.ad_subtype}
                ad_subtype_selected={this.state.appState.ui_status.ad_subtype_selected}
                ad_detail={this.state.appState.ui_selections.ad_detail}
                ad_detail_selected={this.state.appState.ui_status.ad_detail_selected}
                ad_asset={this.state.appState.ui_selections.ad_asset}
                ad_asset_selected={this.state.appState.ui_status.ad_asset_selected}
            ></UISelectCascading>
             */
            /** cascading AdType Controller */