import React from "react";
 import SceneFast from './SceneFast';
 
  class Main extends React.Component {

			constructor(props){
				super(props);
				this.state = {

				}
			}
		
		

			render() {
					return (
						
						<div>
							<div>Main</div>
							<SceneFast/>
                            
						</div>
															
					);
			}
}
 
export default Main
/*
TODO: 
BUGS: 
   

*/

/* LIFECYCLE METHODS:
	componentWillReceiveProps(){ }
	componentWillMount(){ }
	componentDidMount(){ }
	componentWillUpdate(){ }
	componentDidUpdate(){ }
	componentWillUnmount(){ }
*/