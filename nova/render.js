function Render(canvas,BLOCKHEIGHT,colours,images,physics) {
  var c,
  t={},
  PIXEL_RATIO=SHEEP.pixelratio(),
  keypresses={};
  document.addEventListener("keydown",e=>keypresses[e.keyCode]=true,false);
  document.addEventListener("keyup",e=>keypresses[e.keyCode]=false,false);
  (this.resize=e=>{
    canvas.width=innerWidth*PIXEL_RATIO;
    canvas.height=innerHeight*PIXEL_RATIO;
    canvas.style.width=innerWidth+'px';
    canvas.style.height=innerHeight+'px';
  })();
  c=canvas.getContext('2d');
  c.scale(PIXEL_RATIO,PIXEL_RATIO);
  function rect(backgroundColour,x,y,sideLength,len) {
    len=len||1;
    c.fillStyle=backgroundColour;
    c.fillRect(x,y,sideLength*len,sideLength);
  }
  this.scrollX=0;
  this.scrollY=0;
  this.player={x:55,y:-225,xv:0,yv:0};
  this.frame=_=>{
    var scrollX=this.scrollX;
    scrollY=this.scrollY;
    canvas.width=canvas.width;
    c.scale(PIXEL_RATIO,PIXEL_RATIO);
    t.startI=Math.floor((scrollY-Math.floor(innerHeight/BLOCKHEIGHT)*BLOCKHEIGHT/2)/BLOCKHEIGHT);
    t.startJ=Math.floor((scrollX-Math.floor(innerWidth/BLOCKHEIGHT)*BLOCKHEIGHT/2)/BLOCKHEIGHT);
    t.height=Math.ceil(innerHeight/BLOCKHEIGHT)*BLOCKHEIGHT;
    t.width=Math.ceil(innerWidth/BLOCKHEIGHT)*BLOCKHEIGHT;
    t.x=-(scrollX<0?scrollX+Math.ceil(scrollX/-BLOCKHEIGHT)*BLOCKHEIGHT:scrollX)%BLOCKHEIGHT;
    t.y=-(scrollY<0?scrollY+Math.ceil(scrollY/-BLOCKHEIGHT)*BLOCKHEIGHT:scrollY)%BLOCKHEIGHT;
    t.destY=Math.floor(scrollY/BLOCKHEIGHT)+t.height/BLOCKHEIGHT+1;
    for (var i=Math.floor(scrollY/BLOCKHEIGHT);i<t.destY;i++) {
      t.c=Math.floor(scrollX/BLOCKHEIGHT);
      t.destX=Math.floor(scrollX/BLOCKHEIGHT)+t.width/BLOCKHEIGHT+1;
      for (var j=t.c;j<t.destX;j++) {
        if ((t.last&&t.last.t)!==(level[i]&&level[i][j]&&level[i][j].t)) {
          if (t.last&&t.last.t!=='air') {
            rect("#"+colours[t.last.t],t.x,t.y,BLOCKHEIGHT,j-t.c);
            if (typeof images[t.last.t]==='object') for (var k=0;k<j-t.c;k++) c.drawImage(images[t.last.t],t.x+k*BLOCKHEIGHT,t.y,BLOCKHEIGHT,BLOCKHEIGHT);
          }
          t.x+=(j-t.c)*BLOCKHEIGHT;
          t.c=j;
          t.last=level[i]&&level[i][j];
        }
      }
      if (t.last&&t.last.t!=='air') {
        rect("#"+colours[t.last.t],t.x,t.y,BLOCKHEIGHT,j-t.c);
        if (typeof images[t.last.t]==='object') c.drawImage(images[t.last.t],t.x,t.y,BLOCKHEIGHT,BLOCKHEIGHT);
      }
      t.x+=(j-t.c)*BLOCKHEIGHT-t.width-BLOCKHEIGHT;
      t.y+=BLOCKHEIGHT;
      t.last=undefined;
    }
    this.scrollX+=(this.player.x-innerWidth/2-scrollX)/3;
    this.scrollY+=(-this.player.y-innerHeight/2-scrollY)/3;
    // PLAYER
    rect('#E91E63',innerWidth/2-15+this.player.x-innerWidth/2-scrollX,innerHeight/2-15-this.player.y-innerHeight/2-scrollY,30);
    blockAt=(dx,dy)=>{
      var x=Math.floor((this.player.x+dx)/BLOCKHEIGHT),
      y=Math.floor(-(this.player.y+dy)/BLOCKHEIGHT);
      return level[y]&&level[y][x]||{t:'air'};
    };
    var keys={
      left:keypresses[37]||keypresses[65],
      right:keypresses[39]||keypresses[68],
      up:keypresses[38]||keypresses[87],
      down:keypresses[40]||keypresses[83],
      space:keypresses[32]
    };
    this.player.x+=this.player.xv;
    this.player.y+=this.player.yv;
    // horizontal movement
    if (physics[blockAt(-15,0).t].hardness==='solid'&&this.player.xv<0) {
      this.player.x=Math.ceil((this.player.x-15)/40)*40+15;
      if (keys.up) {
        this.player.yv+=7;
        this.player.xv*=-0.8;
      }
      else if (keys.left||keys.right) this.player.xv*=-0.5;
      else this.player.xv=0;
    }
    if (physics[blockAt(14,0).t].hardness==='solid'&&this.player.xv>0) {
      this.player.x=Math.floor((this.player.x+15)/40)*40-15;
      if (keys.up) {
        this.player.yv+=7;
        this.player.xv*=-0.8;
      }
      else if (keys.left||keys.right) this.player.xv*=-0.5;
      else this.player.xv=0;
    }
    // vertical movement
    if ((physics[blockAt(-14,-14).t].hardness==='solid'||physics[blockAt(13,-14).t].hardness==='solid')&&this.player.yv<0) {
      this.player.y=Math.ceil((this.player.y-15)/40)*40+15;
      this.player.yv=0;
    }
    if ((physics[blockAt(-14,15).t].hardness==='solid'||physics[blockAt(13,15).t].hardness==='solid')&&this.player.yv>0) {
      this.player.y=Math.floor((this.player.y+15)/40)*40-15;
      this.player.yv=0;
    }
    if ([
      physics[blockAt(-14,14).t].hardness,
      physics[blockAt(13,14).t].hardness,
      physics[blockAt(-14,-13).t].hardness,
      physics[blockAt(13,-13).t].hardness
    ].includes('liquid')) {
      // if (keys.up)
    } else if (physics[blockAt(-14,-15).t].hardness==='solid'||physics[blockAt(13,-15).t].hardness==='solid') {
      if ((keys.left||keys.right)&&Math.abs(this.player.xv)<10) {
        if (keys.left) this.player.xv-=1.5;
        if (keys.right) this.player.xv+=1.5;
      }
      else this.player.xv*=0.8;
      if (keys.up) this.player.yv=8;
      if (keys.space) this.player.xv*=0.3;
    }
    else this.player.yv-=0.5;
    window.requestAnimationFrame(this.frame);
  }
}
Render.loadImages=images=>{
  for (var span in images) {
    (span=>{
      var img=new Image();
      img.src=images[span];
      img.onload=e=>images[span]=img;
    })(span);
  }
}
