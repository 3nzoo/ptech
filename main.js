var app = new PIXI.Application(1130,800, {backgroundColor : 0x3dbd80});
document.body.appendChild(app.view);

PIXI.loader
    .add("1","assets/01.png")
    .add("2","assets/02.png")
    .add("3","assets/03.png")
    .add("4","assets/04.png")
    .add("5","assets/05.png")
    .add("6","assets/06.png")
    .add("7","assets/07.png")
    .add("8","assets/08.png")
    .add("9","assets/09.png")
    .add("10","assets/10.png")
    .add("11","assets/11.png")
    .add("12","assets/12.png")
    .add("13","assets/13.png")
	.add('slot', "assets/frameBackground.jpg")
	.add('frame',"assets/slotOverlay.png")
	.add('bhover',"assets/btn_spin_hover.png")
	.add('bnormal',"assets/btn_spin_normal.png")
	.add('bpressed',"assets/btn_spin_pressed.png")
	.add('bdisable',"assets/btn_spin_disabled.png")
    .load(onAssetsLoaded);

var REEL_WIDTH = 220;
var SYMBOL_SIZE = 150;

function onAssetsLoaded()
{
	var col = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12],
	[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 13],	
	[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],	
	[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11],
	[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]];

    var normbutton = PIXI.Texture.fromImage('bnormal');	
    var hoverbutton = PIXI.Texture.fromImage('bhover');
    var disablebutton = PIXI.Texture.fromImage('bdisable');
    var presbutton = PIXI.Texture.fromImage('bpressed');

	var reels = [];
	var reelContainer = new PIXI.Container();
	for( var i = 0; i < 5; i++)
	{
		var rc = new PIXI.Container();
		rc.x = i*REEL_WIDTH;
		reelContainer.addChild(rc);
		
		var reel = {
			container: rc,
			symbols:[],
			position:0,
			previousPosition:0,
			blur: new PIXI.filters.BlurFilter()
		};
		reel.blur.blurX = 0;
		reel.blur.blurY = 0;
		rc.filters = [reel.blur];
        
        var frameb = new PIXI.Graphics();
		frameb.beginFill(0,1);
		frameb.drawRect(30,37,1050,558);
		app.stage.addChild(frameb);

		for(var j = 0; j < col[i].length; j++)
		{
			var symbol = new PIXI.Sprite.fromImage(col[i][j]);			
			symbol.y = j*SYMBOL_SIZE;
			symbol.scale.x = symbol.scale.y = Math.min( SYMBOL_SIZE / symbol.width, SYMBOL_SIZE/symbol.height);
			symbol.x = Math.round((SYMBOL_SIZE - symbol.width+20)/2);
			reel.symbols.push( symbol );
            rc.addChild(symbol);
            
            var slotbg = new PIXI.Sprite.fromImage('slot');
            slotbg.x = i*(frameb.width/5) +35;
            slotbg.y= j*SYMBOL_SIZE;
            slotbg.mask = frameb;
            slotbg.width = 210;
			slotbg.height = 200;
            app.stage.addChild(slotbg);
        }
		reels.push(reel);
    }
    
    var margin = 21;
    var frameg = new PIXI.Sprite.fromImage('frame');
    frameg.y = 0;
    app.stage.addChild(frameg);
    reelContainer.mask = frameb;
    app.stage.addChild(reelContainer);

	reelContainer.y = margin;
    reelContainer.x = Math.round(app.screen.width - REEL_WIDTH*5);
	
	var butPlay = new PIXI.Sprite(normbutton);
		butPlay.x = app.screen.width/2;
		butPlay.anchor.set(0.5);
		butPlay.y = 705;
		app.stage.addChild(butPlay);
		butPlay.interactive = true;
		butPlay.buttonMode = true;
		butPlay
			.on('pointerdown', ButtonDown)
			.on('pointerup', ButtonUp)
			.on('pointerupoutside', ButtonUp)
			.on('pointerover', ButtonOver)
            .on('pointerout', ButtonUp);

    function ButtonDown(){
        this.interactive = false;
        this.texture = presbutton;
        startPlay();
        playReel();
    }
    
    function ButtonUp(){
        this.texture = normbutton;
    }
    
    function ButtonOver(){
        this.texture = hoverbutton;
    }
		
	var running = false;

	function startPlay(){
		if(running)return;
        running = true;
        butPlay.texture = disablebutton;
        for(var i = 0; i < reels.length; i++)
		{
            var r = reels[i];
            var s = Math.floor(Math.random()*29);
            tweenTo(r, 
            "position",
            r.position + 10+i*50+s, 
            5000+i*500, 
            backout(.3), 
            null, 
            i == reels.length-1 ? reelsComplete : null);
        }
	}
	
	function reelsComplete(){
        running = false;
        butPlay.texture = normbutton;
        butPlay.interactive=true;   
        playLand();
	}
	
	app.ticker.add(function(a) {

		for( var i = 0; i < reels.length; i++)
		{
			var r = reels[i];
			r.blur.blurY = (r.position-r.previousPosition)*8;
			r.previousPosition = r.position;		
			for( var j = 0; j < r.symbols.length; j++)
			{
				var s = r.symbols[j];
				var prevy = s.y;
				s.y = (r.position + j)%r.symbols.length*SYMBOL_SIZE;

				if(s.y < 0 && prevy > SYMBOL_SIZE){
					s.texture = slotTextures[Math.floor(Math.random()*slotTextures.length)];
					s.scale.x = s.scale.y = Math.min( SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE/s.texture.height);
					s.x = Math.round((SYMBOL_SIZE - s.width)/2);
				}
			}
		}
	});
}

var tweening = [];
function tweenTo(object, property, target, time, easing, onchange, oncomplete)
{
	var tween = {
		object:object,
		property:property,
		propertyBeginValue:object[property],
		target:target,
		easing:easing,
		time:time,
		change:onchange,
		complete:oncomplete,
		start:Date.now()
	};
	
	tweening.push(tween);
	return tween;
}

app.ticker.add(function(a) {
	var now = Date.now();
	var remove = [];
	for(var i = 0; i < tweening.length; i++)
	{
		var t = tweening[i];
		var phase = Math.min(1,(now-t.start)/t.time);
		
		t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
		if(t.change) t.change(t);
		if(phase == 1)
		{
			t.object[t.property] = t.target;
			if(t.complete)
				t.complete(t);
			remove.push(t);
		}
	}
	for(var i = 0; i < remove.length; i++)
	{
		tweening.splice(tweening.indexOf(remove[i]),1);
	}
});

function lerp(a1,a2,t){
	return a1*(1-t) + a2*t;
}

backout = function(amount) {
		return function(t) {
			return (--t*t*((amount+1)*t + amount) + 1);
		};
};

var reelSpin = 'reelSound';
var landing = 'landSound';

function loadSound () {
    createjs.Sound.registerSound("assets/Reel_Spin.mp3", reelSpin);
    createjs.Sound.registerSound("assets/Landing_1.mp3", landing);    
};

function playReel () {
    createjs.Sound.play(reelSpin);
};

function playLand(){
    createjs.Sound.play(landing);
}

loadSound();
