import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";

class AdderGuiUtility {
  gui_create_grid2 = advancedTexture => {
    // grid container for form controls
    var grid = new GUI.Grid();
    // grid.background = "#eee";
    // grid.alpha = 0.1;
    grid.width = "50%";
    grid.height = "10%";
    grid.border = "1px solid #fff";
    grid.addColumnDefinition(1.0);
    grid.addRowDefinition(3);
    grid.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    grid.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    advancedTexture.addControl(grid);
    return grid;
  };

  panel_Grid = (advancedTexture, header, slider, panel) => {
    advancedTexture.layer.layerMask = 2;

    switch (panel) {
      case 1:
        var panel1 = new BABYLON.GUI.StackPanel();
        panel1.width = "120px";
        panel1.fontSize = "14px";

        panel1.horizontalAlignment =
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel1.verticalAlignment =
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        advancedTexture.addControl(panel1);
        panel1.addControl(header);
        panel1.addControl(slider);
        break;
      case 2:
        var panel2 = new BABYLON.GUI.StackPanel();
        panel2.width = "120px";
        panel2.fontSize = "14px";

        panel2.horizontalAlignment =
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel2.verticalAlignment =
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        advancedTexture.addControl(panel2);
        panel2.addControl(header);
        panel2.addControl(slider);
        break;
      case 3:
        var panel3 = new BABYLON.GUI.StackPanel();
        panel3.width = "120px";
        panel3.fontSize = "14px";

        panel3.horizontalAlignment =
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel3.verticalAlignment =
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        advancedTexture.addControl(panel3);
        panel3.addControl(header);
        panel3.addControl(slider);
        break;
      default:
        break;
    }
  };

  control_sliderWithHeader = (mesh, headerTitle) => {
    var header = new BABYLON.GUI.TextBlock();
    header.text = headerTitle + ":";
    header.height = "40px";
    header.color = "white";
    header.paddingLeft = "15px";
    header.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    header.paddingTop = "10px";
    // panel3.addControl(header);

    var slider = new BABYLON.GUI.Slider();
    slider.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    slider.minimum = 0;
    slider.paddingLeft = 12;
    slider.maximum = 2;
    slider.isThumbCircle = true;
    slider.thumbWidth = "15px";
    slider.color = "#222";
    slider.shadowColor = "#ccc";
    slider.borderColor = "#000";
    slider.value = 0;
    slider.height = "16px";
    slider.width = "100px";
    slider.metadata = 0;
    slider.onValueChangedObservable.add(function(value) {
      // console.log("value:", value);
      // console.log("slider.metadata:", slider.metadata);
      if (mesh) {
        //compare for direction:
        if (value > slider.metadata) {
          mesh.rotation.y = parseFloat(value * 0.1).toFixed(2);
          // console.log("+++++:", mesh.rotation.y);
        } else {
          mesh.rotation.y = parseFloat(-(value * 0.1)).toFixed(2);
          //console.log("-----:", mesh.rotation.y);
        }
      }
      //using the metadata property to store the previous slider value for comparison when sliding left or right.
      slider.metadata = value;
    });

    var results = [header, slider];

    return results;
  };
}
export default AdderGuiUtility;

/*
  /* ORIGINAL: 
        if (value > slider.metadata) {
          mesh.rotation.y = value * 0.1;
        } else {
          mesh.rotation.y = -(value * 0.1);
        }
        */
/*
       //attempt #1 
        // Alternative:  may need to be converted to radians:
        if (value > 1) {
          //2 - sliderValue * 360
          let meshRotationValue = (2 - value) * 360 * (Math.PI / 180);
          mesh.rotation.y = meshRotationValue;
          console.log("meshRotationValue:", meshRotationValue);
        }
        if (value < 1) {
          // sliderValue * -360
          let meshRotationValueLess = value * -360 * (Math.PI / 180) ;
          mesh.rotation.y = meshRotationValueLess;
          console.log("meshRotationValueLess:", meshRotationValueLess);
        }
        if (value === 0 || value === 1 || value === 2) {
          //slider valu e = 0
          mesh.rotation.y = 0;
        }
        //end #1
        */

/*
        
IF 2 = 360 and 1 = 0 and 0 = -360







        */
