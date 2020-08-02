const Scene = require('Scene');
const sceneRoot = Scene.root;
const Diagnostics=require('Diagnostics');
const Animation = require('Animation');
const TouchGestures = require('TouchGestures');
const FaceTracking = require('FaceTracking');
const Reactive = require('Reactive');
const Audio=require('Audio');

Promise.all([
    sceneRoot.findFirst('gliPer'),
    sceneRoot.findFirst('bckRectVaga'),
    sceneRoot.findFirst('logoVagamon'),
    sceneRoot.findFirst('mapObj'),
    sceneRoot.findFirst('VagamonFilter'),

])
.then(function(objects) {
    const glidPers=objects[0];
    const background = objects[1];
    const startbt=objects[2];
    const mapPart=objects[3];
    const scrBrd=objects[4];

    const VagaAud=Audio.getPlaybackController('VagaAud');

    const face = FaceTracking.face(0);
    const faceTransform = face.cameraTransform;
    const turn=Reactive.abs(faceTransform.rotationY).gt(0.2);
    Diagnostics.watch("turn",turn);

    TouchGestures.onTap(startbt).subscribe(function (gesture) {
        mapPart.hidden=true;
        scrBrd.hidden=false;
        Diagnostics.log('VagamonFilter Starts');
        const baseTransform1 = glidPers.transform;
        
        Diagnostics.watch("face rotY",faceTransform.rotationY);
        Diagnostics.watch("null rotZ",baseTransform1.rotationZ);
        
        // Bind the rotation of the face to the rotation of the plane
        baseTransform1.rotationZ = faceTransform.rotationY.mul(-1);
        baseTransform1.y=faceTransform.rotationX.mul(-0.2);
        background.transform.x = faceTransform.rotationY.mul(-300);
        
    });

    turn.monitor().subscribe(function(){
        if(turn.lastValue)
        {
            VagaAud.setPlaying(true);
        }
        else
        {
            VagaAud.reset();
            VagaAud.setPlaying(false);
        }
    });

});