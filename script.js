window.onerror=()=>{
    alert("fail to load")
    document.location.reload()
}
//--------------------------------------------------p5js---------------------------------------------------//
//universal variable
let setTimeoutHandler1,setTimeoutHandler2;
let delay=3000;
let t,t2;
let ballPos=p5.Vector(0,0,0);
let gAng=0;
let zSign=1;
let tscale=11
let ball,ball2;
let iStart, sFlag=1, hitFlag;
let tStart=0,ffFlag=1;
let hitDrawState;
let hitX=0,hitY=0;
let angY=0;
let angX=0;
let upperRPM=0;
let bottomRPM=0;
let resetFlag;
//var 3d ball
let gball;
function resetVar(){
    iStart=0, tStart=0;
    t=0,t2=0;
    sFlag=0, hitFlag=0, hitDrawState=0;
    hitX=0,hitY=0;
    ballPos=p5.Vector(0,0,0);
    gAng=0;
    zSign=1;
}
//ball3d------------------------------------------------//
class Ball3d{
    constructor(e,r){
      this.r=r;
      this.e=e;
      this.randAX=e.random(e.TAU);
      this.randAZ=e.random(e.TAU);
      this.g=e.createGraphics(100,100,e.WEBGL)
      this.g.setAttributes("alpha",true)
      
      this.texture=e.createGraphics(400,200);
      this.texture.clear()
      this.texture.push()
      this.texture.background(255)
      this.texture.noFill()
      this.texture.stroke(0)
      this.texture.strokeWeight(10)
      this.texture.arc(100,100,100,100,60/180*e.PI,-60/180*e.PI)
      this.texture.arc(200,-73,300,300,60/180*e.PI,120/180*e.PI)
      this.texture.arc(200,273,300,300,-120/180*e.PI,-60/180*e.PI)
      this.texture.arc(300,100,100,100,-120/180*e.PI,120/180*e.PI)
      this.texture.pop()
    }
    show(ang){
      this.g.clear()
      this.g.push()
      this.g.rotateY(ang)
      this.g.rotateX(this.randAX)
      this.g.rotateZ(this.randAZ)
      this.g.noStroke()
      this.g.texture(this.texture)
      this.g.sphere(this.r)
      this.g.pop()
      this.e.image(this.g,-50,-50)
    }
}
//object
class Ball{
    constructor(e,x,y,r,m){
        this.e=e;
        this.pos=e.createVector(x,y,15/2*tscale);
        this.startPos=e.createVector(x,y,15/2*tscale);
        this.vel=e.createVector(0,0);
        this.velProj=e.createVector(0,0,0);
        this.acc=e.createVector(0,0);
        this.accProj=e.createVector(0,0,0);
        this.r=r
        this.mass=m
        this.ang=0;
        this.angStart=0;
        this.dirA=0;
        this.aVel=0;
        this.aAcc=0;
        this.inert=2/5*m*e.pow(r,2);
        this.i=1;
        //liftForce!!!!!!!!!!!!!!!!!!!!!!!!!
        this.lF=e.createVector(0,0);
        //this.liftC=1.2*PI*pow(this.r,3);!
        this.liftC=0.5*1.2*e.PI*e.pow(this.r,2);
        //dragForce!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        this.dF=e.createVector(0,0);
        this.dragC=-0.5*0.5*1.2*e.PI*e.pow(this.r,2);
        //rolling resistace!!
        this.rRF=0.1*m*9.8;
        //last var!!!!!!!!!!!
        this.lastBounceVel=0;
        //ball3d
        this.ball3d=new Ball3d(e,r*10*tscale);
    }
    applyForce(force){
        let acc=p5.Vector.div(force,this.mass);
        this.acc.add(acc)
    }
    update(){
        //calculate angular velocity!!!!!!!!!!!!!!!!!!!!!!
        this.aVel+=this.aAcc/tscale;
        this.ang+=this.aVel/60;
        //----------------------------------------------//
        // //calculate magnus effect(bernoullie principle)
        // this.applyForce(p5.Vector.mult(this.lF,-1))
        // this.lF=p5.Vector.mult(this.vel,this.liftC*this.aVel)
        //   .rotate(radians(90));
        // this.applyForce(this.lF)
        //----------------------------------------------//
        // calculate magnus effect!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        if(this.aVel!=0){
        this.applyForce(p5.Vector.mult(this.lF,-1))
        let lCof=1/(2+this.e.abs(this.vel.mag()/(this.aVel*this.r)))
        lCof *=this.aVel/this.e.abs(this.aVel);
        this.lF=p5.Vector.mult(this.vel,this.liftC*lCof)
        this.lF=p5.Vector.mult(this.lF,this.vel.mag())
        this.lF.rotate(this.e.radians(90))
        this.applyForce(this.lF)
        }
        //---------------------------------------//
        //calculate drag force!!!!!!!!!!!!!!!!!!!!!
        this.applyForce(p5.Vector.mult(this.dF,-1))
        this.dF=p5.Vector.mult(this.vel,this.dragC)
        .mult(this.vel.mag())
        this.applyForce(this.dF)
        //-------------------//
        //preProcc xz from dirA(projection3d)
        this.velProj.x=this.vel.x*this.e.cos(this.dirA);
        this.velProj.y=this.vel.y;
        this.velProj.z=this.vel.x*this.e.sin(this.dirA)*zSign;
        this.accProj.x=this.acc.x*this.e.cos(this.dirA);
        this.accProj.y=this.acc.y;
        this.accProj.z=this.acc.z*this.e.cos(this.dirA)*zSign;
        //calculate position!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        this.pos.add(p5.Vector.mult(this.velProj,1/60*tscale))      .add(p5.Vector.mult(this.acc,this.e.pow(1/60,2)*0.5*tscale))
        this.vel.add(p5.Vector.mult(this.acc,1/60))
        //export value to global
        ballPos=this.pos;
        gAng=this.ang;
        //---------------------------------------------//
        //when hit ground!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        this.i++;
        if(this.pos.y>this.e.height-5-this.r*10*tscale&&sFlag==2&&this.vel.y>0){
            //bounce effect!!!!!!!!!!!!!!!!!!
            this.vel.y=this.e.abs(this.vel.y)*-0.80;
            //----------------------------------------------------------------//
            if(this.e.abs(this.vel.y)<1)this.pos.y=this.e.height-5-this.r*10*tscale;
            //add friction force!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            let bounceAVel=(this.inert*this.aVel+this.mass*this.r*this.vel.x)/(this.inert+this.mass*this.e.pow(this.r,2));
            this.aVel=bounceAVel;
            this.vel.x=this.aVel*this.r;
            this.lastBounceVel=this.aVel*this.r;
            //---------------------------------------------------------//
            //add rolling resistance force!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            let rRVel=this.rRF*p5.Vector.normalize(this.vel).x/this.mass;
            this.vel.x-=rRVel;
            //debug//
            if(t!=2){
                console.log("flyDist:"+(this.pos.x-this.startPos.x)/tscale+"m");
                t=1;
                console.log((this.i-iStart)/60+"s");
                console.log(iStart)
                console.log(this.i)
            }
        }
        if(this.vel.y>0.1&&t2==1&&t2!=2){
        t2=2;
        console.log("highDist:"+(this.e.height-5-this.pos.y)/tscale+"m")
        }
        //when touch net effect//
        if(this.pos.x>this.e.width/2-2-this.r*10*tscale&&this.pos.x<this.e.width/2+2-this.r*10*tscale&&this.pos.y>(this.e.height-5)-1.07*tscale-this.r*10*tscale){
        this.vel.x*=-1;
        zSign*=-1;
        }
    }
    show(){
        this.e.push();
        //reposition/////////////////////
        this.e.translate(this.pos.x,this.pos.y);
        //rotate//////////////////
        this.e.rotate(this.e.degrees(this.ang));
        //draw circle/////////////////
        // this.e.noStroke();
        // this.e.circle(0,0,this.r*2*10*tscale);
        this.ball3d.show(this.ang)
        //draw line
        this.e.pop();
        //draw Arrow dir
        this.e.push();
        this.e.fill(255)
        this.e.noStroke()
        this.e.translate(0,this.e.height-5)
        this.e.text(-this.angStart+"\u00B0",0,-tscale*2)
        this.e.rotate(this.angStart)
        this.e.rect(0,-1*tscale/8,tscale,2*tscale/8)
        this.e.noFill()
        this.e.stroke(255)
        this.e.arc(0,0,tscale*3,tscale*3,0,-this.angStart,this.e.PIE)
        this.e.translate(tscale,0)
        this.e.fill(0)
        this.e.triangle(0,-3*tscale/8,tscale/3,0,0,3*tscale/8)
        this.e.pop();
    }
}
class ballZ{
  constructor(e,x,y,r){
    this.e=e;
    this.pos=e.createVector(x,y,0);
    this.posStart=e.createVector(x,y);
    this.vel=e.createVector(0,0,0);
    this.acc=e.createVector(0,0,0);
    this.r=r
    this.ang=0;
    this.dirA=0;
    this.dirAStart=0;
    //ball3d
    this.ball3d=new Ball3d(e,r*13*tscale);
  }
  update(){
    this.pos.add(p5.Vector.mult(this.vel,1/60*tscale));
  }
  show(){
    this.e.push()
    this.e.translate(this.pos.x,this.pos.y)
    this.e.rotate(this.e.radians(this.dirA))
    this.e.noStroke()
    this.ball3d.show(this.ang)
    if(this.pos.z>0){
      this.ball3d.r=this.r*13*tscale*(1+(10*tscale-5-0.32*tscale-this.pos.z)/(3*tscale))
    }
    this.e.fill(0);
    this.e.pop();
    
    //draw Arrow dir
    this.e.push();
    this.e.fill(255)
    this.e.noStroke()
    this.e.translate(this.posStart.x,this.e.height/2)
    this.e.rotate(this.dirAStart)
    this.e.noFill()
    this.e.stroke(255)
    this.e.translate(-tscale*2,0)
    this.e.fill(255)
    this.e.rect(0,-1/8*tscale,tscale,2/8*tscale)
    this.e.translate(tscale,0)
    this.e.fill(0)
    this.e.push()
    this.e.translate(-12/8*tscale,3/8*tscale)
    this.e.arc(0,-3,tscale*4,tscale*4,(-this.e.abs(this.dirAStart)-this.dirAStart)/2,(this.e.abs(this.dirAStart)-this.dirAStart)/2,this.e.PIE)
    this.e.pop()
    this.e.triangle(0,-tscale/3,tscale/3,0,0,tscale/3)
    this.e.rotate(-this.dirAStart)
    this.e.fill(255)
    this.e.noStroke()
    this.e.text(this.dirAStart+"\u00B0",-tscale,-tscale)
    this.e.pop();
  }
}
//sketch--------------------------------------------------//

let sketch1=function(e){
  e.setup=function(){
    e.angleMode(e.DEGREES);
    let canvas=e.createCanvas(30*tscale, 15*tscale);
    canvas.parent("#simulation1");
    ball=new ballZ(e,((30-23.77)/2-1)*tscale,15/2*tscale,0.032);        

    e.background(0);
  }
  e.draw=function(){
    e.background(0);
    //onclick--------------------------
    if(sFlag==1){
      
    }
    //---------------------------------
    //setDirection---------------------
    if(zSign==-1){
      ball.dirA=-angX;
    }
    else{    
      ball.dirA=angX;
      ball.dirAStart=angX;
    }
    //read global value (get position and ball ang)
    ball.ang=gAng;
    if(ballPos){
      ball.pos.x=ballPos.x;
      ball.pos.y=ballPos.z;
      ball.pos.z=ballPos.y;
    }
    if(hitX!=0&&hitFlag!=1){
      hitFlag=1;
      let front=hitX>=e.width/2&&hitX<=e.width/2+6.4*tscale;
      let back=hitX>=e.width/2+6.4*tscale&&hitX<=e.width-(30-23.77)*tscale/2;
      let left=hitY>=e.height/2-8.23*tscale/2&&hitY<=e.height/2;
      console.log(hitY)
      let right=hitY>=e.height/2&&hitY<=e.height/2+8.32*tscale/2;
      let leftDouble=hitY>=e.height/2-10.97*tscale/2&&hitY<=e.height/2-8.23*tscale/2
      let rightDouble=hitY>=e.height/2+8.23*tscale/2&&hitY<=e.height/2+10.97*tscale/2
      if(front&&left){
        hitDrawState=1
      }
      else if(front&&right){
        hitDrawState=2
      }
      else if(back&&(right||left)){
        hitDrawState=3
      }
      else if(leftDouble&&(front||back)){
        hitDrawState=4
      }
      else if(rightDouble&&(front||back)){
        hitDrawState=5
      }
      else if(!((front||back)&&(left||right||leftDouble||rightDouble))){
        hitDrawState=6
      }
    }
    else if(hitDrawState&&ffFlag==1){
      e.push()
      e.fill('#645CBB')
      e.noStroke()
      if(hitDrawState==1){
        e.rect(e.width/2,e.height/2,6.4*tscale,-8.23*tscale/2)
      }
      else if(hitDrawState==2){
        e.rect(e.width/2,e.height/2,6.4*tscale,+8.23*tscale/2)
      }
      else if(hitDrawState==3){
        e.rect(e.width/2+6.4*tscale,e.height/2-8.23*tscale/2,(23.77/2-6.4)*tscale,8.23*tscale)
      }
      else if(hitDrawState==4){
        e.rect(e.width/2,e.height/2-10.97*tscale/2,23.77*tscale/2,1.37*tscale)
      }
      else if(hitDrawState==5){
        e.rect(e.width/2,e.height/2+10.97*tscale/2,23.77*tscale/2,-1.37*tscale)
      }
      else if(hitDrawState==6){
        e.rect(e.width/2,0,e.width/2,e.height)
        e.fill(0)
        e.rect(e.width/2,e.height/2-10.97*tscale/2,23.77*tscale/2,10.97*tscale)
      }
      e.pop()
    }
    if(e.millis()-tStart>500){
      tStart=e.millis();
      ffFlag^=1;
    }
    //firtsTouch
    if(t==1){
      t=2;
      hitX=ball.pos.x;
      hitY=ball.pos.y;
      resetFlag=1;
    }
    else if(t==2){
      e.push()
      e.noFill()
      e.stroke(255)
      e.translate(hitX,hitY)
      let r=ball.r*25*tscale
      e.circle(0,0,r)
      e.rotate(e.radians(45))
      e.line(0,-r/2,0,r/2)
      e.line(-r/2,0,r/2,0)
      e.pop()
    }
    //draw court
    e.push()
    e.translate((30-23.77)/2*tscale,(15-10.97)/2*tscale)
    e.noFill()
    e.stroke(255)
    e.strokeWeight(2)
    e.rect(0,0,23.77*tscale,10.97*tscale)
    e.rect(0,1.37*tscale,23.77*tscale,8.23*tscale)
    e.rect((23.77-12.8)/2*tscale,1.37*tscale,12.8*tscale,8.23*tscale)
    e.line(23.77/2*tscale,-1*tscale,23.77/2*tscale,11.97*tscale)
    e.line((23.77-12.8)/2*tscale,10.97*tscale/2,(23.77-(23.77-12.8)/2)*tscale,10.97*tscale/2);
    e.pop()
    
    e.push()
    e.stroke(255)
    e.strokeWeight(2)
    e.line(0,e.height,e.width,e.height)
    e.pop()
    
    ball.update();
    ball.show();

    if(resetFlag==2){
        resetFlag=0;
        setTimeoutHandler2=setTimeout(() => {
            resetVar()
            ball.pos.x=ball.posStart.x;
            ball.pos.y=ball.posStart.y;
            ball.pos.z=0;
            ball.vel.mult(0);
            ball.acc.mult(0);
            ball.ang=0;
            ball.dirA=0;
            ball.dirAStart=0;
            ball.ball3d.randAX=e.random(e.TAU);
            ball.ball3d.randAZ=e.random(e.TAU);
            sFlag=1;
            console.log("resetFlag2")
    }, delay);
    }
    else if(resetFlag==4){
        resetFlag=0;
        resetVar()
        ball.pos.x=ball.posStart.x;
        ball.pos.y=ball.posStart.y;
        ball.pos.z=0;
        ball.vel.mult(0);
        ball.acc.mult(0);
        ball.ang=0;
        ball.dirA=0;
        ball.dirAStart=0;
        ball.ball3d.randAX=e.random(e.TAU);
        ball.ball3d.randAZ=e.random(e.TAU);
        console.log("resetFlag4")
    }
  }
}

let myFirstSketch=new p5(sketch1)

let sketch2=function(e){
    e.setup=function(){
        e.angleMode(e.DEGREES);
        let canvas=e.createCanvas(30*tscale, 10*tscale);
        canvas.parent("#simulation2")
        //createObject//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        ball2=new Ball(e,((30-23.77)/2-1)*tscale,(e.height-5)-(0.32*tscale),0.032,58/1000)
        //gravity force!!!!!!!!!!
        let g=e.createVector(0,9.8)
        ballGF=p5.Vector.mult(g,ball2.mass)

        e.background(0);
    }
    e.draw=function(){
        e.background(0);
        e.push()
        e.noStroke()
        e.fill('#645CBB')
        e.rect(0,(e.height-5),e.width,e.height)
        e.fill(255)
        e.rect((30-23.77)/2*tscale,(e.height-5),23.77*tscale,e.height)
        e.rect(e.width/2-tscale/10,(e.height-5),tscale/10*2,-1.07*tscale)
        e.pop()
        //call object function
        ball2.update()
        ball2.show()
        
        //update INPUT----------//
        //set direction/////
        ball2.dirA=angX;
        ball2.angStart=-angY;
        //----------------------//
        //start move onClick
        if(sFlag==1){
        sFlag=2;
        iStart=ball2.i;
        //set angle!!!!!!!!!!
        ball2.ang=e.radians(-angY)
        //add spin//////////
        let upperSpeed=upperRPM/60*e.PI*80/1000;
        let bottomSpeed=bottomRPM/60*e.PI*80/1000;
        let ballRPS=(upperSpeed-bottomSpeed)/(ball2.r*e.TAU);
        ball2.aVel=ballRPS*e.TAU;
        //add vel//////////////////////////////
        ball2.vel=p5.Vector.fromAngle(ball2.ang);
        let v=(upperSpeed+bottomSpeed)/2;
        ball2.vel.mult(v);
        // add gravity//////////
        ball2.applyForce(ballGF);
        //debug/////////////////////////////////
        console.log("aVel:"+ball2.aVel)
        console.log("vel:"+ball2.vel.mag())
        console.log("heading"+e.degrees(ball2.vel.heading()))
        }
        //resetValue
        if(resetFlag==1){
            resetFlag=2;
            setTimeoutHandler1=setTimeout(() => {
                ball2.pos.x=ball2.startPos.x;
                ball2.pos.y=ball2.startPos.y;
                ball2.pos.z=ball2.startPos.z;
                ball2.vel.mult(0);
                ball2.velProj.mult(0)
                ball2.acc.mult(0);
                ball2.accProj.mult(0);
                ball2.lF.mult(0)
                ball2.dF.mult(0)
                ball2.ang=0;
                ball2.dirA=0;
                ball2.aVel=0;
                ball2.aAcc=0;
                ball2.lastBounceVel=0
                ball2.ball3d.randAX=e.random(e.TAU);
                ball2.ball3d.randAZ=e.random(e.TAU);
                console.log("resetFlag1")
        }, delay);
        }
        //hardReset
        else if(resetFlag==3){
            //clear timeout
                clearTimeout(setTimeoutHandler1)
                clearTimeout(setTimeoutHandler2)
            //-------------
            resetFlag=4;
            ball2.pos.x=ball2.startPos.x;
            ball2.pos.y=ball2.startPos.y;
            ball2.pos.z=ball2.startPos.z;
            ball2.vel.mult(0);
            ball2.velProj.mult(0)
            ball2.acc.mult(0);
            ball2.accProj.mult(0);
            ball2.lF.mult(0)
            ball2.dF.mult(0)
            ball2.ang=0;
            ball2.dirA=0;
            ball2.aVel=0;
            ball2.aAcc=0;
            ball2.lastBounceVel=0
            ball2.ball3d.randAX=e.random(e.TAU);
            ball2.ball3d.randAZ=e.random(e.TAU);
            console.log("resetFlag3")
        }
    }
    e.mouseClicked=function(){
        // sFlag=1
        t2=2;
    }
}
let mySecondSketch=new p5(sketch2)



//---------------------------------------------------------------------------------------------------------//
// connect to websocket
let ws;
let data={
    b1:0,
    b2:0,
    m1speed:0,
    m2speed:0,
    m1rpm:0,
    m2rpm:0,
    xAngle:0,
    yAngle:0,
    shootCount:0,
    status:"stopped"
}
function websocketInit(){
    ws=new WebSocket("ws://192.168.0.201/ws")
    ws.onopen=()=>{
        document.querySelector(".burger .line").classList.add("connected");
        console.log("connected")
        //show connected sign
        onConnect()
    }
    ws.onmessage=e=>{
        if(e.data[0]=="{"){
            console.log(e.data)
            let dataRecieve=JSON.parse(e.data)
            console.log(Object.keys(dataRecieve).length)
            if(Object.keys(data).length==Object.keys({...data,...dataRecieve}).length){
                Object.assign(data,dataRecieve)
                if(data.b1<1)data.b1=0
                if(data.b2<1)data.b2=0
            }
        }
        else{
            console.log(e.data)
            if(e.data=="pong"){
                clearTimeout(setTimeoutID)
            }
        }
    }
    ws.onclose=e=>{
        document.querySelector(".burger .line").classList.remove("connected");
        console.log("disconnected, try to reconnect")
        websocketInit()
        console.log(e)
        //show disconnect sign
        onDisconnect()
    }
}
//websocketInit()
//checking connection
let setTimeoutID;
setInterval(() => {
    if(ws.readyState==1){
        ws.send("ping");
        setTimeoutID=setTimeout(()=>{
            ws.close();
            console.log("clossing");
            onDisconnect();
        },2900)
    }
}, 3000);
let lastWsState=1;
//when disconnect
onDisconnect=()=>{
    //reconnect state
    setTimeout(() => {
        let target=document.querySelector(".connection").children
        document.querySelector(".connection").classList.remove("hidden")
        document.querySelector(".connection").classList.remove("transparent")
        if(lastWsState==1){
            //show disconnected
            target[1].innerHTML="Disconnected"
            //hide dot
            target[2].classList.add("hidden")
            //remove dot animation
            for(let i=1;i<target[2].children.length;i++){
                target[2].children[i].classList.remove("jump")
            }
        }
        //connecting or reconnect
        setTimeout(() => {
            if(ws.readyState==0){
                lastWsState=ws.readyState
                    onConnecting()
                }
            else{
                target[1].classList.add("transparent")
                setTimeout(() => {
                    target[0].classList.remove("hidden");
                    setTimeout(() => {
                        target[0].classList.remove("transparent");
                        target[1].innerHTML="Reconnect"
                        target[1].classList.remove("transparent")
                    }, 10);
                }, 250);
            }
        }, 500);
    }, 250);
    //when click reconnecting
    document.querySelector(".connection").addEventListener("click",e=>{
        if(document.querySelector(".connection").children[1].textContent=="Reconnect"){
            onConnecting()
        }
    })
}
//when connecting
onConnecting=()=>{
    let target=document.querySelector(".connection").children
            target[0].classList.add("transparent")
            target[1].classList.add("transparent")
            setTimeout(() => {
                target[0].classList.add("hidden")
                target[1].innerHTML="Connecting"
                target[1].classList.remove("transparent")
                target[2].classList.remove("hidden")
                target[2].classList.remove("transparent")
                //dot animation
                target[2].children[0].classList.add("jump")
                for(let i=1;i<target[2].children.length;i++){
                    setTimeout(() => {
                        target[2].children[i].classList.add("jump")
                    }, 300*i);
                }
            }, 250);
}
//when connected
onConnect=()=>{
    let target=document.querySelector(".connection").children
    target[1].classList.add("transparent");
    target[2].classList.add("transparent");
    setTimeout(() => {
        target[2].classList.add("hidden")
        target[1].innerHTML="Connected"
        target[1].classList.remove("transparent")
        setTimeout(() => {
            document.querySelector(".connection").style.transform="translateY(-2em)"
            document.querySelector(".connection").classList.add("transparent")
            setTimeout(() => {
                document.querySelector(".connection").classList.add("hidden")
                document.querySelector(".connection").style.transform="translateY(0)"
            }, 250);
            //remove dot animation
            for(let i=1;i<target[2].children.length;i++){
                    target[2].children[i].classList.remove("jump")
            }
        }, 250);
    }, 250);
}
// updateData
setInterval(() => {
    //update battery
    let b1P=((100)/4.8*(data.b1-10.2)+Math.abs((100)/4.8*(data.b1-10.2))).toFixed(1)
    let b2P=((100)/4.8*(data.b2-10.2)+Math.abs((100)/4.8*(data.b2-10.2))).toFixed(1)
    document.querySelector(".b1").children[1].innerHTML=b1P+"%"
    document.querySelector(".b1").children[3].innerHTML=data.b1.toFixed(2)+"V"
    document.querySelector(".b2").children[1].innerHTML=b2P+"%"
    document.querySelector(".b2").children[3].innerHTML=data.b2.toFixed(2)+"V"
    //change battery fill
    document.querySelector(".b1 .fill").style.height=Math.floor(16*b1P/100)+"px"
    document.querySelector(".b2 .fill").style.height=Math.floor(16*b2P/100)+"px"
    //update rpm
    if(!document.querySelector(".testingMenu").classList.contains("hidden")){
        let target=document.querySelectorAll(".rpm .val")
        if(data.m1rpm>60){
            target[0].firstElementChild.innerHTML=data.m1rpm
            //update simulation var
            upperRPM=data.m1rpm
            if(data.m1rpm>16000)upperRPM=16000
            let m1Slider=document.querySelector(".m1Slider")
            let width=m1Slider.getBoundingClientRect().width
            m1Slider.firstElementChild.style.width=upperRPM/16000*width+"px"
        }
        else if(testingMenuDragFlag!=1){
            target[0].firstElementChild.innerHTML=0
        }
        if(data.m2rpm>60){
            target[1].firstElementChild.innerHTML=data.m2rpm
            //update simulation var
            bottomRPM=data.m2rpm
            if(data.m2rpm>16000)bottomRPM=16000
            let m2Slider=document.querySelector(".m2Slider")
            let width=m2Slider.getBoundingClientRect().width
            m2Slider.firstElementChild.style.width=upperRPM/16000*width+"px"
        }
        else if(testingMenuDragFlag!=1){
            target[1].firstElementChild.innerHTML=0
        }
    }
}, 1000);
// burger click
document.querySelector(".burger").addEventListener("click",(e)=>{
    e.currentTarget.firstElementChild.classList.toggle("open")
    if(e.currentTarget.firstElementChild.classList.contains("open")){
        document.querySelector(".extraBar").classList.add("popup")
    }
    else{
        document.querySelector(".extraBar").classList.remove("popup")
    }
})
//footer forcestop arrow
document.querySelector(".forceStop .arrow").addEventListener("click",(e)=>{
    e.currentTarget.classList.toggle("open")
    e.currentTarget.parentElement.classList.toggle("open")
})
// onClick manual on playMode
document.querySelector(".manualMode").addEventListener("click",(e)=>{
    e.currentTarget.parentElement.classList.add("hidden")
    document.querySelector(".backMenuFoot").classList.remove("hidden");
    document.querySelector(".manualModeMenu").classList.remove("hidden")
})
//back to playMode
document.querySelector(".backMenuFoot").addEventListener("click",async(e)=>{
    e.currentTarget.classList.add("hidden")
    document.querySelector(".playMode").classList.remove("hidden")
    document.querySelector(".court .front .startSign").classList.add("hidden")
    document.querySelector(".manualModeMenu").classList.add("hidden")
    document.querySelector(".testingMenu").classList.add("hidden")
    document.querySelector(".objectDetectionMenu").classList.add("hidden")
    restartAllValue()
    //reset odMode
    try{
        let x=await fetch("http://192.168.0.201/turnMode?odMode=0")
    }
    catch{
        print("error backMenuFoot when")
    }
})
//------------------------------------onManualModeMenu-----------------------//
//glowUpOnClick
let setShootTypeChilds=document.querySelector(".setShootType").children
for (let i = 0; i < setShootTypeChilds.length; i++) {
    setShootTypeChilds[i].addEventListener("click",e=>{
        if(!document.querySelector(".selected")){
            document.querySelector(".court .front .note h2").innerHTML="Select Target"
        }
        if(document.querySelector(".setShootType .selected")){
            document.querySelector(".setShootType .selected").classList.remove("selected")
        }        
        e.currentTarget.classList.add("selected")
    })
}
let shootTargetChild=document.querySelector(".court .back").children
for (let i = 2; i < shootTargetChild.length; i++) {
    let stcCC=shootTargetChild[i].children
    for (let i = 0; i < stcCC.length; i++) {
        stcCC[i].addEventListener("click",e=>{
            if(document.querySelector(".back div .selected")){
                document.querySelector(".back div .selected").classList.remove("selected");
            }
            if(document.querySelector(".setShootType .selected")){
                e.currentTarget.children[0].classList.add("selected")
                document.querySelector(".court .front .note h2").innerHTML="Start to Shoot"
                document.querySelector(".court .front .startSign").classList.remove("hidden")
                let element=document.createElement("div")
                element.classList.add("restartButton")
                element.innerHTML="<span>Restart</span>"
                document.querySelector(".manualModeMenu").appendChild(element)
                //restartButton
                element.addEventListener("click",e=>{
                    document.querySelectorAll(".selected").forEach(e=>{
                        e.classList.remove("selected")
                    })
                    element.remove()
                    document.querySelector(".court .front .note h2").innerHTML="Select Shoot Type"
                    document.querySelector(".court .front .startSign").classList.add("hidden")
                })
            }
        })
        
    }
}
//----------------------------------objectDetectionMode------------------------------------------//
document.querySelector(".objectDetectionMode").addEventListener("click",async(e)=>{
    let target=document.querySelector(".objectDetectionMenu .dot")
    target.classList.add("glowing")
    e.currentTarget.parentElement.classList.add("hidden")
    document.querySelector(".backMenuFoot").classList.remove("hidden");
    document.querySelector(".objectDetectionMenu").classList.remove("hidden");
    try{
        let x=await fetch("http://192.168.0.201/turnMode?odMode=1")
        x=await x.text()
        console.log(x)
        target.classList.remove("glowing")
        target.firstElementChild.innerHTML="Disconnect"
        target.firstElementChild.style.color="white"
    }
    catch{
        target.classList.remove("glowing")
        target.firstElementChild.innerHTML="Retry"
        target.firstElementChild.style.color="white"
    }
})
//when click big circle on odMenu
document.querySelector(".objectDetectionMenu .dot").addEventListener("click",async(e)=>{
    let target=e.currentTarget
    if(target.firstElementChild.textContent=="Retry"||target.firstElementChild.textContent=="Connect"){
        target.firstElementChild.innerHTML="Loading"
        target.classList.add("glowing")
        try{
            let x=await fetch("http://192.168.0.201/turnMode?odMode=1")
            x=await x.text()
            console.log(x)
            target.classList.remove("glowing")
            target.firstElementChild.innerHTML="Disconnect"
            target.firstElementChild.style.color="white"
        }
        catch{
            target.classList.remove("glowing")
            target.firstElementChild.innerHTML="Retry"
            target.firstElementChild.style.color="white"
        }
    }
    else if(target.firstElementChild.textContent=="Disconnect"){
        target.classList.add("glowing")
        target.firstElementChild.innerHTML="Loading"
        try{
            let x=await fetch("http://192.168.0.201/turnMode?odMode=0")
            x=await x.text()
            console.log(x)
            target.classList.remove("glowing")
            target.firstElementChild.innerHTML="Connect"
            target.firstElementChild.style.color="white"
        }
        catch{
            target.classList.remove("glowing")
            target.firstElementChild.style.color="white"
        }
    }
})
//----------------------------------------testing------------------------------------------------//
document.querySelector(".testing").addEventListener("click",e=>{
    e.currentTarget.parentElement.classList.add("hidden")
    document.querySelector(".backMenuFoot").classList.remove("hidden");
    document.querySelector(".testingMenu").classList.remove("hidden");
    console.log("hmmmm")
})
//send data function
function testingSendData(target){
    let parentClass=target.parentElement.parentElement.parentElement.classList.value
    if(parentClass=="speed m1"){
        data.m1speed=target.text-'0'
        console.log(`m1speed:${target.text-'0'}`)
        if(data.status=="stopped"&&data.m1speed>0){
            data.status="running"
        }
        else if(data.status=="running"&&data.m1speed==0 && data.m2speed==0){
            data.status="stopped"
        }
    }
    else if(parentClass=="speed m2"){
        data.m2speed=target.text-'0'
        console.log(`m2speed:${target.text-'0'}`)
        if(data.status=="stopped"&&data.m2speed>0){
            data.status="running"
        }
        else if(data.status=="running"&&data.m1speed==0 && data.m2speed==0){
            data.status="stopped"
        }
    }
    else if(parentClass=="xAngle"){
        data.xAngle=target.text-'0'
        angX=data.xAngle;
        console.log(`xAngle:${target.text-'0'}`)
    }
    else if(parentClass=="yAngle"){
        data.yAngle=target.text-'0'
        angY=data.yAngle;
        console.log(`yAngle:${target.text-'0'}`)
    }
    //send data to server
    if(ws.readyState==1){
        ws.send(JSON.stringify(data));
    }
}
let isNotChange

let clickEventStart,clickEventEnd,clickMoveStart,device;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
    clickEventStart="touchstart"
    clickMoveStart="touchmove"
    clickEventEnd="touchend"
    device="mobile"
    console.log(device)
}
else{
    clickEventStart="mousedown"
    clickMoveStart="mousemove"
    clickEventEnd="mouseup"
    device="pc"
    console.log(device)
}
//drag testing menu//
let lastY,lastTranslateY=0;
let testingMenuDragFlag=0;
//on click
document.querySelector(".testingMenu").addEventListener(clickEventStart,e=>{
    //requestFull screen if not in fullscreen
    if(!document.querySelector(".fullscreen").classList.contains("onFullscreen")){
        document.documentElement.requestFullscreen()
    }
    if(device=="mobile"){
        lastY=e.touches[0].clientY
    }
    else{
        lastY=e.clientY
    }
})
//on move
let moveClickFlag=0;
document.querySelector(".testingMenu").addEventListener(clickEventStart,e=>{
    moveClickFlag=1
})
document.querySelector(".testingMenu").addEventListener(clickMoveStart,e=>{
    let y;
    if(device=="mobile"){
        y=e.touches[0].clientY
    }
    else if(moveClickFlag==1){
        y=e.clientY
    }
    document.querySelector(".testingMenu").style.transform="translateY("+(y-lastY+lastTranslateY)+"px)"
})
//on end
document.querySelector(".testingMenu").addEventListener("mouseleave",e=>{
    moveClickFlag=0;
    document.querySelector(".testingMenu").style.transform="translateY(0px)"
})
document.querySelector(".testingMenu").addEventListener(clickEventEnd,e=>{
    let y;
    if(device=="mobile"){
        y=e.changedTouches[0].clientY
    }
    else{
        moveClickFlag=0;
        y=e.clientY
    }
    //dragDown testingmenu for simulation
    if(testingMenuDragFlag!=1){
        document.querySelector(".testingMenu").style.transform="translateY(0px)"
        //on success
        if(lastY-y<-screen.height*0.2){
            testingMenuDragFlag=1;
            //hidden reset, m1 m2 speed, and shoot element
            document.querySelector(".testingMenu .reset").classList.add("hidden")
            document.querySelector(".testingMenu .shoot").classList.add("hidden")
            let speedM1=document.querySelector(".speed.m1");
            speedM1.classList.add("hidden")
            speedM1.nextElementSibling.classList.add("hidden")
            //show simulation
            document.querySelector(".simulationFrame").classList.remove("hidden")
            //show rpm slider
            document.querySelector(".rpmSimSlider").classList.remove("hidden")
        }
    }
    //dragUp
    else if(testingMenuDragFlag!=0){
        document.querySelector(".testingMenu").style.transform="translateY(0px)"
        //on success 
        if(lastY-y>screen.height*0.2){
            testingMenuDragFlag=0;
            //show reset and shoot element
            document.querySelector(".testingMenu .reset").classList.remove("hidden")
            document.querySelector(".testingMenu .shoot").classList.remove("hidden")
            let speedM1=document.querySelector(".speed.m1");
            speedM1.classList.remove("hidden")
            speedM1.nextElementSibling.classList.remove("hidden")
            //hide simulation
            document.querySelector(".simulationFrame").classList.add("hidden")
            //reset slider bar and hideit
            document.querySelector(".m1Slider").firstElementChild.style.width="3px"
            document.querySelector(".m2Slider").firstElementChild.style.width="3px"
            document.querySelector(".rpmSimSlider").classList.add("hidden")

        }
    }
})

//setValue-//
let startClickInterval;
for (let i = 0; i < 4; i++) {
    document.querySelectorAll(".add")[i].addEventListener(clickEventStart,e=>{
        let target=e.currentTarget.previousElementSibling.firstElementChild
        isNotChange=target.text
        startClickInterval=setInterval(() => {
            //speed %
            if(target.text-'0'<100 && target.parentElement.parentElement.parentElement.classList.contains("speed")){
                target.innerHTML=(target.text-'0'+1)
            }
            //angleY
            else if(target.text-'0'<60 && target.parentElement.parentElement.parentElement.classList.contains("yAngle")){
                target.innerHTML=(target.text-'0'+1)
            }
            //angleX
            else if(target.text-'0'<35){
                target.innerHTML=(target.text-'0'+1)
            }
            testingSendData(target)
        }, 50);
        //hard reset simulation
        resetFlag=3;
    })
}
// })
for (let i = 0; i < 4; i++) {
    [clickEventEnd,"mouseleave"].forEach(e=>{
        document.querySelectorAll(".add")[i].addEventListener(e,e=>{
            clearInterval(startClickInterval)
            let target=e.currentTarget.previousElementSibling.firstElementChild
            if(target.text==isNotChange ){
                //speed %
                if(target.text-'0'<100 && target.parentElement.parentElement.parentElement.classList.contains("speed")){
                    target.innerHTML=(target.text-'0'+1)
                }
                //angleY
                else if(target.text-'0'<60 && target.parentElement.parentElement.parentElement.classList.contains("yAngle")){
                    target.innerHTML=(target.text-'0'+1)
                }
                //angleX
                else if(target.text-'0'<35){
                    target.innerHTML=(target.text-'0'+1)
                }
                testingSendData(target)
                
            }
            //start ball after touch end
            sFlag=1;
        })
    })
}
let endClickInterval
for (let i = 0; i < 4; i++) {
    document.querySelectorAll(".min")[i].addEventListener(clickEventStart,e=>{
        let target=e.currentTarget.nextElementSibling.firstElementChild
        isNotChange=target.text
        endClickInterval=setInterval(() => {
            if(target.text-'0'>0){
                target.innerHTML=(target.text-'0'-1)
            }
            else if(target.text-'0'>-35 && target.parentElement.parentElement.parentElement.classList.contains("xAngle")){
                target.innerHTML=(target.text-'0'-1)
            }
            testingSendData(target)
        }, 50);
        //hard reset simulation
        resetFlag=3;
    })
}
for (let i = 0; i < 4; i++) {
    [clickEventEnd,"mouseleave"].forEach(e=>{
        document.querySelectorAll(".min")[i].addEventListener(e,e=>{
            clearInterval(endClickInterval)
            let target=e.currentTarget.nextElementSibling.firstElementChild
            if(target.text==isNotChange ){
                if(target.text-'0'>0){
                    target.innerHTML=(target.text-'0'-1)
                }
                else if(target.text-'0'>-35 && target.parentElement.parentElement.parentElement.classList.contains("xAngle")){
                    target.innerHTML=(target.text-'0'-1)
                }
                testingSendData(target)
            }
            //start ball after touch end
            sFlag=1;
        })
    })
}
//slider rpm simulation--------------------------------------------------------
let m1SliderLastX, m2SliderLastX, lastBoxWidth;
let rpmValTarget=document.querySelectorAll(".rpm .val a");
document.querySelector(".m1Slider").addEventListener(clickEventStart,e=>{
    moveClickFlag=1;
    if(device=="mobile"){
        m1SliderLastX=e.touches[0].clientX
    }
    else{
        m1SliderLastX=e.clientX
    }
    lastBoxWidth=e.currentTarget.firstElementChild.getBoundingClientRect().width
})
document.querySelector(".m1Slider").addEventListener(clickEventEnd,e=>{
    moveClickFlag=0;
})
document.querySelector(".m1Slider").addEventListener(clickMoveStart,e=>{
    let x;
    if(device=="mobile"){
        x=e.changedTouches[0].clientX
    }
    else if(moveClickFlag==1){
        x=e.clientX
    }
    let diff=x-m1SliderLastX;
    let boxWidth=e.currentTarget.getBoundingClientRect().width
    let finalWidth=lastBoxWidth+diff
    if(finalWidth>0&&finalWidth<=boxWidth){
        e.currentTarget.firstElementChild.style.width=finalWidth+"px"
        //update rpm
        upperRPM=Math.floor(16000*finalWidth/boxWidth)
        rpmValTarget[0].innerHTML=upperRPM;
    }
})
document.querySelector(".m2Slider").addEventListener(clickEventStart,e=>{
    moveClickFlag=1;
    if(device=="mobile"){
        m2SliderLastX=e.touches[0].clientX
    }
    else{
        m2SliderLastX=e.clientX
    }
    lastBoxWidth=e.currentTarget.firstElementChild.getBoundingClientRect().width
})
document.querySelector(".m2Slider").addEventListener(clickEventEnd,e=>{
    moveClickFlag=0;
})
document.querySelector(".m2Slider").addEventListener(clickMoveStart,e=>{
    let x;
    if(device=="mobile"){
        x=e.changedTouches[0].clientX
    }
    else if(moveClickFlag==1){
        x=e.clientX
    }
    let diff=x-m2SliderLastX;
    let boxWidth=e.currentTarget.getBoundingClientRect().width
    let finalWidth=lastBoxWidth+diff
    if(finalWidth>0&&finalWidth<=boxWidth){
        e.currentTarget.firstElementChild.style.width=finalWidth+"px"
        //update rpm
        bottomRPM=Math.floor(16000*finalWidth/boxWidth)
        rpmValTarget[1].innerHTML=bottomRPM;
    }
})

//reset testing menu-------------------------------------------------------
document.querySelector(".testingMenu .reset").addEventListener("click",e=>{
    e.currentTarget.classList.add("clicked")
    setTimeout(() => {
        if(document.querySelector(".clicked")){
            document.querySelector(".clicked").classList.remove("clicked")
        }
    }, 1000);
    document.querySelectorAll(".min").forEach(e=>{
        e.nextElementSibling.firstElementChild.innerHTML=0
    })
    //send reseted value
    data.m1speed=0
    data.m2speed=0
    data.xAngle=0
    data.yAngle=0
    data.status="stopped"
    console.log(`data reseted; m1speed:${data.m1speed}, m2speed:${data.m2speed}, xAngle:${data.xAngle}, yAngle:${data.yAngle}`)
    //send data to server
    if(ws.readyState==1){
        ws.send(JSON.stringify(data))
    }
})
let secondClick=false;
document.querySelector(".testingMenu .shoot").addEventListener("click",e=>{
    if(!secondClick){
        secondClick=true
        e.currentTarget.classList.add("clicked")
        setTimeout(() => {
            if(document.querySelector(".clicked")){
                document.querySelector(".clicked").classList.remove("clicked")
                secondClick=false
            }
        }, 1000);
        //add shootCount and send data
        data.shootCount++;
        console.log(data)
        //send data to server
        if(ws.readyState==1){
            ws.send(JSON.stringify(data));
        }
    }
})
//click fullscreen
document.querySelector(".fullscreen").addEventListener("click",e=>{
    if(e.currentTarget.classList.contains("onFullscreen") && document.fullscreenElement){
        document.exitFullscreen()
    }
    else if(!e.currentTarget.classList.contains("onFullscreen")){
        document.documentElement.requestFullscreen()
    }
    e.currentTarget.classList.toggle("onFullscreen");
})
document.onfullscreenchange=()=>{
    if(document.fullscreenElement){
        document.querySelector(".fullscreen").classList.add("onFullscreen");
    }
    else{
        document.querySelector(".fullscreen").classList.remove("onFullscreen");
    }
}
//generalFunct
function restartAllValue(){
    if(document.querySelector(".selected")){
        document.querySelectorAll(".selected").forEach(e=>{
            e.classList.remove("selected")
        })
        if(document.querySelector(".restartButton")){
            document.querySelector(".restartButton").remove()
        }
    }
}
//clear all interval
function clearAllInterval(){
    let lastIntervalId=setInterval(() => {
        
    }, Number.MAX_SAFE_INTEGER);
    for (let i = 0; i < lastIntervalId; i++) {
        clearInterval(i)
    }
}
// //fullscreen on mobile--------------------------------------------------------
// if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
//     setInterval(() => {
//         if(!document.fullscreenElement){
//             window.document.documentElement.requestFullscreen()
//         }
//     }, 1000);
// }
