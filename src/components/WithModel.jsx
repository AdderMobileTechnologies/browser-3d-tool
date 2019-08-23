import React, { Component } from 'react'
//import { Button } from 'reactstrap'
import { Engine, Scene, ArcRotateCamera, HemisphericLight, withBabylonJS } from 'react-babylonjs'
import { Vector3, Color3, ActionManager, SetValueAction } from 'babylonjs';
//import { PrismCode } from 'react-prism';
//import Octicon, {ArrowDown, ArrowUp} from '@githubprimer/octicons-react'
import ScaledModelWithProgress from './ScaledModelWithProgress'

// import './WithModel.css'

class WithModel extends Component 
{
  constructor() {
    super();
    
    this.state = {
      avocadoYPos: -1.5,
      avocadoScaling: 3.0
    }

    this.moveAvocadoUp = this.moveAvocadoUp.bind(this);
    this.moveAvocadoDown = this.moveAvocadoDown.bind(this);
    this.increaseAvocadoSize = this.increaseAvocadoSize.bind(this);
    this.decreaseAvocadoSize = this.decreaseAvocadoSize.bind(this);
    this.onModelLoaded = this.onModelLoaded.bind(this);
  }

  moveAvocadoDown() {
    this.setState((state) => ({
      ...state,
      avocadoYPos: state.avocadoYPos - 0.5
    }))
  }

  moveAvocadoUp() {
    this.setState((state) => ({
      ...state,
      avocadoYPos: state.avocadoYPos + 0.5
    }))
  }

  increaseAvocadoSize() {
    this.setState((state) => ({
      ...state,
      avocadoScaling: state.avocadoScaling + 0.1
    }))
  }

  decreaseAvocadoSize() {
    this.setState((state) => ({
      ...state,
      avocadoScaling: state.avocadoScaling - 0.1
    }))
  }

  onModelLoaded(model, sceneContext) {
    let mesh = model.meshes[1];
    mesh.actionManager = new ActionManager(sceneContext.scene);
    mesh.actionManager.registerAction(
      new SetValueAction(
          ActionManager.OnPointerOverTrigger,
          mesh.material,
          'wireframe',
          true
      )
    )
    mesh.actionManager.registerAction(
      new SetValueAction(
          ActionManager.OnPointerOutTrigger,
          mesh.material,
          'wireframe',
          false
      )
    )
  }

  render() {
    let baseUrl = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/";
    return (
      <div>
        <div className="row">
          <div className="col-xs-3 col-lg-3 align-top">'pointer over' boombox to see mesh</div>
          <div className="col-xs-3 col-lg-3 align-top">
            Move Avocado: 
            {/**<Octicon icon={ArrowUp}/> <Octicon icon={ArrowDown}/> */}
            <button onClick={this.moveAvocadoUp}>up</button>
            &nbsp;&nbsp;
            <button onClick={this.moveAvocadoDown}>down</button>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <Engine antialias={true} adaptToDeviceRatio={true} canvasId="sample-canvas">
              <Scene>
                <ArcRotateCamera name="camera1" alpha={Math.PI / 2} beta={Math.PI / 2} radius={9.0} target={Vector3.Zero()} minZ={0.001} />
                <HemisphericLight name="light1" intensity={0.7} direction={Vector3.Up()} />
                {/** */}
                   <ScaledModelWithProgress rootUrl={`${baseUrl}BoomBox/glTF/`} sceneFilename="BoomBox.gltf" scaleTo={3} 
                  progressBarColor={Color3.FromInts(255, 165, 0)} center={new Vector3(2.5, 0, 0)}
                  onModelLoaded={this.onModelLoaded}
                />

              
             
                <ScaledModelWithProgress rootUrl={`${baseUrl}Avocado/glTF/`} sceneFilename="Avocado.gltf" scaleTo={this.state.avocadoScaling} 
                  progressBarColor={Color3.FromInts(255, 165, 0)} center={new Vector3(-2.5, this.state.avocadoYPos, 0)}
                />
                  
              </Scene>
            </Engine>
          </div>
          <div className="col-xs-12 col-md-6">
            <pre>
              code was here
              </pre>
          </div>
        </div>
      </div>
    )
  }
}

export default withBabylonJS(WithModel)