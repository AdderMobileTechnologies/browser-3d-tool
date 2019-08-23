import React from "react";
 
// import PageWithScene from "./pageWithScene" 
// Example from babylon docs requires TextScript AND breaks anyway. https://doc.babylonjs.com/resources/babylonjs_and_reactjs
import DefaultPlayground from './defaultPlayground'
import WithModel from './WithModel'
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
                            <WithModel/>
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