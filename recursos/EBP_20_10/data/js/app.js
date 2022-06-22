
;(function(document, window, undefined){
	
	"use strict";
	
	// GLOBAL DATA (PROPERTIES) OBJECT
	var data = new Object();
	
	// GLOBAL OBJECTS
	data.container;
	data.stage;
	data.renderer;
	data.view;
	data.viewStyle;
	data.background;
	data.app;
	data.content;
	data.home;
	data.info;
	data.loader;
	data.homeModal;
	data.infoModal;
	
	// GLOBAL SETTINGS
	data.mobile = isMobile();
	data.minLoaderDuration = 6 * 1000;
	data.loaderStartTime = 0;
	data.width = 1024;
	data.height = 671; // 768 - 97 (SAFARI iOS BROWSER TOP BAR)
	data.mul = 1;
	data.resSuffix = '_sd';
	data.devicePixelRatio = window.devicePixelRatio || 1;
	data.devicePixelScale = 1 / data.devicePixelRatio;
	data.HiDPI = (data.devicePixelRatio > 1 && data.mobile.iPad) || !data.mobile.Any;
	if(data.HiDPI){data.width *= 2; data.height *= 2; data.mul *= 2; data.resSuffix = '_hd';}
	data.cancelButtons = true;
	data.page = 0;
	data.pagesCnt = 6;
	data.act1 = {};
	data.act2 = {};
	
	// AUDIO ENGINE
	data.audio = AudioEngine();
	data.audioSprites = {
		btn_1: {start: 0.500, length: 0.366},
		btn_2: {start: 1.400, length: 0.269},
		ui_on: {start: 2.200, length: 0.150},
		drop_wrong: {start: 2.900, length: 0.600},
		chime: {start: 4.000, length: 1.600},
		page_1: {start: 6.100, length: 9.600},
		page_2: {start: 16.200, length: 12.800},
		page_3: {start: 29.500, length: 18.100},
		page_4: {start: 48.100, length: 12.600},
		page_5: {start: 61.200, length: 8.800},
		page_6: {start: 70.600, length: 8.400},
		title_1: {start: 79.500, length: 0.400},
		title_2: {start: 80.400, length: 0.500},
		title_3: {start: 81.400, length: 0.500},
		title_4: {start: 82.400, length: 0.500},
		title_5: {start: 83.600, length: 0.500},
		title_6: {start: 84.600, length: 0.600},
		title_7: {start: 85.700, length: 0.600},
		title_8: {start: 86.800, length: 0.500},
		title_9: {start: 87.800, length: 0.600},
		title_10: {start: 88.900, length: 0.600},
		act1_fail: {start: 90.000, length: 10.700},
		act1_end: {start: 101.200, length: 11.600},
		act2_end: {start: 113.300, length: 3.900},
		go_home: {start: 117.700, length: 2.000},
		go_info: {start: 120.200, length: 0.900}
	};

	// IMAGES
	data.imgs = {
		loader : 'data/img/loader' + data.resSuffix + '.json',
		sprites1 : 'data/img/sprites1' + data.resSuffix + '.json',
		sprites2 : 'data/img/sprites2' + data.resSuffix + '.json',
		back0 : 'data/img/0' + data.resSuffix + '.jpg',
		back1 : 'data/img/1' + data.resSuffix + '.jpg',
		back2 : 'data/img/2' + data.resSuffix + '.jpg',
		back3 : 'data/img/3' + data.resSuffix + '.jpg',
		back4 : 'data/img/4' + data.resSuffix + '.jpg',
		back5 : 'data/img/5' + data.resSuffix + '.jpg',
		back6 : 'data/img/6' + data.resSuffix + '.jpg',
		info : 'data/img/info' + data.resSuffix + '.jpg'
	}
	
	// SET GLOBAL EVENTS	
	document.addEventListener('touchmove', cancelEvent);
	window.addEventListener('load', ini);
	window.addEventListener('resize', resize);
	
	
	
	
	// INI (ONLOAD) FUNCTION
	function ini(){
		
		// SETUP HTML
		data.container = document.createElement('div');
		document.body.appendChild(data.container);		
		data.container.style.cssText = 'position: absolute; width: 100%; height: 100%; overflow: hidden;';
		
		// SETUP PIXI
		data.stage = new PIXI.Stage(0x000000, true);
	 	data.renderer = new PIXI.CanvasRenderer(data.width, data.height);
		data.view = data.renderer.view;
		data.viewStyle = data.view.style;
		data.viewStyle.position = 'absolute';
		
		// APPEND PIXI CANVAS TO DOM
		data.container.appendChild(data.view);
		
		// SET STAGE SIZE TO WINDOW SIZE (RESIZE)
		resize();
		
		// CREATE GLOBAL CONTAINERS
		data.background = new PIXI.DisplayObjectContainer();
		data.app = new PIXI.DisplayObjectContainer();
		data.app.visible = false;
		data.content = new PIXI.DisplayObjectContainer();	
		data.content.visible = false;	
		data.app.addChild(data.content);
		data.loader = new PIXI.DisplayObjectContainer();
		data.loader.alpha = 0;
		data.homeModal = new PIXI.DisplayObjectContainer();
		data.homeModal.visible = false;
		data.infoModal = new PIXI.DisplayObjectContainer();
		data.infoModal.visible = false;
		
		// LOAD LOADER WINDOW RESOURCES
		var assetLoader = new PIXI.AssetLoader([data.imgs.back0, data.imgs.loader]);
		assetLoader.onComplete = splash;
		assetLoader.load();
	}
	
	
	// SET SPLASH SCREEN
	function splash(){
		
		// SET APP GENERAL BACKGROUND
		var generalBack = PIXI.Sprite.fromFrame(data.imgs.back0)
		generalBack.setInteractive(true)
		generalBack.mousedown = generalBack.touchstart = cancelEvent;
		data.background.addChild(generalBack);		
		
		// CONVERT SPRITESHEET FRAMES TO SINGLE IMAGES FOR TILE SPRITES
		setTileTextureFromeSpriteSheet('road.png', 'road_crop.png');
		setTileTextureFromeSpriteSheet('bush.png', 'bush_crop.png');
		setTileTextureFromeSpriteSheet('sidewalk.png', 'sidewalk_crop.png');
		
		// SETUP LOADER WINDOW
		var cloud01 = PIXI.Sprite.fromFrame('cloud_01.png');
		cloud01.scale.x = cloud01.scale.y = 2;
		cloud01.position.x = data.width;
		cloud01.position.y = Value(20);
		cloud01.alpha = 0;
		cloud01.visible = false;
		data.loader.addChild(cloud01);
		var cloud02 = PIXI.Sprite.fromFrame('cloud_02.png');
		cloud02.scale.x = cloud02.scale.y = 2;
		cloud02.position.x = data.width;
		cloud02.position.y = Value(130);
		cloud02.alpha = 0;
		cloud02.visible = false;
		data.loader.addChild(cloud02);
		var cloud03 = PIXI.Sprite.fromFrame('cloud_03.png');
		cloud03.scale.x = cloud03.scale.y = 2;
		cloud03.position.x = data.width;
		cloud03.position.y = Value(240);
		cloud03.alpha = 0;
		cloud03.visible = false;
		data.loader.addChild(cloud03);
		var roadTexture = PIXI.Texture.fromFrame('road_crop.png');
		var road = new PIXI.TilingSprite(roadTexture, data.width, roadTexture.height);
		var bushTexture = PIXI.Texture.fromFrame('bush_crop.png');
		var bush = new PIXI.TilingSprite(bushTexture, data.width, bushTexture.height);
		var sidewalkTexture = PIXI.Texture.fromFrame('sidewalk_crop.png');
		var sidewalk = new PIXI.TilingSprite(sidewalkTexture, data.width, sidewalkTexture.height);
		var streetXPos = data.height - roadTexture.height;
		road.position.y = streetXPos;
		data.loader.addChild(road);
		streetXPos -= bushTexture.height;
		bush.position.y = streetXPos;
		data.loader.addChild(bush);
		var sign = PIXI.Sprite.fromFrame('sign.png');
		sign.position.x = data.width + Value(100);
		sign.position.y = Value(448);
		data.loader.addChild(sign);
		streetXPos += bushTexture.height - Value(30);
		sidewalk.position.y = streetXPos;
		data.loader.addChild(sidewalk);
		var bus = PIXI.Sprite.fromFrame('bus.png');
		bus.anchor.x = .5;
		bus.anchor.y = .5;
		bus.rotation = DegToRad(-1);
		bus.position.x = - Round(bus.width * .5);
		bus.position.y = data.height - Value(130);		
		data.loader.addChild(bus);
		var text = PIXI.Sprite.fromFrame('text.png');
		text.anchor.x = text.anchor.y = .5;
		text.position.x = Value(512);
		text.position.y = Value(250);
		text.rotation = DegToRad(-2);
		text.scale.x = text.scale.y = 1.2;
		text.alpha = 0;
		text.visible = false;
		data.loader.addChild(text);
		var start = PIXI.Sprite.fromFrame('start.png');
		start.anchor.x = start.anchor.y = .5;
		start.position.x = Value(512);
		start.position.y = Value(250);
		start.setInteractive(true)
		data.loader.addChild(start);
		var hand = PIXI.Sprite.fromFrame('hand.png');
		hand.position.x = Value(512 + 20);
		hand.position.y = Value(250 + 20);
		data.loader.addChild(hand);
		// START LOADING (USER EVENT NEEDED FOR IOS AUDIO LOADING)
		start.mousedown = start.touchstart = function(evt){
			cancelEvent(evt);
			start.setInteractive(false)
			TweenMax.to(hand, .5, {alpha: 0, ease: Power1.easeInOut});
			TweenMax.to(start, .5, {alpha: 0, ease: Power1.easeInOut, onComplete: function(){
				start.visible = false;
				text.visible = true;
				cloud01.visible = true;
				cloud02.visible = true;
				cloud03.visible = true;
				TweenMax.to(text, .5, {alpha: 1, ease: Power1.easeInOut});
				TweenMax.to(cloud01, .5, {alpha: 1, ease: Power1.easeInOut});
				TweenMax.to(cloud02, .5, {alpha: 1, ease: Power1.easeInOut});
				TweenMax.to(cloud03, .5, {alpha: 1, ease: Power1.easeInOut});
			}});
			var cloud01Tween = TweenMax.to(cloud01.position, 80, {x: -cloud01.width, ease: Power0.easeInOut, repeat: -1});
			var cloud02Tween = TweenMax.to(cloud02.position, 50, {x: -cloud02.width, ease: Power0.easeInOut, repeat: -1});
			var cloud03Tween = TweenMax.to(cloud03.position, 30, {x: -cloud03.width, ease: Power0.easeInOut, repeat: -1});
			cloud01Tween.seek(30);
			cloud02Tween.seek(37);
			cloud03Tween.seek(5);
			TweenMax.to(text.scale, .5, {x: 1.5, ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(text.scale, .7, {y: 1.5, ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(text, 3, {rotation: DegToRad(2), ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(bus, .25, {rotation: DegToRad(3), ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(bus.scale, .5, {x: .95, y:.95, ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(bus.position, 8, {x: data.width + Round(bus.width / 2), ease: Power0.easeInOut, repeat: -1});
			TweenMax.to(road.tilePosition, .2, {x: -roadTexture.width, ease: Power0.easeInOut, repeat: -1});
			TweenMax.to(bush.tilePosition, 1.7, {x: -bushTexture.width, ease: Power0.easeInOut, repeat: -1});
			TweenMax.to(sign.position, 8, {x: -sign.width, ease: Power0.easeInOut, repeat: -1});
			TweenMax.to(sidewalk.tilePosition, 1.2, {x: -sidewalkTexture.width, ease: Power0.easeInOut, repeat: -1});
			data.loaderStartTime = Date.now();
			loadSounds();
		}
		
		// ATTACH GLOBAL CONTAINERS TO STAGE
		data.stage.addChild(data.background);
		data.stage.addChild(data.app);
		data.stage.addChild(data.loader);
		data.stage.addChild(data.homeModal);
		data.stage.addChild(data.infoModal);
		
		// ANIMATION LOOP
		setTimeout(function(){ // FIREFOX HACK FOR BUG
			TweenMax.to(start.scale, .5, {x: 1.2, y: 1.2, ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(hand.position, .5, {x: Value(512), y: Value(250), ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(data.loader, .5 , {alpha: 1.0, ease: Power1.easeInOut});
			requestAnimationFrame(update);
		}, 100);
	}
	
	function loadSounds(){
		data.audio.load('data/snd/sounds', data.audioSprites, loadImages);
	}
	
	function loadImages(){
		var assetLoader = new PIXI.AssetLoader([
			data.imgs.sprites1,
			data.imgs.sprites2,
			data.imgs.back1,
			data.imgs.back2,
			data.imgs.back3,
			data.imgs.back4,
			data.imgs.back5,
			data.imgs.back6,
			data.imgs.info			
		]);
		assetLoader.onComplete = assetsLoaded;
		assetLoader.load();
	}
		
	// INI ASSETS LOADED
	function assetsLoaded(){
		// CHECK FOR MIN LOADER WINDOW DURATION BEFORE START
		var timeDelta = Date.now() - data.loaderStartTime
		if(timeDelta < data.minLoaderDuration){
			setTimeout(setupApp, data.minLoaderDuration - timeDelta);
		}else{
			setupApp();
		}
	}
	
	// SETUP APPLICATION
	function setupApp(){
		
		// BUILD HOME MODAL WINDOW
		createSprites('home modal');
		
		// BUILD INFO MODAL WINDOW
		createSprites('info modal');
		
		// BUILD MAIN MENU
		createSprites('menu buttons');
		
		// END LOADER WINDOW & START APPLICATION
		TweenMax.to(data.loader, .5, {alpha: 0, ease: Power1.easeInOut, onComplete: function(){
			data.loader.visible = false;
			startApp();
		}});
	}
	
	function startApp(){
		data.app.visible = true;
		TweenMax.to(data.home, .5, {alpha: 1, ease: Power1.easeInOut});
		TweenMax.to(data.voice, .5, {alpha: 1, ease: Power1.easeInOut});
		TweenMax.to(data.info, .5, {alpha: 1, ease: Power1.easeInOut, onComplete: function(){
			stepPage(true);
		}});
	}
	
	function stepPage(bool){
		var nextPage = bool ? data.page + 1 : data.page - 1;
		if(nextPage == data.page || nextPage < 1 || nextPage > data.pagesCnt) return
		setPage(nextPage);
	}
	
	function setPage(nextPage){
		data.page = nextPage;
		data.cancelButtons = true;
		data.content.visible = false;
		removeChildren(data.content);
		TweenMax.killAll();
		switch(data.page){
			case 1:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				createSprites('play button');
				speech();
				break
			case 2:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));	
				var mama = createSprite('simple', {
					parent: data.content,
					back: 'mama.png',
					ancX: .5,
					ancY: .9,
					posX: Value(-100),
					posY: Value(605)
				});
				TweenMax.to(mama.scale, 1, {y: .99, ease: Power1.easeInOut, repeat: -1, yoyo:true});
				TweenMax.to(mama.position, 3, {x: Value(330), ease: Power1.easeOut, delay: 1});
				var santiago = createSprite('simple', {
					parent: data.content,
					back: 'santiago.png',
					ancX: .5,
					ancY: .9,
					posX: data.width + Value(100),
					posY: Value(630)
				});
				TweenMax.to(santiago.scale, .7, {y: .99, ease: Power1.easeInOut, repeat: -1, yoyo:true});
				TweenMax.to(santiago.position, 3, {x: Value(580), ease: Power1.easeOut, delay: 1.6});
				var sofia = createSprite('simple', {
					parent: data.content,
					back: 'sofia.png',
					ancX: .5,
					ancY: .9,
					posX: data.width + Value(100),
					posY: Value(630)
				});
				TweenMax.to(sofia.scale, .8, {y: .99, ease: Power1.easeInOut, repeat: -1, yoyo:true});
				TweenMax.to(sofia.position, 3, {x: Value(790), ease: Power1.easeOut, delay: 2.5});
				createSprites('next button');
				speech();
				break				
			case 3:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				var apple = makeApple({pos: new PIXI.Point(Value(662), Value(198)), visible: true, fall: false});
				setTimeout(function(apple){apple.eat();}, 2000, apple);
				createSprites('next button');
				speech();
				break				
			case 4:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				act1();
				break
			case 5:
				data.act1 = {};
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				act2();
				break
			case 6:
				data.act2 = {};
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				createSprites('replay button');
				speech();
				break
		}
		data.content.alpha = 0;
		data.content.visible = true;
		TweenMax.to(data.content, .5, {alpha: 1, ease: Power1.easeInOut});
	}
	
	function disabledUI(bool){
		var btns = [];		
		if(data.page != 4) btns.push(data.content.getChildAt(data.content.children.length - 1));
		if(data.page == 4 && data.act1.finished) btns.push(data.content.getChildAt(data.content.children.length - 1));
		if(data.page == 5 && data.act2.finished) btns.push(data.content.getChildAt(data.content.children.length - 1));
		var cnt = btns.length;
		if(bool){
			data.cancelButtons = true;
			disableMenuButton(data.home, true);
			disableMenuButton(data.voice, true);
			disableMenuButton(data.info, true);
			for(var i = 0; i < cnt; i++){
				btns[i].interactive = false;
				btns[i].visible = false;
			}
		}else{
			if(data.page != 1) disableMenuButton(data.home, false);
			if(data.audio.enabled) disableMenuButton(data.voice, false);
			disableMenuButton(data.info, false);
			for(var i = 0; i < cnt; i++){
				btns[i].interactive = true;
				btns[i].visible = true;
			}
			data.audio.play('ui_on');
			data.cancelButtons = false;
		}
	}
	
	function disableMenuButton(button, bool){
		if(bool){
			button.interactive = false;
			TweenMax.to(button, .5, {alpha: .25, ease: Power1.easeInOut});
		}else{
			button.alpha = .25;
			TweenMax.to(button, .1, {alpha: 1, ease: Power1.easeInOut, onComplete: function(){
				button.interactive = true;
			}});
		}
	}
	
	function speech(fun){
		disabledUI(true);
		var sound = 'page_' + data.page;
		if(data.page == 4 && data.act1.finished){
			sound = data.act1.fail ? 'act1_fail' :  'act1_end';
		}
		if(data.page == 5 && data.act2.finished){
			sound = 'act2_end';
		}
		data.audio.play(sound, function(){
			disabledUI(false);
			if(fun) fun();
		});
	}
	
	function makeApple(props){
		var apple = new PIXI.DisplayObjectContainer();
		var back = createSprite('simple', {
			parent: apple,
			back: 'apple.png',
			ancX: .5,
			ancY: .5
		});
		var hole = createSprite('simple', {
			parent: apple,
			back: 'worm_hole.png',
			ancX: .5,
			ancY: .5,
			posX: Value(-16),
			posY: Value(12),
			scaX: 0,
			scaY: 0,
			visible: false
		});
		var worm = createSprite('simple', {
			parent: apple,
			back: 'worm.png',
			ancX: .91,
			ancY: .87,
			posX: Value(-10),
			posY: Value(17),
			scaX: 0,
			scaY: 0,
			visible: false
		});
		var number = new PIXI.DisplayObjectContainer();
		number.position.y = Value(12);
		number.alpha = 0;
		number.visible = false;
		for(var i = 0; i < 10; i++){
			createSprite('simple', {
				parent: number,
				back: (i + 1) + '_small.png',
				ancX: .5,
				ancY: .5,
				visible: false
			});			
		}
		apple.addChild(number);
		apple.position =  props.pos || new PIXI.Point(0, 0);
		apple.scale.x = apple.scale.y = props.sca || 1;
		apple.visible = ('visible' in props) ? props.visible : false;
		('parent' in props) ? props.parent.addChild(apple) : data.content.addChild(apple);
		var appleObj = {};
		appleObj.apple = apple;
		appleObj.hole = hole;
		appleObj.worm = worm;
		appleObj.number = number;
		appleObj.fall = ('fall' in props) ? props.fall : true;
		appleObj.onBeginFall = ('onBeginFall' in props) ? props.onBeginFall : null;
		appleObj.onFallen = ('onFallen' in props) ? props.onFallen : null;
		appleObj.wormTime = ('wormTime' in props) ? props.wormTime : 1.5;
		appleObj.startScale = apple.scale.x;
		appleObj.appleFallTime = ((data.height - apple.position.y) / data.height) * 1.5;
		appleObj.appleFallTargetPosY = data.height + Value(100);
		appleObj.enabled = false;
		appleObj.show = function(){
			this.apple.scale.x = this.apple.scale.y = 0;
			this.apple.visible = true;
			TweenMax.to(this.apple.scale, .5, {x: appleObj.startScale, y: appleObj.startScale, ease: Elastic.easeOut});
		}
		appleObj.eat = function(){
			var apple = this.apple;
			apple.rotation = DegToRad(-20);
			this.appleTween = TweenMax.to(this.apple, .1, {rotation: DegToRad(20), ease: Power1.easeInOut, repeat: -1, yoyo: true});
			this.appleTween.timeScale(0);
			this.appleTween.seek(.05);
			TweenMax.to(this.appleTween, 1, {timeScale: 1, ease: Power0.easeInOut, onCompleteScope: appleObj, onComplete: function(){
				TweenMax.to(this.appleTween, .2, {timeScale: .1, ease: Power1.easeOut});
				var hole = this.hole;
				var worm = this.worm;
				hole.scale.x = hole.scale.y = 0;
				hole.visible = true;
				TweenMax.to(hole.scale, .2, {x: 1, y: 1, ease: Bounce.easeOut});
				worm.scale.x = worm.scale.y = 0;
				worm.visible = true;
				TweenMax.to(worm, .3, {rotation: DegToRad(6), ease: Power1.easeInOut, repeat: -1, yoyo: true});
				TweenMax.to(worm.scale, .8, {x: 1, y: 1, ease: Elastic.easeOut, onCompleteScope: appleObj, onComplete: function(){
					TweenMax.to(worm.scale, .2, {x: .98, y: .98, ease: Power1.easeInOut, repeat: -1, yoyo: true});
					if(!this.fall) return
					TweenMax.to(worm.scale, .2, {x: 0, y: 0, ease: Power1.easeInOut, delay: this.wormTime, onCompleteScope: appleObj, onComplete: function(){
						this.drop();
					}});
				}});
			}});
		}
		appleObj.drop = function(){
			appleObj.enabled = false;
			if(this.onBeginFall != null) this.onBeginFall();
			TweenMax.killTweensOf(this.worm); 
			TweenMax.to(this.apple.position, this.appleFallTime, {y: this.appleFallTargetPosY, ease: Power1.easeIn, onCompleteScope: appleObj, onComplete: function(){
				var apple = this.apple;
				this.appleTween = null;
				apple.visible = false;
				TweenMax.killTweensOf(apple);
				apple.parent.removeChild(apple);
				apple = null;
				this.apple = null;
				this.hole = null;
				this.worm = null;
				this.number = null;
				if(this.onFallen != null) this.onFallen();
			}});
		}
		return appleObj
	}
	
	function act1(){
		var apples = [];
		var applesPos = [
			new PIXI.Point(Value(351), Value(51)),
			new PIXI.Point(Value(272), Value(119)),
			new PIXI.Point(Value(464), Value(119)),
			new PIXI.Point(Value(179), Value(180)),
			new PIXI.Point(Value(367), Value(180)),
			new PIXI.Point(Value(76), Value(258)),
			new PIXI.Point(Value(272), Value(258)),
			new PIXI.Point(Value(464), Value(258)),
			new PIXI.Point(Value(179), Value(320)),
			new PIXI.Point(Value(367), Value(320)),
			new PIXI.Point(Value(76), Value(394)),
			new PIXI.Point(Value(272), Value(394)),
			new PIXI.Point(Value(464), Value(394)),
			new PIXI.Point(Value(179), Value(456)),
			new PIXI.Point(Value(367), Value(456))
		];
		var applesCnt = applesPos.length;
		var applesScale = .6;
		for(var i = 0; i < applesCnt; i++){
			var apple = makeApple({pos: applesPos[i], sca: applesScale, onBeginFall: dropAllApplesOnFinished, onFallen: eatNextApple, wormTime: RandomInt(1.5, 3.5) + Math.random()});
			apples.push(apple);
		};
		apples = ShuffleArray(apples);
		var applesToCollect = 10;
		var applesCols = 5;
		var applesRows = 2;
		var targetPosXLimits = [Value(590), Value(950)];
		var targetPosYLimits = [Value(465), Value(543)];
		var targetGapX = Round((targetPosXLimits[1] - targetPosXLimits[0]) / (applesCols - 1));
		var targetGapY = Round((targetPosYLimits[1] - targetPosYLimits[0]) / (applesRows - 1));
		var targetStartPosX = targetPosXLimits[0];
		var targetStartPosY = targetPosYLimits[0];
		var applesTargetPos = [];
		for(var i = 0; i < applesRows; i++){
			for(var j = 0; j < applesCols; j++){
				applesTargetPos.push(new PIXI.Point(targetStartPosX + (targetGapX * j), targetStartPosY + (targetGapY * i)));
			};
		};
		var number = new PIXI.DisplayObjectContainer();
		number.position.x = Value(780);
		number.position.y = Value(240);
		for(var i = 0; i < applesToCollect; i++){
			createSprite('simple', {
				parent: number,
				back: (i + 1) + '.png',
				ancX: .5,
				ancY: .5,
				visible: false
			});			
		};
		data.content.addChild(number);
		data.act1.apples = apples;
		data.act1.applesCnt = applesCnt;	
		data.act1.applesToCollect = applesToCollect;
		data.act1.applesCollected = 0;
		data.act1.applesEaten = 0;
		data.act1.applesEatenMax = 6;
		data.act1.applesTargetPos = applesTargetPos;
		data.act1.number = number;
		data.act1.fail = false;
		data.act1.finished = false;
		for(var i = 0; i < applesCnt; i++){
			setTimeout(
				function(apples, id, cnt){
					apples[id].show(); 
					if(id == (cnt - 1)){
						for(var j = 0; j < cnt; j++){
							var apple = apples[j];
							apple.enabled = true;
							var sprite = apple.apple;
							sprite.id = j;
							sprite.interactive = true;
							sprite.mousedown = sprite.touchstart = function(evt){
								cancelEvent(evt);
								if(data.cancelButtons) return
								putAppleInBasket(this.id);
							};
						};
					};
				}, 
			i * 100, apples, i, applesCnt);
		};
		speech(eatNextApple);
	}
	
	function eatNextApple(){
		var apples = data.act1.apples;
		var applesCnt = apples.length;
		var nextApple = null;
		for(var i = 0; i < applesCnt; i++){
			var tempApple = apples[i];
			if(tempApple.enabled){
				nextApple = tempApple;
				break;
			};
		};
		if(nextApple == null) return
		nextApple.enabled = false;
		data.content.removeChild(nextApple.apple);
		data.content.addChild(nextApple.apple);
		data.act1.applesEaten++;
		checkAct1End();
		nextApple.eat();
	}
	
	function dropAllApplesOnFinished(){
		if(!data.act1.finished) return
		var apples = data.act1.apples;
		var applesCnt = apples.length;
		for(var i = 0; i < applesCnt; i++){
			var tempApple = apples[i];
			if(tempApple.enabled){
				tempApple.enabled = false;
				tempApple.interactive = false;
				tempApple.drop();
			};
		};			
	}
	
	function putAppleInBasket(id){
		var apple = data.act1.apples[id];
		var sprite = apple.apple;
		if(!apple.enabled || data.act1.finished) return
		apple.enabled = false;
		sprite.interactive = false;
		var targetPos = data.act1.applesTargetPos[data.act1.applesCollected];
		data.content.removeChild(sprite);
		data.content.addChild(sprite);
		var number = apple.number;
		number.getChildAt(data.act1.applesCollected).visible = true;
		number.visible = true;
		TweenMax.to(number, .5, {alpha: 1, ease: Power1.easeInOut});
		TweenMax.to(sprite.position, .5, {x: targetPos.x, y: targetPos.y, ease: Back.easeOut});
		TweenMax.to(sprite.scale, .5, {x: .9, y: .9, ease: Bounce.easeOut});
		var number = data.act1.number;
		var cnt = number.children.length;
		for(var i = 0; i < cnt; i++){
			number.children[i].visible = false;
		};
		number.children[data.act1.applesCollected].visible = true;
		number.scale.x = number.scale.y = .5;
		TweenMax.to(number.scale, .2, {x: 1, y: 1, ease: Back.easeOut});
		data.act1.applesCollected++
		data.audio.play('title_' + data.act1.applesCollected);
		checkAct1End();
	}
	
	function resetAct1(){
		TweenMax.killAll();
		var cnt = data.content.children.length;
		for(var i = cnt - 1; i > 0; i--){
			data.content.removeChild(data.content.children[i]);
		}
		data.act1 = {};
		act1();
	}
	
	function checkAct1End(){
		if(data.act1.applesCollected >= data.act1.applesToCollect){
			data.act1.finished = true;
			createSprites('next button')
			disabledUI(true);
			setTimeout(function(){data.audio.play('chime');}, 1000);
			setTimeout(speech, 2400);
			
		}else if(data.act1.applesEaten >= data.act1.applesEatenMax){
			data.act1.fail = true;
			data.act1.finished = true;
			createSprites('replay act1 button');
			disabledUI(true);
			setTimeout(function(){data.audio.play('wrong');}, 1000);
			setTimeout(speech, 2400);
		};
	}
	
	function act2(){
		var apples = [];
		var applesCnt = 10;
		var applesScale = 1.5;
		var applesCols = 5;
		var applesRows = 2;
		var targetPosXLimits = [Value(170), Value(840)];
		var targetPosYLimits = [Value(310), Value(460)];
		var targetGapX = Round((targetPosXLimits[1] - targetPosXLimits[0]) / (applesCols - 1));
		var targetGapY = Round((targetPosYLimits[1] - targetPosYLimits[0]) / (applesRows - 1));
		var targetStartPosX = targetPosXLimits[0];
		var targetStartPosY = targetPosYLimits[0];
		var applesPos = [];
		for(var i = 0; i < applesRows; i++){
			for(var j = 0; j < applesCols; j++){
				applesPos.push(new PIXI.Point(targetStartPosX + (targetGapX * j), targetStartPosY + (targetGapY * i)));
			};
		};		
		for(var i = 0; i < applesCnt; i++){
			var apple = makeApple({pos: applesPos[i], sca: applesScale, visible: true, fall: false});
			apple.enabled = true;
			var sprite = apple.apple;
			sprite.id = i;
			sprite.interactive = true;
			sprite.mousedown = sprite.touchstart = function(evt){
				cancelEvent(evt);
				if(data.cancelButtons) return
				countAppleInBasket(this.id);				
			};
			sprite.rotation = DegToRad(-20);
			apple.appleTween = TweenMax.to(sprite, .4, {rotation: DegToRad(20), ease: Power1.easeInOut, repeat: -1, yoyo: true});
			apple.appleTween.seek(Math.random() * .4);
			apples.push(apple);
		};
		var number = new PIXI.DisplayObjectContainer();
		number.position.x = Round(data.width * .5);
		number.position.y = Value(120);
		number.scale.x = number.scale.y = .8;
		for(var i = 0; i < applesCnt; i++){
			createSprite('simple', {
				parent: number,
				back: (i + 1) + '.png',
				ancX: .5,
				ancY: .5,
				visible: false
			});			
		}
		data.content.addChild(number);
		var title = new PIXI.DisplayObjectContainer();
		title.position.x = Round(data.width * .5);
		title.position.y = Value(130);
		title.visible = false;
		var title1 = createSprite('simple', {
			parent: title,
			back: 'text_1.png',
			ancX: .5,
			ancY: .5,
			posY: Value(-40)
		});			
		var title1 = createSprite('simple', {
			parent: title,
			back: 'text_2.png',
			ancX: .5,
			ancY: .5,
			posY: Value(40)
		});	
		data.content.addChild(title);
		data.content.addChild(number);
		data.act2.apples = apples;
		data.act2.applesCnt = applesCnt;
		data.act2.appleCurrent = 0;	
		data.act2.number = number;
		data.act2.title = title;
		data.act1.finished = false;
		speech();
	}

	function countAppleInBasket(id){
		var apple = data.act2.apples[id];
		var sprite = apple.apple;
		if(!apple.enabled || data.act2.finished) return
		apple.enabled = false;
		sprite.interactive = false;
		data.content.removeChild(sprite);
		data.content.addChild(sprite);
		var number = apple.number;
		number.getChildAt(data.act2.appleCurrent).visible = true;
		number.visible = true;
		TweenMax.to(number, .5, {alpha: 1, ease: Power1.easeInOut});
		TweenMax.to(sprite.scale, .1, {x: sprite.scale.x * 1.5, y: sprite.scale.y * 1.5, ease: Power1.easeOut, repeat: 1, yoyo: true});
		apple.appleTween.kill();
		TweenMax.to(sprite, .1, {rotation: 0, ease: Power1.easeOut});
		var number = data.act2.number;
		var cnt = number.children.length;
		for(var i = 0; i < cnt; i++){
			number.children[i].visible = false;
		};
		number.children[data.act2.appleCurrent].visible = true;
		number.scale.x = number.scale.y = .5;
		TweenMax.to(number.scale, .2, {x: number.scale.x * 1.5, y: number.scale.y * 1.5, ease: Back.easeOut});
		data.act2.appleCurrent++
		data.audio.play('title_' + data.act2.appleCurrent);
		checkAct2End();
	}

	function checkAct2End(){
		if(data.act2.appleCurrent < data.act2.applesCnt) return
		data.act2.finished = true;
		createSprites('next button');
		disabledUI(true);
		setTimeout(function(){
			data.act2.number.visible = false;
			var title = data.act2.title;
			title.alpha = 0;
			title.visible = true;
			TweenMax.to(title, .2, {alpha: 1, ease: Power1.easeInOut});
			TweenMax.to(title.scale, .2, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
			data.audio.play('chime');
		}, 1000);
		setTimeout(speech, 2400);
	}

	function showModal(modal, bool, fun){
		if(bool){
			pauseAllTweens(true);
			if(modal == data.infoModal){
				var button = data.infoModal.getChildAt(1);
				button.scale.x = button.scale.y = 1;
				TweenMax.to(button.scale, .5, {x: 1.2, y: 1.2, ease: Power1.easeInOut, repeat: -1, yoyo:true});
			};
			modal.alpha = 0;
			modal.visible = true;
			TweenMax.to(modal, .2, {alpha: 1, ease: Power1.easeInOut, onComplete: function(){
				if(modal == data.homeModal) data.audio.play('go_home');
				if(modal == data.infoModal) data.audio.play('go_info');
			  	data.cancelButtons = false;
			}});
		}else{
			modal.visible = false;
			data.cancelButtons = false;
			pauseAllTweens(false);
			if (fun !== undefined) fun();
		};
	}

	function pauseAllTweens(bool){
		var allTweens = TweenMax.getAllTweens();
		var cnt = allTweens.length;
		if(bool){
			for(var i = 0; i < cnt; i++) allTweens[i].pause();
		}else{
			for(var i = 0; i < cnt; i++) allTweens[i].play();
		};		
	}

	function removeChildren(container){
		var cnt = container.children.length;
		for(var i = cnt - 1; i >= 0; i--){
			container.removeChild(container.getChildAt(i));
		};
	}
	
	function createSprites(type){
		switch(type){
			case 'menu buttons':
				data.home = createSprite('regular', {
					parent: data.app,
					back: 'home.png',
					ancX: .5,
					ancY: .5,
					posX: Value(22 + 36),
					posY: Value(22 + 34),
					alpha: 0,
					sound: 'btn_1',
					callback: function(){
						TweenMax.to(data.home.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo:true, onComplete: function(){
							showModal(data.homeModal, true);
						}});
					}
				});
				data.voice = createSprite('regular', {
					parent: data.app,
					back: 'voice.png',
					ancX: .5,
					ancY: .5,
					posX: Value(22 + 36 + 36 + 22 + 36),
					posY: Value(22 + 34),
					alpha: 0,
					sound: 'btn_1',
					callback: function(){
						TweenMax.to(data.voice.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo:true, onComplete: function(){
							speech();
						}});
					}
				});
				data.info = createSprite('regular', {
					parent: data.app,
					back: 'info.png',
					ancX: .5,
					ancY: .5,
					posX: data.width - Value(22 + 36),
					posY: Value(22 + 34),
					alpha: 0,
					sound: 'btn_1',
					callback: function(){
						TweenMax.to(data.info.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo:true, onComplete: function(){
							showModal(data.infoModal, true);
						}});
					}
				});
				break
			case 'play button':
				createSprite('regular', {
					parent: data.content,
					back: 'play.png',
					ancX: .5,
					ancY: .5,
					posX: Round(data.width * .5),
					posY: data.height - Value(100),
					halo: true,
					callback: function(){stepPage(true)},
					tween: {target: 'scale', time: .5, props: {x: 1.2, y: 1.2, ease: Power1.easeInOut, repeat: -1, yoyo:true}}
				});
				break
			case 'next button':
				createSprite('regular', {
					parent: data.content,
					back: 'next.png',
					ancX: .5,
					ancY: .5,
					posX: Value(944),
					posY: Value(600),
					callback: function(){stepPage(true)},
					tween: {target: 'scale', time: .5, props: {x: 1.2, y: 1.2, ease: Power1.easeInOut, repeat: -1, yoyo:true}}
				});
				break
			case 'replay button':
				createSprite('regular', {
					parent: data.content,
					back: 'replay.png',
					ancX: .5,
					ancY: .5,
					posX: Round(data.width * .5),
					posY: data.height - Value(100),
					halo: true,
					callback: function(){setPage(4);},
					tween: {target: 'scale', time: .5, props: {x: 1.2, y: 1.2, ease: Power1.easeInOut, repeat: -1, yoyo:true}}
				})
				break
			case 'replay act1 button':
				createSprite('regular', {
					parent: data.content,
					back: 'replay.png',
					ancX: .5,
					ancY: .5,
					posX: Round(data.width * .5),
					posY: data.height - Value(100),
					halo: true,
					callback: function(){resetAct1();},
					tween: {target: 'scale', time: .5, props: {x: 1.2, y: 1.2, ease: Power1.easeInOut, repeat: -1, yoyo:true}}
				})
				break
			case 'home modal':
				var homeModalBack = PIXI.Sprite.fromFrame(data.imgs.back0);
				homeModalBack.alpha = .85;
				homeModalBack.setInteractive(true)
				homeModalBack.mousedown = homeModalBack.touchstart = cancelEvent;
				data.homeModal.addChild(homeModalBack);
				var homeModalWindow = PIXI.Sprite.fromFrame('modal_back.png');
				homeModalWindow.position.x = Round((data.width - homeModalWindow.width) * .5);
				homeModalWindow.position.y = Round((data.height - homeModalWindow.height) * .5);
				data.homeModal.addChild(homeModalWindow);
				createSprite('regular', {
					parent: data.homeModal,
					back: 'modal_cancel.png',
					ancX: .5,
					ancY: .5,
					posX: Round(data.width * .5) + Value(110),
					posY: Value(400),
					sound: 'btn_2',
					callback: function(){
						var obj = data.homeModal.getChildAt(2);
						TweenMax.to(obj.scale, .1, {x: 1.2, y: 1.2, ease: Power1.easeInOut, repeat: 1, yoyo:true, onComplete: function(){
							showModal(data.homeModal, false);
						}});	
					}
				});
				createSprite('regular', {
					parent: data.homeModal,
					back: 'modal_ok.png',
					ancX: .5,
					ancY: .5,
					posX: Round(data.width * .5) - Value(110),
					posY: Value(400),
					callback: function(){
						var obj = data.homeModal.getChildAt(3);
						TweenMax.to(obj.scale, .1, {x: 1.2, y: 1.2, ease: Power1.easeInOut, repeat: 1, yoyo:true, onComplete: function(){
							showModal(data.homeModal, false, function(){setPage(1)});
						}});
					}
				});
				break
			case 'info modal':
				var infoModalBack = PIXI.Sprite.fromFrame(data.imgs.info);
				infoModalBack.setInteractive(true);
				infoModalBack.mousedown = infoModalBack.touchstart = cancelEvent;
				data.infoModal.addChild(infoModalBack);	
				createSprite('regular', {
					parent: data.infoModal,
					back: 'info_cancel.png',
					ancX: .5,
					ancY: .5,
					posX: data.width -  Value(44 + 22),
					posY: Value(44 + 22),
					sound: 'btn_2',
					callback: function(){
						var obj = data.infoModal.getChildAt(1);
						TweenMax.to(obj.scale, .1, {x: 1.5, y: 1.5, ease: Power1.easeInOut, repeat: 1, yoyo:true, onComplete: function(){
							showModal(data.infoModal, false);
						}});	
					}
				});
				break
		}
	}
	
	function createSprite(type, props){
		switch(type){
			case 'regular':
				if(props.halo){
					var icon = PIXI.Sprite.fromFrame(props.back);
					icon.anchor.x = icon.anchor.y = .5;
					var scale = (icon.width * 2.0) / Value(131.0);
					var gearBig = PIXI.Sprite.fromFrame('gear_big.png');
					gearBig.anchor.x = gearBig.anchor.y = .5;
					gearBig.scale.x = gearBig.scale.y = scale;
					gearBig.alpha = .25;
					TweenMax.to(gearBig, 10, {rotation: -DegToRad(360), ease: Power0.easeInOut, repeat: -1});
					var gearSmall = PIXI.Sprite.fromFrame('gear_small.png');
					gearSmall.anchor.x = gearSmall.anchor.y = .5;
					gearSmall.scale.x = gearSmall.scale.y = scale;
					gearSmall.alpha = .5;
					TweenMax.to(gearSmall, 8, {rotation: DegToRad(360), ease: Power0.easeInOut, repeat: -1});
					var button = new PIXI.DisplayObjectContainer();
					button.addChild(gearBig);
					button.addChild(gearSmall);
					button.addChild(icon);
				}else{
					var button = PIXI.Sprite.fromFrame(props.back);
					button.anchor.x = props.ancX || 0; 
					button.anchor.y = props.ancY || 0;
				}
				button.position.x = props.posX || 0;
				button.position.y = props.posY || 0;
				button.scale.x = props.scaX || 1;
				button.scale.y = props.scaY || 1;
				button.rotation = props.rotation || 0;
				button.alpha = ('alpha' in props) ? props.alpha : 1;
				button.visible = ('visible' in props) ? props.visible : 1;
				button.interactive = props.interactive || true;
				button.mousedown = button.touchstart = function(evt){
					cancelEvent(evt);
					if(data.cancelButtons) return
					data.cancelButtons = true;
					if(props.sound) data.audio.play(props.sound);
					if(button.tweenObj) button.tweenObj.kill();
					if(props.callback) props.callback();
				}
				if(props.tween) button.tweenObj = TweenMax.to(props.tween.target !== '' ? button[props.tween.target] : button, props.tween.time, props.tween.props);
				props.parent.addChild(button);
				return button
				break
			case 'simple':
				var sprite = PIXI.Sprite.fromFrame(props.back);
				sprite.anchor.x = props.ancX || 0; 
				sprite.anchor.y = props.ancY || 0;
				sprite.position.x = props.posX || 0;
				sprite.position.y = props.posY || 0;
				sprite.scale.x = props.scaX || 1;
				sprite.scale.y = props.scaY || 1;
				sprite.rotation = props.rotation || 0;
				sprite.alpha = ('alpha' in props) ? props.alpha : 1;
				sprite.visible = ('visible' in props) ? props.visible : 1;
				props.parent.addChild(sprite);
				return sprite
				break
		}
	}
	
	function resize(){
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;
		var scale = Min(windowWidth / data.width, windowHeight / data.height);
		var newWidth = Round(data.width * scale);
		var newHeight = Round(data.height * scale);
		data.viewStyle.width = newWidth + 'px';
		data.viewStyle.height = newHeight + 'px';
		data.viewStyle.left = Round((windowWidth - newWidth) * .5) + 'px';
		data.viewStyle.top = Round((windowHeight - newHeight) * .5) + 'px';
		window.scrollTo(0,0);
	}
	
	function update(){
		data.renderer.render(data.stage);
		requestAnimationFrame(update);
	}

	function setTileTextureFromeSpriteSheet(id, newID){
		var texture = PIXI.Texture.fromFrame(id);
		var frame = texture.frame;
		var tempCanvas = document.createElement('canvas');
		tempCanvas.width = frame.width;
		tempCanvas.height = frame.height;
		var ctx = tempCanvas.getContext('2d');
		ctx.drawImage(texture.baseTexture.source,
			frame.x, frame.y, frame.width, frame.height, 
			0, 0, frame.width, frame.height
		);
		var img = new Image();
		img.src = tempCanvas.toDataURL("image/png");      
		var newBaseTex = new PIXI.BaseTexture();
		newBaseTex.hasLoaded = true;
		newBaseTex.width = frame.width;
		newBaseTex.height = frame.height;
		newBaseTex.source = img;
		var newTex = new PIXI.Texture(newBaseTex, new PIXI.Rectangle(0,0,frame.width,frame.height));
		PIXI.Texture.addTextureToCache(newTex, newID);
	}
	
	// TOOLBOX
	
	function DegToRad(deg){
		return deg * (Math.PI / 180.0)
	}
	
	function Round(val){
		return (val + 0.5) >> 0
	}
	
	function Min(a, b){
		return a < b ? a : b
	}
	
	function Value(val){
		return val * data.mul
	}	

	function RandomInt(min, max) {
  		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function ShuffleArray(array){
		var newArray = array.slice(0);
		for (var i = newArray.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = newArray[i];
			newArray[i] = newArray[j];
			newArray[j] = temp;
		}
		return newArray
	}

	function isInUserAgent(userAgents){
		var regEx = new RegExp("(" + userAgents + ")", 'i');
		return regEx.test(navigator.userAgent)
	}
	
	function isMobile(){
		var type = {};
		type.iPad = isInUserAgent('iPad');
		type.iPhone = isInUserAgent('iPhone');
		type.iPod = isInUserAgent('iPod');
		type.Android = isInUserAgent('Android');
		type.BlackBerry = isInUserAgent('BlackBerry');
		type.Windows = isInUserAgent('IEMobile');
		type.Opera = isInUserAgent('Opera Mini');
		type.iOS = type.iPad || type.iPhone || type.iPod;
		type.Any = type.Android || type.BlackBerry || type.iOS || type.Opera || type.Windows;
		return type
	}
	
	function cancelEvent(e){
		var evt = ('originalEvent' in e) ? e.originalEvent : e;
		if('stopPropagation' in evt) evt.stopPropagation();
		if('preventDefault' in evt) evt.preventDefault();
		if('returnValue' in evt) evt.returnValue = false;
		if('cancelBubble' in evt) evt.cancelBubble = true;
		return false
	}
	
	// AUDIO ENGINE
	
	function AudioEngine(){ 
		var AE = {};
		AE.sprite;
		AE.sprites;
		AE.sound;
		AE.supported = false;
		AE.enabled = false;
		AE.mp3 = '';
		AE.ogg = '';
		AE.format = '';
		AE.onLoaded;
		AE.onSpriteComplete;
		AE.interval = 0;
		AE.timeout = 0;
		AE.timeoutDelay = 60 * 1000; 
		AE.lag = 0;
		// TEST FOR HTML5 AUDIO SUPPORT AND FILE FORMAT
		var test = new Audio();
		try{
			if(AE.supported = !!test.canPlayType) {
				AE.mp3 = test.canPlayType('audio/mpeg; codecs="mp3"').replace(/^no$/,'');
				AE.ogg = test.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
				AE.supported = (mp3 != '' || ogg != '');
			}
		}catch(e){}
		if(AE.supported){
			if(AE.mp3 != '' && !isInUserAgent('Opera|Firefox')){
				AE.format = '.mp3';
			}else{
				AE.format = '.ogg';
			}
		}
		if(isInUserAgent('MSIE|Trident|Android')) AE.lag = .2;
		// LOAD AUDIO FILE
		AE.load = function(file, sprites, fun){
			if(!AE.supported){
				if(fun) fun();
				return
			}
			AE.sprites = sprites;
			AE.onLoaded = fun;
			var sound = new Audio();
			sound.preload = 'auto';
			sound.addEventListener('error', AE.loadError, false);
			sound.src = file + AE.format;
			sound.play();
			// SAFE TIMEOUT (JUST IN CASE)
			AE.timeout = setTimeout(function(){AE.loadError({target: sound});}, AE.timeoutDelay);
			// CHECK PROGRESS
			AE.interval = setInterval(function(){
				if(isNaN(sound.duration)) return
				sound.pause();
				if(sound.buffered.end(0) >= sound.duration - .5){
					clearTimeout(AE.timeout);
					clearInterval(AE.interval);
					AE.loaded(sound);
				}
			}, 100);
		}	
		AE.loadError = function(evt){
			clearTimeout(AE.timeout);
			clearInterval(AE.interval);
			var sound = evt.target;
			sound.removeEventListener('error', AE.loaded);
			AE.enabled = false;
			if(AE.onLoaded) AE.onLoaded();
		}
		AE.loaded = function(sound){
			sound.removeEventListener('error', AE.loaded);
			AE.enabled = true;
			AE.sound = sound;
			AE.sound.currentTime = 0.1;
			if(AE.onLoaded) AE.onLoaded();
		}
		AE.play = function(id, fun){
			if(!AE.enabled || !(id in AE.sprites)) {
				if(fun) fun();
				return
			}
			AE.stop();
			AE.sprite = AE.sprites[id];
			AE.onSpriteComplete = fun;
			AE.sound.currentTime = AE.sprite.start - AE.lag;
			AE.sound.play();
			AE.interval = setInterval(function(){
				if (AE.sound.currentTime >= AE.sprite.start + AE.sprite.length) {
					AE.stop();					
        			if(AE.onSpriteComplete) AE.onSpriteComplete();
					AE.onSpriteComplete = undefined;
    			}		
			}, 10);
		}
		AE.stop = function(){
			if(!AE.enabled) return
			clearInterval(AE.interval)
			AE.sound.pause();
		}
		return AE
	}
	
})(document, window);

