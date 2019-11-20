
/*
mv babylonjs file from local to server:
scp original.0.4.0.OPTIMIZE_E-4.babylon bforte@dbdev.adder.io:~/ 
mv file to proper directory on the server:
sudo mv original.0.4.0.OPTIMIZE_E-4.babylon /var/www/html/assets/
password: adder123 

/*
OPTIMIZATION:
EXAMPLE MANIFEST:  needs the EXACT same name as scene file 

{
  "version" : 1,
  "enableSceneOffline" : true,
  "enableTexturesOffline" : true
}



//================================================================================
PROCEDURES: 
Reduce Geometry:
1. CTRL+ALT + R-click "Select Edge Rings"
2. Select -> Checker De-Select "selects every other"
3. Select -> Edge Loops 
4. X -> Edge Loops "delete edge loops"

Split Mesh:
1. Tab "enter edit mode"
2. A "to deselect"
3. Wire Frame "view"
4. B "Box Select tool"
5. P "to disconnect selection from object"

Group Objects: 
1. R-Click + Shift "select objects to join" 
2. CTRL+J "join" 
UnGroup:
1. Edit Mode 
2. A "deselect everything" 
3. L "select individual object" 
4. P "to separate from the group"

UV Map By Seams:
1. create split view 
    a. object in perspective view.
    b. uv/image view
2. UV side -> new image "create a new image to store map in named it 'monkeyface' ".
3. Edge Select 
4. ALT+SELECT the edges to map.
5. Mark Seam "define selection as a seam"
* CTRL+MMouse "zoom"
6. A "to select all edges/faces "
7. Unwrrap -> unwrap.
8. To see results set object to "Texture View"
9. Add Material
10. add Texture -> type "image/movie" -> select previously created image 'monkey face'
11. change 'Mapping' to UV 
* image* means you need to save the  image.

Export Single Object :
https://www.youtube.com/watch?v=jVSZDM_rT_I
1. select 
2. export -> obj (" CHECK the 'selection only' box ")
3. move all objects to a different layer
4. File -> import -> wavefront(.obj) 


Move Objects to A Different Layer: 
1) A select all 
2) M "layer options"
3) select the layer square you want them to be located in.

CENTER AN OBJECT IN THE GRID.
1) CTRL + SHIFT+ ALT +C 

Apply Texture To Mesh:
https://www.youtube.com/watch?v=eAS-XrT8I3c

1. c "circle select 
2. click on icon to see through object 
3. make sure to get every single vertex 
4. spacebar "type seam" 
5. Mark Seam (singular)
6. UV Editing 
7. UV Unwrap 
8. image -> open image "select the image you want to apply as texture."
9. in default view set view to texture to see.


Animation Export:
https://www.youtube.com/watch?v=5ofgn1rzFcI

UV Professional Tips:
https://www.youtube.com/watch?v=brnaAL-QwhU


//================================================================================

*/
/* ================================================================================
GOALS: 
1) apply images as textures to individual mesh objects that make up a car.
    a) R-door, L-door, B-window, etc. 
2) import mesh models such that they are globally positioned x,y,z properly.
3) UV Map each mesh so that it can receive the image in a whole and complete manner.
4) be able to adjust the positioning of the image/texture on the mesh object. 
5) Think though these goals in an Object Oriented fashion.
6) figure out why some meshes contain more mesh object than they are supposed to.
7) re-organize the files and directories so that it is more easy to manage.

================================================================================ */

/*
//================================================================================
REFERENCES: 
TODO :
- get control over the rotation properties of the car model.
- one of 3
  - add additional 'sign' objects to receive advertisement images.
  - figure out how to apply image to certain areas of a model.
  - figure out how to pull out objects ie. doors, windshields as separate objects
  that can have textures attached to them. 

  - need to sort out the 'image proportion' to the 'object/mesh/model' proportion.

  Research:
  How To Map Material to Individual Mesh Faces
    https://doc.babylonjs.com/how_to/createbox_per_face_textures_and_colors
    This method is only available when creating a mesh using the MeshBuilder method.
    ( USEFUL for signBox = BABYLON.MeshBuilder in GuiTest.2.jsx)

    Transfer Exported Blender Model To Server:
 scp /Users/adderbayon/Downloads/_blender_models/porsche-911-carrera-4s/source/porsche-911.3.babylon bforte@dbdev.adder.io:~


BLENDER NOTES: 
separating certain parts of a model in to different objjects.
https://docs.blender.org/manual/en/latest/modeling/meshes/editing/misc.html

INDIVIDUAL PROCESSES TO WORK OUT:
- create separate models from parent model without changing positions, import them into babylon and check alignment.(#)
- use UV Mapping to apply simple image to simple mesh(!) no improvements on this front yet.
- ? is it a matter of the image not being loaded yet?

- create separate child model, complicate surface with more faces, try applying image.
- figure how to use UV Mapping to apply image to complicated meshes.


LOOKS LIKE GOOD RESOURCE: 

https://www.davrous.com/2013/07/18/tutorial-part-6-learning-how-to-write-a-3d-software-engine-in-c-ts-or-js-texture-mapping-back-face-culling-webgl/

https://dzone.com/articles/babylonjs-how-load-babylon

https://www.eternalcoding.com/babylon-js-how-to-load-a-babylon-file-produced-with-blender/
One important thing to remember with Blender is to use the Blender Render if you want to export your scene to Babylon.js

https://sandbox.babylonjs.com/


////////////////////////////////////////////////
PRIMARY FOCUS: 
https://doc.babylonjs.com/resources/blender
////////////////////////////////////////////////
* biggest challenge: prepare mesh to have image applied to it as texture from babylon.

GOOD UV MAP TUTORIAL: 
cutting the seams to flatten out the model.
UV UNWRAPPING
https://www.youtube.com/watch?v=scPSP_U858k


importing blender to babylon 
https://www.youtube.com/watch?v=YKopIbdMkwE

export 3d blender model (has texture applied to it.)
https://www.youtube.com/watch?v=ZUaMJiscuHo&t=339s

Materials:
https://www.youtube.com/watch?v=u-n4YACcpUA&t=734s

IMPRT AN ENTIRE SCENE: 

sketchfab:
https://www.youtube.com/watch?v=vjZS1cuSXj0




UV UNWRAPPING


Advanced:
workflow for Making Meshes: Chess Pieces
https://www.youtube.com/watch?v=OX2DIAnOacU
https://www.youtube.com/watch?v=DeHasEMCzcc


Cut Elements in Half and Group Ungroup Elements:
https://www.youtube.com/watch?v=U3J-oYFdyqQ

UV Mapping:
https://www.youtube.com/watch?v=SMKQ36YIzDU

UV Map and Painting
https://www.youtube.com/watch?v=jdt_e78Dd64

Reducing Geometry Simplifying Meshes:
https://www.youtube.com/watch?v=Yptda_yKQIU


UV MApping : monkey face with TIFF file and painting
https://www.youtube.com/watch?v=WnCv3swOQIg
 






WORK SCRIPTS: 
secure copy images over to the server:
scp /Users/adderbayon/Downloads/complex-assembled.babylon  bforte@dbdev.adder.io:~
relocate asset on the server:
sudo mv complex-assembled.babylon /var/www/html/babylon_assets/

original.0.4.0.OPTIMIZE_E.babylon


GOOD REFERENCE: 
http://www.blender.hu/tutor/kdoc/Blender_Cheat_Sheet.pdf
https://download.blender.org/documentation/BlenderHotkeyReference.pdf



Babylon Positioning The Camera:
https://doc.babylonjs.com/babylon101/cameras#constructing-a-universal-camera



Blender : merge uv map islands
https://blender.stackexchange.com/questions/49812/how-to-join-two-uv-maps-pieces-into-one



Blender Moving UV Map objects:
https://www.youtube.com/watch?v=YfgnvDakWms

Reverse Image on UV Map
in EDIT mode, Tools -> Mirror X



Blender Pixels to Object Meshes:
pixel size doesn’t make much sense in 3D, but you could set your camera to orthographic so 
object distance will not affect it’s size, and then link ortho scale and render size values, 
for instance setting render size to 800x600 and camera scale to 8 will give you a 8x6 BU (blender units) canvas… so 
a default cube there will be 200x200x200 pixels
 

scale = scene.render.resolution_percentage / 100
pixels_in_u_per_mm = resolution_x_in_px * scale / sensor_width_in_mm
pixels_in_v_per_mm = resolution_y_in_px * scale * aspect_ratio / sensor_height_in_mm
pixel_size_in_u_direction = 1/pixels_in_u_per_mm
pixel_size_in_v_direction = 1/pixels_in_v_per_mm

Knife TOol:
https://www.youtube.com/watch?v=Yena_TKipIw


Very Skilled Machine-Like Mesh Maker:
https://www.youtube.com/watch?v=2JLbNwcKYDs

Bisect:
https://www.youtube.com/watch?v=-QfLdbzSZdw

Select Boundary Edges:
https://blender.stackexchange.com/questions/21196/how-to-convert-edge-selection-to-outer-edges-only

Remove UV MAP Island

*/

// Optimizing Blender and Babylonjs : 5-16-2019
/*
https://blender.stackexchange.com/questions/31467/how-to-reduce-vertex-count-on-a-mesh


The easiest way to reduce the vertex count on a model is probably to use the Decimate modifier. 
Basically it tries to simplify a mesh, without loosing too much detail. There are also multiple
 modes, for finer control, but the default one should do for most cases.

What you need to do is, with your object selected, to go to the modifier tab of the 
Properties window and add a Decimate modifier. I encourage you to play around with the multiple 
settings and modes to see which best suits your needs.


https://www.youtube.com/watch?v=0pSqa5Y94jg
Downsizing a mesh will mean having to redo the textures and texture mapping

Decimate :
https://docs.blender.org/manual/en/latest/modeling/modifiers/generate/decimate.html


Shiny Metallic Texture/material:
https://www.youtube.com/watch?v=uJ-1OhTmpT4




MOVING PIECES:
Copy and Past Z value 
-53.9838cm

STAY IN SAME WORLD VIEW: 
2.93501cm

MAKE CHANGES:  

past z value back:
2.93501cm

write down the object name:
Cylinder.000
_________________________________
repeat ? DO I EVEN NEED TO MOVE IT ? 

no need to move: 
either 
1) reduce the number of subdivisions that were originally made.
or
2) add a modifier:  Decimate > Un-Subdivide > iterations of 1 
3
aa
---------------
boot.01173
-78.2002cm

31.7504cm

-5.44462cm
*/

/**
 * 6-11-2019: 
 * Purpose: To be able to apply texture to the entire side of a vehicle. 
 * In terms of the porsch, getting the three parts, frontend, door,and backend, merged into a single object and/or 
 * merging their UV maps.
 * 
 * 
*/
/*
 join two UV maps pieces into one
 https://blender.stackexchange.com/questions/49812/how-to-join-two-uv-maps-pieces-into-one

Point 1, You can join seams.
Simply select the two vertices you would like to combine.
Then press W, then "Weld". This will "join" those two vertices.

Point 2, You NEED seams!

Unwrapping requires cutting the model up into pieces (for it to work properly). Imagine it like you have a 
paper (3D) figure and you have to let it lay out flat. You must cut it enough times to do this. If you mark a seam, 
that will be a split. If you have marked all the seams you want and press U, then "unwrap", it should unwrap with only 
your given seams, but after you mark a new seam, you must re-unwrap for it to take effect.

Point 3 ( SmartUV is problematic.)

Point 4, You can do this for a whole seam.
Simply align the seams as best you can, then select them. (Tip, use proportional editing on "connected mode" to drag 
an edge closer to another while smoothly transforming the geometry in between.)
Then press W, then "Align Auto" to line up the two seams.
Now press W again (with both seams still selected) and click "Remove Double UVs". This will remove the UVs 
that are next to each other. If you succeeded, this should merge your seams.
Note: If the vertices were too far apart after aligning, this will not work. 
You can do any necessary clean up using weld.

notes: 
boot.008 has left frontend and left door
boot.002 has under door and top of backend.
boot.001 has the lower backend

boot.005 is top part of left frontend.

boot.011 appears to be the composition of texturable surfaces of the car.


I created an object out of boot.011 




ALT + R-Click in edge edit mode for Select Boundary Loop 
Select inner region gets me the sections I want .

LEFT OFF HERE : 
6-11-2019 
Need to watch tutorial on creating seams for UV mapping 
left off working on origin.0.4.0.OPTIMIZE_E-2.blend 



Modeling a Vehicle:
https://www.youtube.com/watch?v=H8Fo0mfyab0

Cycles Rendering: 
https://www.youtube.com/watch?v=p-MOxcAM0ok

Cut out the seam with vertex on circle select. He applied logo to a sphere

WELDING DIFFERENT OBJECTS: 
https://www.youtube.com/watch?v=taltUktxgPU
 
JIMP: for masking idea:
https://github.com/oliver-moran/jimp/blob/master/packages/plugin-mask/src/index.js

Blender: Multiple Ojects on Single UV MAP
https://www.youtube.com/watch?v=Cuj0Oypj_ic


1. either ctrl+J then U 
or 
2. object mode 
    >space bar 
        > Smart UV Project Lightmap pack 
        * only see active object in UV Map editor.

MIRROR:
https://www.youtube.com/watch?v=3LwQO_tWTAQ

APPLY: hitting apply lets you edit mirrored images separately.


Emit Light with Material:
https://www.youtube.com/watch?v=0y9pQKKNYnU


Assign Different Materials to SAME object/mesh:
https://blender.stackexchange.com/questions/516/add-different-materials-to-different-parts-of-a-mesh
add material with -diffuse color and -emit value 
go to Global Icon 
    -  check indirect light source > Ambient and Bounce  = 2 

Shadows: 
turn light source to sun 


Reflection: 
https://www.youtube.com/watch?v=uJ-1OhTmpT4
-hardness up 
-check mirror and set reflectivity.

6-18-19:
current issues: 
    1- the main mesh is clear until the first image is applied to a mesh.
    2- the color change GUI only affects the rear end piece. (boot.001)
     also the hood (OLDDoorLeftFront.011) has it's black material/texture...
   3 - the frontend and front fender UV maps are off just a bit. 
solutions:
   #1: 
    boolean for whether image has been set yet or not. 
    if not apply paint, otherwise, apply image.
    worked.! 
    ALSO: I had applied a slight scale change to the overall mesh. boot.011 I think.
    IT wthis mesh blocks the others, is there a way to ignore it in babylon pick.
    yes. set mesh.isPickable = false to certain meshes .
     once ignored, needs to be set back to invisible.? or ? 

     General:
     Is there a way to preview expected results in Blender that 
     is reliably similar to how it will render in babylon?


BLENDER: live view texture 
https://blender.stackexchange.com/questions/5283/how-to-show-textures-in-the-3d-view-editor


*/
/*

BABYLON FUNCTIONALITY: 
Shadows:
https://playground.babylonjs.com/#B48X7G#2
https://doc.babylonjs.com/examples/




BLENDER PYTHON SCRIPTING: 
https://medium.com/@colesayershapiro/python-scripting-in-blender-5c56aa2a9bb1

https://en.wikibooks.org/wiki/Blender_3D:_Blending_Into_Python/2.5_quickstart

LOOP 
models = bpy.data.objects
#assigns a variable models to your list of blender objects
for model in models:
    print(model)
#returns all elements of your models list
<bpy_struct, Object("Camera")>
<bpy_struct, Object("Cube")>
<bpy_struct, Object("Cube.001")>
<bpy_struct, Object("Lamp")>

*/