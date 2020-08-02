const Scene = require('Scene');
const sceneRoot = Scene.root;
const Diagnostics=require('Diagnostics');
const Animation = require('Animation');
const TouchGestures = require('TouchGestures');
const FaceTracking = require('FaceTracking');
const Reactive = require('Reactive');

Promise.all([
    sceneRoot.findFirst('diver'),
    sceneRoot.findFirst('bckRectKoch'),
    sceneRoot.findFirst('logoKochi'),
    sceneRoot.findFirst('mapObj'),
    sceneRoot.findFirst('KochiFilter')
])
.then(function(objects) {
    const diver=objects[0];
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
        Diagnostics.log('KochiFilter Starts');
        const face = FaceTracking.face(0);
        const faceTransform = face.cameraTransform;
        const baseTransform1 = diver.transform;
        
        Diagnostics.watch("face rotY",faceTransform.rotationY);
        Diagnostics.watch("null rotZ",baseTransform1.rotationZ);
        
        // Bind the rotation of the face to the rotation of the plane
        baseTransform1.x = faceTransform.rotationY.mul(-0.04);
        baseTransform1.y=faceTransform.rotationX.mul(-0.2);
        background.transform.x = faceTransform.rotationY.mul(-160);
    });

});