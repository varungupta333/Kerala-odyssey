const Scene = require('Scene');
const sceneRoot = Scene.root;
const Diagnostics=require('Diagnostics');
const Animation = require('Animation');
const TouchGestures = require('TouchGestures');
const FaceTracking = require('FaceTracking');
const Reactive = require('Reactive');
const Audio = require('Audio');

Promise.all([
    sceneRoot.findFirst('SnekBoat'),
    sceneRoot.findFirst('bckRectAlle'),
    sceneRoot.findFirst('logoAlleppey'),
    sceneRoot.findFirst('mapObj'),
    sceneRoot.findFirst('AlleppeyFilter')
])
.then(function(objects) {
    const boat=objects[0];
    const background = objects[1];
    const startbt=objects[2];
    const mapPart=objects[3];
    const scrBrd=objects[4];

    const AlleAud=Audio.getPlaybackController('AlleAud');

    const face = FaceTracking.face(0);
    const faceTransform = face.cameraTransform;
    const turn=Reactive.abs(faceTransform.rotationY).gt(0.2);

    TouchGestures.onTap(startbt).subscribe(function (gesture) {
        mapPart.hidden=true;
        scrBrd.hidden=false;
        Diagnostics.log('AlleppeyFilter Starts');
        const baseTransform1 = boat.transform;

        Diagnostics.watch("face rotY",faceTransform.rotationY);
        Diagnostics.watch("face rotX",faceTransform.rotationX);
        
        // Bind the rotation of the face to the rotation of the plane
        baseTransform1.rotationZ = Reactive.abs(faceTransform.rotationY).mul(0.3);
        baseTransform1.scaleX = Reactive.abs(faceTransform.rotationX).mul(-0.0003).add(0.00062);
        baseTransform1.scaleY = Reactive.abs(faceTransform.rotationX).mul(-0.0003).add(0.00062);

        Diagnostics.watch("boat rotZ",baseTransform1.rotationZ);
        Diagnostics.watch("boat scale",baseTransform1.scaleX);
        background.transform.x = faceTransform.rotationY.mul(-250);
        //background.transform.x = faceTransform.rotationY.mul(-160);
    });

    turn.monitor().subscribe(function(){
        if(turn.lastValue)
        {
            AlleAud.setPlaying(true);
        }
        else
        {
            AlleAud.reset();
            AlleAud.setPlaying(false);
        }
    });

});