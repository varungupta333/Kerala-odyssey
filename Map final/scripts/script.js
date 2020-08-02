const Scene=require('Scene');
const Diagnostics = require('Diagnostics');
const Materials = require('Materials');
const TouchGestures = require('TouchGestures');
const FaceGestures=require('FaceGestures');
const FaceTracking=require('FaceTracking');
const Animation=require('Animation');
const Time=require('Time');
const Audio=require('Audio');

const sceneRoot=Scene.root;
const face=FaceTracking.face(0);
const headLeft=FaceGestures.isTurnedLeft(face);
const headRight=FaceGestures.isTurnedRight(face);

const ques=[{
                city:"Vagamon",
                qs:
                    {
                        1:{q:"Vagamon is famous for which adventure activity?",c:"Paragliding",w:"Scuba Diving"},
                        2:{q:"Which famous dam is built around Vagamon?",c:"Idukki",w:"Tehri"},
                        3:{q:"Vagamon attracts huge tourists for which of these?",c:"Waterfall",w:"Caves"}
                    }
            },
            {
                city:"Varkala",
                qs:
                    {
                        1:{q:"Which water activity is quite famous in Varkala?",c:"Surfing",w:"Rafting"},
                        2:{q:"The famous Varkala beach is a?",c:"Cliff Beach",w:"Pebble Beach"},
                        3:{q:"Famous food found in the region of Varkala?",c:"Seafood",w:"Chinese food"}
                    }
            },
            {
                city:"Wayanad",
                qs:
                    {
                        1:{q:"Wayanad is famous for which peak?",c:"Chembra Peak",w:"Mana Peak"},
                        2:{q:"Which historical caves are Wayanad famous for?",c:"Edakkal",w:"Kandhagiri"},
                        3:{q:"Wayanad is famous for which cultivation practice?",c:"Tea",w:"Coffee"}
                    }
            },
            {
                city:"Kochi",
                qs:
                    {
                        1:{q:"Which dance style is Kochi famous for?",c:"Kathakali",w:"Bharatanatyam"},
                        2:{q:"Kochi is largely famous because of?",c:"Natural Harbours",w:"Wildlife"},
                        3:{q:"Which is the capital of Kerala?",c:"Trivandrum",w:"Kochi"}
                    }
            },
            {
                city:"Alleppey",
                qs:
                    {
                        1:{q:"The most beautiful stay in Alleppey?",c:"Houseboats",w:"Camps"},
                        2:{q:"Alleppey is close to which of these exotic hill stations?",c:"Munnar",w:"Ooty"},
                        3:{q:"Which is the famous boating activity in Alleppey?",c:"Snakeboat Race",w:"Rafting"}
                    }
            }
];

var currentIndex = ques.length, temporaryValue, randomIndex;

// While there remain elements to shuffle...
while (0 !== currentIndex) {
    // Pick a remaining element...
  randomIndex = Math.floor(Math.random() * currentIndex);
  currentIndex -= 1;

  // And swap it with the current element.
  temporaryValue = ques[currentIndex];
  ques[currentIndex] = ques[randomIndex];
  ques[randomIndex] = temporaryValue;
}

var i=0;
var answered=true;
var corans=-1;
var score=0;
var started=false;
var qstart=false;
var rd,qobj;
var scalesize=[0.025,0.03,0.035,0.04,0.045,0.05];
var delayInMilliseconds = 1000; //1 second

Promise.all([
    sceneRoot.findFirst('quizStart'),
    sceneRoot.findFirst('mapObj'),
    sceneRoot.findFirst('QnA'),
    sceneRoot.findFirst('quesRect'),
    sceneRoot.findFirst('optARect'),
    sceneRoot.findFirst('optBRect'),
    sceneRoot.findFirst('quesT'),
    sceneRoot.findFirst('AT'),
    sceneRoot.findFirst('BT'),
    sceneRoot.findFirst('faceTracker0'),
    sceneRoot.findFirst('s1'),
    sceneRoot.findFirst('s2'),
    sceneRoot.findFirst('s3'),
    sceneRoot.findFirst('s4'),
    sceneRoot.findFirst('s5'),
    sceneRoot.findFirst('scrBrd'),
    sceneRoot.findFirst('Zobu'),
    sceneRoot.findFirst('InstructionsKerMap')
])
.then(function(objects) {
    const startbt = objects[0];
    const mapPart = objects[1];
    const qnaPart = objects[2];
    const qu=objects[3];
    const oa=objects[4];
    const ob=objects[5];
    const qut=objects[6];
    const oat=objects[7];
    const obt=objects[8];
    const qnaPart2 = objects[9];
    const sca=[];
    sca[0]=objects[10];
    sca[1]=objects[11];
    sca[2]=objects[12];
    sca[3]=objects[13];
    sca[4]=objects[14];
    const scrBrd=objects[15];
    const zobu=objects[16];
    const mscinst=objects[17];

    const wrgMat=Materials.get('wrnOptMat');
    const corMat=Materials.get('corOptMat');
    const optMat=Materials.get('optMat');

    const corrAnsAud=Audio.getPlaybackController('corrAnsAud');
    const wrngAnsAud=Audio.getPlaybackController('wrngAnsAud');

    Time.setTimeout(function(){
        mscinst.text="In city filters, move your head up/down and left/right to control.";
        //mscinst.hidden=true;
    },4000);

    Time.setTimeout(function(){
        mscinst.hidden=true;
    },8000);

    const zobuDriverParameters = {
        durationMilliseconds: 600,
        loopCount: 1,
        mirror: false
    };

    const zobuDriver = Animation.timeDriver(zobuDriverParameters);
    zobuDriver.start();
    const zobuTransform = zobu.transform;

    var bwCity = 
    {
        'Wayanad':Materials.get('scrWayanadB'),
        'Alleppey':Materials.get('scrAlleppeyB'),
        'Vagamon':Materials.get('scrVagamonB'),
        'Kochi':Materials.get('scrKochiB'),
        'Varkala':Materials.get('scrVarkalaB')
    }

    var colCity = 
    {
        'Wayanad':Materials.get('scrWayanadC'),
        'Alleppey':Materials.get('scrAlleppeyC'),
        'Vagamon':Materials.get('scrVagamonC'),
        'Kochi':Materials.get('scrKochiC'),
        'Varkala':Materials.get('scrVarkalaC')
    }

    TouchGestures.onTap(startbt).subscribe(function (gesture) {
        mapPart.hidden=true;
        scrBrd.hidden=false;
        Diagnostics.log('Quiz Starts');
        Diagnostics.watch("left:",headLeft);
        Diagnostics.watch("right:",headRight);
        qstart=true;
        qnaPart.hidden=false;
        qnaPart2.hidden=false;

        for(var k=0;k<5;k++)
            sca[k].material=bwCity[ques[k].city];
    });

    FaceGestures.onNod(face).subscribe(function(){
        if((started==false)&&(qstart))
        {
            started=true;
            if(i<ques.length&&answered)
            {
                answered=false;
                ob.material=optMat;
                oa.material=optMat;
                rd=Math.ceil(Math.random()*3);
                qobj=ques[i].qs[rd];
                Diagnostics.log(qobj.q);
                qut.text=qobj.q;
                var opt = Math.floor(Math.random() * 2);
                if(opt==0)
                {
                    oat.text=qobj.c;
                    corans=1;
                    obt.text=qobj.w;
                }
                else
                {
                    oat.text=qobj.w;
                    obt.text=qobj.c;
                    corans=2;
                }
            }
            i++;
        }
    });


    headLeft.monitor().subscribe(function(){
        if(started)
        {
            if(!answered)
            {
                Diagnostics.log('o1 Clicked');
                answered=true;
                if(corans==1)
                {
                    corrAnsAud.setPlaying(true);
                    Time.setTimeout(function() {
                        corrAnsAud.setPlaying(false);
                        corrAnsAud.reset();
                    }, delayInMilliseconds*1.1);
                    score++;
                    const zobuSampler = Animation.samplers.easeInQuint(scalesize[score-1],scalesize[score]);
                    const zobuAnimation = Animation.animate(zobuDriver,zobuSampler);
                    zobuTransform.scaleX = zobuAnimation;
                    zobuTransform.scaleY = zobuAnimation;
                    zobuTransform.scaleZ = zobuAnimation;
                    sca[i-1].material=colCity[ques[i-1].city];
                    oa.material=corMat;
                }
                if(corans==2)
                {
                    wrngAnsAud.setPlaying(true);
                    Time.setTimeout(function() {
                        wrngAnsAud.setPlaying(false);
                        wrngAnsAud.reset();
                    }, delayInMilliseconds*1.3);
                    oa.material=wrgMat;
                    ob.material=corMat;
                }
            }
            Time.setTimeout(function() {
                if(answered)
                {
                    if(i<ques.length&&answered)
                    {
                        answered=false;
                        ob.material=optMat;
                        oa.material=optMat;
                        rd=Math.ceil(Math.random()*3);
                        qobj=ques[i].qs[rd];
                        Diagnostics.log(qobj.q);
                        qut.text=qobj.q;
                        var opt = Math.floor(Math.random() * 2);
                        if(opt==0)
                        {
                            oat.text=qobj.c;
                            corans=1;
                            obt.text=qobj.w;
                        }
                        else
                        {
                            oat.text=qobj.w;
                            obt.text=qobj.c;
                            corans=2;
                        }
                    }
                    else
                    {
                        qnaPart.hidden=true;
                        qut.text="Score: "+score;
                    }
                    i++;
                }
            }, delayInMilliseconds);
        }
    });
    
    headRight.monitor().subscribe(function(){
        if(started)
        {
            if(!answered)
            {
                Diagnostics.log('o2 Clicked');
                answered=true;
                if(corans==2)
                {
                    corrAnsAud.setPlaying(true);
                    Time.setTimeout(function() {
                        corrAnsAud.setPlaying(false);
                        corrAnsAud.reset();
                    }, delayInMilliseconds*1.1);
                    score++;
                    const zobuSampler = Animation.samplers.easeInQuint(scalesize[score-1],scalesize[score]);
                    const zobuAnimation = Animation.animate(zobuDriver,zobuSampler);
                    zobuTransform.scaleX = zobuAnimation;
                    zobuTransform.scaleY = zobuAnimation;
                    zobuTransform.scaleZ = zobuAnimation;
                    //scorebd.text="Score: "+score;
                    sca[i-1].material=colCity[ques[i-1].city];
                    ob.material=corMat;
                }
                if(corans==1)
                {
                    wrngAnsAud.setPlaying(true);
                    Time.setTimeout(function() {
                        wrngAnsAud.setPlaying(false);
                        wrngAnsAud.reset();
                    }, delayInMilliseconds*1.3);
                    ob.material=wrgMat;
                    oa.material=corMat;
                }
            }
            Time.setTimeout(function() {
                if(answered)
                {
                    if(i<ques.length&&answered)
                    {
                        answered=false;
                        ob.material=optMat;
                        oa.material=optMat;
                        rd=Math.ceil(Math.random()*3);
                        qobj=ques[i].qs[rd];
                        Diagnostics.log(qobj.q);
                        qut.text=qobj.q;
                        var opt = Math.floor(Math.random() * 2);
                        if(opt==0)
                        {
                            oat.text=qobj.c;
                            corans=1;
                            obt.text=qobj.w;
                        }
                        else
                        {
                            oat.text=qobj.w;
                            obt.text=qobj.c;
                            corans=2;
                        }
                    }
                    else
                    {
                        qnaPart.hidden=true;
                        qut.text="Score: "+score;
                    }
                    i++;
                }
            }, delayInMilliseconds);
        }
    });

});