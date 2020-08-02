const Scene = require('Scene');
const sceneRoot = Scene.root;
const Diagnostics=require('Diagnostics');
const Animation = require('Animation');
const TouchGestures = require('TouchGestures');
const FaceTracking = require('FaceTracking');
const Reactive = require('Reactive');

Promise.all([
    sceneRoot.findFirst('surferVark'),
    sceneRoot.findFirst('bckRectVark'),
    sceneRoot.findFirst('logoVarkala'),
    sceneRoot.findFirst('mapObj'),
    sceneRoot.findFirst('VarkalaFilter')
])
.then(function(objects) {
    const surfer=objects[0];
    const background = objects[1];
    const startbt=objects[2];
    const mapPart=objects[3];
    const scrBrd=objects[4];

    /*const baseDriverParameters = {
        durationMilliseconds: 2000,
        loopCount: 1,
        mirror: false
    };*/

    TouchGestures.onTap(startbt).subscribe(function (gesture) {
        mapPart.hidden=true;
        scrBrd.hidden=false;
        Diagnostics.log('VarkalaFilter Starts');
        const face = FaceTracking.face(0);
        const faceTransform = face.cameraTransform;
        const baseTransform1 = surfer.transform;
        
        Diagnostics.watch("face rotY",faceTransform.rotationY);
        Diagnostics.watch("face rotX",faceTransform.rotationX);
        
        // Bind the rotation of the face to the rotation of the plane
        baseTransform1.rotationZ = faceTransform.rotationY.mul(1);
        baseTransform1.scaleX = Reactive.abs(faceTransform.rotationX).mul(-0.0003).add(0.00062);
        baseTransform1.scaleY = Reactive.abs(faceTransform.rotationX).mul(-0.0003).add(0.00062);

        Diagnostics.watch("surf rotZ",baseTransform1.rotationZ);
        Diagnostics.watch("surf scale",baseTransform1.scaleX);

        //background.transform.x = faceTransform.rotationY.mul(-160);
    });

});