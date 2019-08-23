/* Purpose : 
Use a library for babylon interaction with react.
https://www.npmjs.com/package/react-babylonjs
*/
import React from "react";

import { Scene, FreeCamera, HemisphericLight, Sphere, Ground , Engine} from 'react-babylonjs'
import { Vector3 } from 'babylonjs';
 
const DefaultPlayground = () => (
  <Engine canvasId="sample-canvas">
    <Scene>
      <FreeCamera name="camera1" position={new Vector3(0, 5, -10)} target={Vector3.Zero()} />
      <HemisphericLight name="light1" intensity={0.7} direction={Vector3.Up()} />
      <Sphere name="sphere1" diameter={2} segments={16} position={new Vector3(0, 1, 0)} />
      <Ground name="ground1" width={6} height={6} subdivisions={2}  />
    </Scene>
  </Engine>
)
 
export default DefaultPlayground