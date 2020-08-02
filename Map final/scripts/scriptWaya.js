const Scene = require('Scene');
const sceneRoot = Scene.root;
const Diagnostics=require('Diagnostics');
const Animation = require('Animation');
const TouchGestures = require('TouchGestures');
const FaceTracking = require('FaceTracking');
const Reactive = require('Reactive');
const Audio = require('Audio');

Promise.all([
    sceneRoot.findFirst('trekker'),
    sceneRoot.findFirst('bckRectWaya'),
    sceneRoot.findFirst('logoWayanad'),
    sceneRoot.findFirst('mapObj'),
    sceneRoot.findFirst('WayanadFilter')
])
.then(function(objects) {
    const trekker=objects[0];
    const background = objects[1];
    const startbt=objects[2];
    const mapPart=objects[3];
    const scrBrd=objects[4];

    const WayaAud=Audio.getPlaybackController('WayaAud');

    const face = FaceTracking.face(0);
    const faceTransform = face.cameraTransform;
    const turn=Reactive.abs(faceTransform.rotationY).gt(0.2);

    TouchGestures.onTap(startbt).subscribe(function (gesture) {
        mapPart.hidden=true;
        scrBrd.hidden=false;
        Diagnostics.log('WayanadFilter Starts');
        const baseTransform1 = trekker.transform;
        
        Diagnostics.watch("face rotY",faceTransform.rotationY);
        Diagnostics.watch("null rotZ",baseTransform1.y);
        
        // Bind the rotation of the face to the rotation of the plane
        background.transform.x = faceTransform.rotationY.mul(-280).add(-140);
        baseTransform1.y=faceTransform.rotationY.mul(0.07);
    });

    turn.monitor().subscribe(function(){
        if(turn.lastValue)
        {
            WayaAud.setPlaying(true);
        }
        else
        {
            WayaAud.reset();
            WayaAud.setPlaying(false);
        }
    });

});