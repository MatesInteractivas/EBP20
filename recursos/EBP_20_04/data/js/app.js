
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
	data.characterSelected = 1;
	data.page = 0;
	data.pagesCnt = 8;
	data.act1 = {};
	
	// AUDIO ENGINE
	data.audio = AudioEngine();
	data.audioSprites = {
		btn_01: {start: 0.500, length: 0.366},
		btn_02: {start: 1.400, length: 0.269},
		ui_on: {start: 2.200, length: 0.150},
		drop_wrong: {start: 2.900, length: 0.600},
		drop_ok: {start: 4.000, length: 1.100},
		act_end: {start: 5.600, length: 1.600},
		page_01: {start: 7.700, length: 6.100},
		page_02: {start: 14.300, length: 6.100},
		page_03: {start: 20.900, length: 4.500},
		page_04: {start: 25.900, length: 4.600},
		page_05: {start: 31.000, length: 7.700},
		page_06: {start: 39.200, length: 5.600},
		page_07: {start: 45.300, length: 6.000},
		page_08: {start: 51.800, length: 16.600},
		act_01_end: {start: 68.900, length: 3.600},
		character_01: {start: 73.000, length: 0.800},
		character_02: {start: 74.300, length: 0.700},
		title_01: {start: 75.500, length: 0.600},
		title_02: {start: 76.600, length: 0.800},
		title_03: {start: 77.900, length: 0.800},
		title_04: {start: 79.200, length: 0.600},
		title_05: {start: 80.300, length: 1.400},
		part_01: {start: 82.200, length: 0.700},
		part_02: {start: 83.400, length: 1.000},
		part_03: {start: 84.900, length: 1.100},
		part_04: {start: 86.500, length: 1.000},
		part_05: {start: 88.000, length: 1.100},
		part_06: {start: 89.600, length: 0.700},
		go_home: {start: 90.800, length: 2.100},
		go_info: {start: 93.400, length: 1.000}	
	}

	// IMAGES
	data.imgs = {
		loader : 'data/img/loader' + data.resSuffix + '.json',
		ui : 'data/img/ui' + data.resSuffix + '.json',
		sofia : 'data/img/sofia' + data.resSuffix + '.json',
		santiago : 'data/img/santiago' + data.resSuffix + '.json',
		back0 : 'data/img/0' + data.resSuffix + '.jpg',
		back1 : 'data/img/1' + data.resSuffix + '.jpg',
		back2 : 'data/img/2' + data.resSuffix + '.jpg',
		back3 : 'data/img/3' + data.resSuffix + '.jpg',
		back4 : 'data/img/4' + data.resSuffix + '.jpg',
		back5 : 'data/img/5' + data.resSuffix + '.jpg',
		back6 : 'data/img/6' + data.resSuffix + '.jpg',
		back8 : 'data/img/8' + data.resSuffix + '.jpg',
		info : 'data/img/info' + data.resSuffix + '.jpg'
	}

	// INTERACTIVE TITLES
	
	data.titles = [
		{page: 2, frame: 'title_head.png', pos: new PIXI.Point(Value(493), Value(114)), sound: 'title_01'},
		{page: 3, frame: 'title_arms.png', pos: new PIXI.Point(Value(475), Value(117)), sound: 'title_02'},
		{page: 4, frame: 'title_legs.png', pos: new PIXI.Point(Value(455), Value(104)), sound: 'title_03'},
		{page: 5, frame: 'title_body.png', pos: new PIXI.Point(Value(476), Value(92)), sound: 'title_04'},
		{page: 6, frame: 'title_characters.png', pos: new PIXI.Point(Value(506), Value(48)), sound: 'title_05'}
	];
	
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
		// FUCKING AUDIO PARALLE CHECK
	}
	
	function loadImages(){
		var assetLoader = new PIXI.AssetLoader([
			data.imgs.ui,
			data.imgs.sofia,
			data.imgs.santiago,
			data.imgs.back1,
			data.imgs.back2,
			data.imgs.back3,
			data.imgs.back4,
			data.imgs.back5,
			data.imgs.back6,
			data.imgs.back8,
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
		var menuButtonYOffset = Value(22);
		TweenMax.to(data.home.position, 1, {y: -menuButtonYOffset, ease: Bounce.easeOut});
		TweenMax.to(data.voice.position, 1, {y: -menuButtonYOffset, delay: .3, ease: Bounce.easeOut});
		TweenMax.to(data.info.position, 1, {y: -menuButtonYOffset, delay: .6, ease: Bounce.easeOut, onComplete: function(){
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
			case 3:
			case 4:
			case 5:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				createSprites('next button');
				createTitle();
				speech();
				break
			case 6:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				createSprites('next button');
				createSprites('character selection');
				createTitle();
				var char = data.characterSelected
				data.characterSelected = 0;
				selectCharacter(char)	
				speech();
				break
			case 7:
				act1(data.characterSelected || 1)
				speech();
				break
			case 8:
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
		if(data.page >= 1 && data.page <= 8 && data.page != 7) btns.push(data.content.getChildAt(1));
		if(data.page == 6) {
			btns.push(data.content.getChildAt(6)); 
			btns.push(data.content.getChildAt(7));
		}
		if(data.page == 7 && data.act1.ended) btns.push(data.content.getChildAt(data.content.children.length - 1));
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
		var sound = data.page == 7 && data.act1.ended ? 'act_01_end' : 'page_0' + data.page;
		data.audio.play(sound, function(){
			disabledUI(false);
			if(fun) fun();
		});
	}
	
	function createTitle(){
		var title = undefined;
		for(var i = 0; i < data.titles.length; i++){
			if(data.page == data.titles[i].page){
				title = data.titles[i];
				break;
			}
		}
		if(title == undefined) return
		var sprite = PIXI.Sprite.fromFrame(title.frame);
		sprite.anchor.x = sprite.anchor.y = .5; 
		sprite.position = title.pos;
		sprite.rotation = -DegToRad(2)
		sprite.interactive = true;
		sprite.mousedown = sprite.touchstart = function(evt){
			cancelEvent(evt);
			if(data.cancelButtons) return
			data.cancelButtons = true;
			TweenMax.to(sprite.scale, .15, {x: 1.2, y: 1.2, ease: Power1.easeInOut, repeat: 1, yoyo:true});
			data.audio.play(title.sound, function(){
				data.cancelButtons = false;
			});
		}
		TweenMax.to(sprite, .25, {rotation: DegToRad(2), ease: Power1.easeInOut, repeat: -1, yoyo:true});					
		data.content.addChild(sprite);
	}
	
	function selectCharacter(id){
		if(id == data.characterSelected) return
		data.cancelButtons = true;
		var highlight1 = data.content.getChildAt(2);
		var highlight2 = data.content.getChildAt(3);
		var radio1 = data.content.getChildAt(4);
		var radio2 = data.content.getChildAt(5);
		highlight1.visible = false;
		highlight2.visible = false;
		radio1.selected(false);
		radio2.selected(false);		
		switch(id){
			case 1:
				data.characterSelected = id;
				highlight1.visible = true;
				radio1.selected(true);	
				data.cancelButtons = false;
				break
			case 2:
				data.characterSelected = id;
				highlight2.visible = true;
				radio2.selected(true);
				data.cancelButtons = false
				break
		}
	}

	function act1(characterID){
		var sprites = [];
		var elements = [];
		switch(characterID){
			case 1:
				elements.push({img: 'santiago_cutout.png', startPos: new PIXI.Point(Value(469),Value(-655)), targetPos: new PIXI.Point(Value(469),0)});
				elements.push({img: 'santiago_full.png', startPos: new PIXI.Point(Value(531),Value(13)), targetPos: new PIXI.Point(0,0)});
				elements.push({img: 'santiago_head.png', startPos: new PIXI.Point(Value(89), Value(404)), targetPos: new PIXI.Point(Value(582), Value(11)), sound: 'part_01'});
				elements.push({img: 'santiago_arm_right.png', startPos: new PIXI.Point(Value(276), Value(311)), targetPos: new PIXI.Point(Value(529), Value(265)), sound: 'part_02'});
				elements.push({img: 'santiago_arm_left.png', startPos: new PIXI.Point(Value(30), Value(111)), targetPos: new PIXI.Point(Value(758), Value(264)), sound: 'part_03'});
				elements.push({img: 'santiago_leg_right.png', startPos: new PIXI.Point(Value(43), Value(202)), targetPos: new PIXI.Point(Value(678), Value(432)), sound: 'part_04'});
				elements.push({img: 'santiago_leg_left.png', startPos: new PIXI.Point(Value(339), Value(111)), targetPos: new PIXI.Point(Value(745), Value(432)), sound: 'part_05'});
				elements.push({img: 'santiago_body.png', startPos: new PIXI.Point(Value(133), Value(199)), targetPos: new PIXI.Point(Value(675), Value(254)), sound: 'part_06'});
				break
			case 2:
				elements.push({img: 'sofia_cutout.png', startPos: new PIXI.Point(Value(469),Value(-655)), targetPos: new PIXI.Point(Value(469),0)});
				elements.push({img: 'sofia_full.png', startPos: new PIXI.Point(Value(532),Value(16)), targetPos: new PIXI.Point(0,0)});
				elements.push({img: 'sofia_head.png', startPos: new PIXI.Point(Value(69), Value(397)), targetPos: new PIXI.Point(Value(568), Value(16)), sound: 'part_01'});
				elements.push({img: 'sofia_arm_right.png', startPos: new PIXI.Point(Value(275), Value(311)), targetPos: new PIXI.Point(Value(530), Value(272)), sound: 'part_02'});
				elements.push({img: 'sofia_arm_left.png', startPos: new PIXI.Point(Value(34), Value(103)), targetPos: new PIXI.Point(Value(755), Value(270)), sound: 'part_03'});
				elements.push({img: 'sofia_leg_right.png', startPos: new PIXI.Point(Value(40), Value(205)), targetPos: new PIXI.Point(Value(682), Value(438)), sound: 'part_04'});
				elements.push({img: 'sofia_leg_left.png', startPos: new PIXI.Point(Value(319), Value(111)), targetPos: new PIXI.Point(Value(739), Value(438)), sound: 'part_05'});	
				elements.push({img: 'sofia_body.png', startPos: new PIXI.Point(Value(135), Value(201)), targetPos: new PIXI.Point(Value(677), Value(262)), sound: 'part_06'});		
				break
		}
		for(var i = 0; i < elements.length; i++){
			var element = elements[i];			
			var sprite = PIXI.Sprite.fromFrame(element.img);
			var midWidth = Round(sprite.width * .5);
			var midHeight = Round(sprite.height * .5)
			sprite.startPos = new PIXI.Point(element.startPos.x + midWidth, element.startPos.y + midHeight);
			sprite.targetPos = new PIXI.Point(element.targetPos.x + midWidth, element.targetPos.y + midHeight);
			if(i > 1){
				sprite.interactive = true;
				sprite.container = data.content
				sprite.dropTarget = new PIXI.Rectangle(element.targetPos.x, element.targetPos.y, sprite.width, sprite.height);
				sprite.onPlace = false;
				sprite.sound = element.sound;
				sprite.mousedown = sprite.touchstart = function(evt){
					cancelEvent(evt);
					if(data.cancelButtons) return
					if(this.onPlace) return
					data.cancelButtons = true
					this.container.removeChild(this)
					this.container.addChild(this)
					data.audio.play(this.sound);
					this.evt = evt;
					this.dragging = true;
					this.scale.x = this.scale.y = .5;
					TweenMax.to(this.scale, .2, {x: 1, y: 1, ease: Back.easeOut})
					var newPosition = this.evt.getLocalPosition(this.parent);
					this.position.x = newPosition.x;
					this.position.y = newPosition.y;
				}
				sprite.mouseup = sprite.mouseupoutside = sprite.touchend = sprite.touchendoutside = function(evt){
					cancelEvent(evt);
					if(!this.dragging) return
					if(this.onPlace) return
					this.dragging = false;
					this.evt = null;
					if((this.position.x >= this.dropTarget.x && this.position.x <= this.dropTarget.x + this.dropTarget.width) && (this.position.y >= this.dropTarget.y && this.position.y <= this.dropTarget.y + this.dropTarget.height)){						
						this.onPlace = true;
						data.audio.play('drop_ok');						
						this.scale.x = this.scale.y = .5;
						TweenMax.to(this.position, .2, {x: this.targetPos.x, y: this.targetPos.y, ease: Power1.easeInOut});
						TweenMax.to(this.scale, .4, {x: 1, y: 1, ease: Bounce.easeOut, onComplete: function(){
							data.cancelButtons = false;
							checkAct1End();
						}})	
					}else{
						data.audio.play('drop_wrong');	
						TweenMax.to(this.position, .4, {x: this.startPos.x, y: this.startPos.y, ease: Back.easeOut, onComplete: function(){
							data.cancelButtons = false;	
						}});
					}
				}
				sprite.mousemove = sprite.touchmove = function(evt){
					cancelEvent(evt);
					if(this.dragging){
						var newPosition = this.evt.getLocalPosition(this.parent);
						this.position.x = newPosition.x;
						this.position.y = newPosition.y;
					}
				}
				sprites.push(sprite);
			}	
			sprite.anchor.x = sprite.anchor.y = 0.5;
			sprite.position = sprite.startPos.clone();
			data.content.addChild(sprite);
		}
		data.act1.cnt = 0;
		data.act1.spritesCnt = sprites.length;
		data.act1.sprites = sprites;
		data.act1.ended = false;
		var full = data.content.getChildAt(1);
		full.visible = false;
		var back = data.content.getChildAt(0);
		TweenMax.to(back.position, 1, {y: Round(back.height * .5), ease: Bounce.easeOut});
	}

	function checkAct1End(){
		data.act1.cnt++
		if(data.act1.cnt < data.act1.spritesCnt) return
		disabledUI(true);
		data.audio.play('act_end');
		setTimeout(function(){data.act1.ended = true;}, 800);
		for(var i = data.act1.spritesCnt - 1; i >= 0; i--){
			data.content.removeChild(data.act1.sprites[i]);
		}
		var full = data.content.getChildAt(1);
		full.visible = true
		var back = data.content.getChildAt(0);
		TweenMax.to(back.position, 1, {y: - Round(back.height * .5), ease: Power1.easeIn, onComplete: function(){
			TweenMax.to(full.position, 1, {x: Round(data.width * .5), ease: Back.easeInOut, onComplete: function(){
				data.audio.play('act_01_end', function(){
					createSprites('next button');
					disabledUI(false);
				});
			}});
		}});
	}

	function showModal(modal, bool, fun){
		if(bool){
			if(modal == data.infoModal){
				var button = data.infoModal.getChildAt(1);
				button.scale.x = button.scale.y = 1;
				TweenMax.to(button.scale, .5, {x: 1.2, y: 1.2, ease: Power1.easeInOut, repeat: -1, yoyo:true});
			}
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
			if (fun !== undefined) fun();
		}
	}

	function removeChildren(container){
		var cnt = container.children.length;
		for(var i = cnt - 1; i >= 0; i--){
			container.removeChild(container.getChildAt(i));
		}
	}
	
	function createSprites(type){
		switch(type){
			case 'menu buttons':
				data.home = createSprite('regular', {
					parent: data.app,
					back: 'home.png',
					ancX: .5,
					ancY: 0,
					posX: Value(22 + 36),
					posY: - Value(249),
					sound: 'btn_01',
					callback: function(){
						TweenMax.to(data.home.scale, .1, {x: 1.2, ease: Power1.easeInOut, repeat: 1, yoyo:true});
						TweenMax.to(data.home.position, .2, {y: 0, ease: Power1.easeOut, repeat: 1, yoyo:true, onComplete: function(){
							showModal(data.homeModal, true);
						}});
					}
				});
				data.voice = createSprite('regular', {
					parent: data.app,
					back: 'voice.png',
					ancX: .5,
					ancY: 0,
					posX: Value(22 + 36 + 36 + 22 + 36),
					posY: - Value(249),
					sound: 'btn_01',
					callback: function(){
						TweenMax.to(data.voice.scale, .1, {x: 1.2, ease: Power1.easeInOut, repeat: 1, yoyo:true});
						TweenMax.to(data.voice.position, .2, {y: 0, ease: Power1.easeOut, repeat: 1, yoyo:true, onComplete: function(){
							speech();
						}});
					}
				});
				data.info = createSprite('regular', {
					parent: data.app,
					back: 'info.png',
					ancX: .5,
					ancY: 0,
					posX: data.width - Value(22 + 36),
					posY: - Value(249),
					sound: 'btn_01',
					callback: function(){
						TweenMax.to(data.info.scale, .1, {x: 1.2, ease: Power1.easeInOut, repeat: 1, yoyo:true});
						TweenMax.to(data.info.position, .2, {y: 0, ease: Power1.easeOut, repeat: 1, yoyo:true, onComplete: function(){
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
					halo: true,
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
					callback: function(){setPage(6)},
					tween: {target: 'scale', time: .5, props: {x: 1.2, y: 1.2, ease: Power1.easeInOut, repeat: -1, yoyo:true}}
				})
				break
			case 'character selection':
				createSprite('highlight', {
					parent: data.content,
					back: 'santiago_highlight.png',
					ancX: .5,
					ancY: .5,
					posX: Value(310),
					posY: Value(329),
					visible: false
				});
				createSprite('highlight', {
					parent: data.content,
					back: 'sofia_highlight.png',
					ancX: .5,
					ancY: .5,
					posX: Value(713),
					posY: Value(329),
					visible: false
				});
				createSprite('radio', {
					parent: data.content,
					back: 'radio_back.png',
					check: 'radio_check.png',
					ancX: .5,
					ancY: .5,
					posX: Value(300),
					posY: Value(600)
				});
				createSprite('radio', {
					parent: data.content,
					back: 'radio_back.png',
					check: 'radio_check.png',
					ancX: .5,
					ancY: .5,
					posX: data.width - Value(310),
					posY: Value(600)
				});
				createSprite('hotspot', {
					parent: data.content,
					width: Value(310),
					height: Value(530),
					posX: Value(150),
					posY: Value(120),
					sound: 'character_01',
					callback: function(){selectCharacter(1)}
				});
				createSprite('hotspot', {
					parent: data.content,
					width: Value(310),
					height: Value(530),
					posX: Value(560),
					posY: Value(120),
					sound: 'character_02',
					callback: function(){selectCharacter(2)}
				});
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
					posY: Value(380),
					sound: 'btn_02',
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
					posY: Value(380),
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
				infoModalBack.setInteractive(true)
				infoModalBack.mousedown = infoModalBack.touchstart = cancelEvent;
				data.infoModal.addChild(infoModalBack);	
				createSprite('regular', {
					parent: data.infoModal,
					back: 'info_cancel.png',
					ancX: .5,
					ancY: .5,
					posX: data.width -  Value(44 + 22),
					posY: Value(44 + 22),
					sound: 'btn_02',
					callback: function(){
						var obj = data.infoModal.getChildAt(1);
						TweenMax.to(obj.scale, .1, {x: 1.5, y: 1.5, ease: Power1.easeInOut, repeat: 1, yoyo:true, onComplete: function(){
							showModal(data.infoModal, false)
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
				button.alpha = props.alpha || 1;
				button.visible = props.visible || true;
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
			case 'radio':
				var button = PIXI.Sprite.fromFrame(props.back);
				button.anchor.x = props.ancX || 0; 
				button.anchor.y = props.ancY || 0;
				button.position.x = props.posX || 0;
				button.position.y = props.posY || 0;
				button.scale.x = props.scaX || 1;
				button.scale.y = props.scaY || 1;
				button.alpha = props.alpha || 1;
				button.visible = props.visible || true;				
				var checkmark = PIXI.Sprite.fromFrame(props.check);
				checkmark.anchor.x = checkmark.anchor.y = .5;
				checkmark.position.x = Round((button.width - checkmark.width) * .5) + Value(10);
				checkmark.position.y = Round((button.height - checkmark.height) * .5) + Value(-10);
				checkmark.visible = false;
				button.addChild(checkmark);
				button.checkmark = checkmark;
				button.selected = function(bool){
					if(bool){
						this.checkmark.scale.x = this.checkmark.scale.y = .01
						this.checkmark.visible = true;
						TweenMax.to(this.checkmark.scale, .5, {x: 1.0, y: 1.0, ease: Bounce.easeOut});
					}else{
						this.checkmark.visible = false;
					}
				}
				props.parent.addChild(button);
				return button
				break
			case 'hotspot':
				var button = new PIXI.Graphics();
				button.position.x = props.posX || 0;
				button.position.y = props.posY || 0;
				button.interactive = props.interactive || true;
				button.buttonMode = props.buttonMode || true;
				button.beginFill(0xFF0000, 0);
				button.drawRect(0, 0, props.width, props.height);
				button.endFill();
				button.hitArea = new PIXI.Rectangle(0, 0, props.width, props.height);	
				button.mousedown = button.touchstart = function(evt){
					cancelEvent(evt);
					data.cancelButtons = true
					if(props.sound) data.audio.play(props.sound);
					if(props.callback) props.callback();
				}
				props.parent.addChild(button);
				return button
				break
			case 'highlight':
				var button = PIXI.Sprite.fromFrame(props.back);
				button.anchor.x = props.ancX || 0; 
				button.anchor.y = props.ancY || 0;
				button.position.x = props.posX || 0;
				button.position.y = props.posY || 0;
				button.scale.x = props.scaX || 1;
				button.scale.y = props.scaY || 1;
				button.alpha = props.alpha || 1;
				button.visible = props.visible || true;
				props.parent.addChild(button);
				return button
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
		requestAnimationFrame(update)
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
		var newTex = new PIXI.Texture(newBaseTex, new PIXI.Rectangle(0,0,frame.width,frame.height))
		PIXI.Texture.addTextureToCache(newTex, newID)
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
		type.Any = type.Android || type.BlackBerry || type.iOS || type.iOS || type.Opera || type.Windows;
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

