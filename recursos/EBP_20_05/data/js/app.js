
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
	data.pagesCnt = 8;
	data.act1 = {};
	
	// AUDIO ENGINE
	data.audio = AudioEngine();
	data.audioSprites = {
		btn_1: {start: 0.500, length: 0.366},
		btn_2: {start: 1.400, length: 0.269},
		ui_on: {start: 2.200, length: 0.150},
		drop_wrong: {start: 2.900, length: 0.600},
		drop_ok: {start: 4.000, length: 1.100},
		drag_pop: {start: 5.600, length: 0.300},
		chime: {start: 6.400, length: 1.600},
		page_1: {start: 8.500, length: 5.600},
		page_2: {start: 14.600, length: 8.100},
		page_3: {start: 23.200, length: 10.300},
		page_4: {start: 34.000, length: 9.100},
		page_5: {start: 43.600, length: 11.500},
		page_6: {start: 55.600, length: 4.700},
		page_7: {start: 60.800, length: 5.800},
		page_8: {start: 67.100, length: 9.200},
		act_1_end: {start: 76.800, length: 4.600},
		title_1: {start: 81.900, length: 0.700},
		title_2: {start: 83.100, length: 0.600},
		title_3: {start: 84.200, length: 0.700},
		title_4: {start: 85.400, length: 0.900},
		example_1_1: {start: 86.800, length: 0.600},
		example_1_2: {start: 87.900, length: 1.100},
		example_1_3: {start: 89.500, length: 1.500},
		example_2_1: {start: 91.500, length: 1.100},
		example_2_2: {start: 93.100, length: 1.100},
		example_2_3: {start: 94.700, length: 0.700},
		example_3_1: {start: 95.900, length: 0.800},
		example_3_2: {start: 97.200, length: 1.500},
		example_3_3: {start: 99.200, length: 1.200},
		example_4_1: {start: 100.900, length: 1.500},
		example_4_2: {start: 102.900, length: 1.100},
		example_4_3: {start: 104.500, length: 0.900},
		character_1: {start: 105.900, length: 0.700},
		character_2: {start: 107.100, length: 0.800},
		character_3: {start: 108.400, length: 0.800},
		character_4: {start: 109.700, length: 1.100},
		puzzle_1_start: {start: 111.300, length: 1.800},
		puzzle_1_end: {start: 113.600, length: 1.200},
		puzzle_2_start: {start: 115.200, length: 1.600},
		puzzle_2_end: {start: 117.300, length: 1.300},
		puzzle_3_start: {start: 119.100, length: 1.800},
		puzzle_3_end: {start: 121.400, length: 1.400},
		puzzle_4_start: {start: 123.300, length: 2.000},
		puzzle_4_end: {start: 125.800, length: 1.300},
		go_home: {start: 127.600, length: 2.100},
		go_info: {start: 130.200, length: 0.900}
	}

	// IMAGES
	data.imgs = {
		loader : 'data/img/loader' + data.resSuffix + '.json',
		ui : 'data/img/ui' + data.resSuffix + '.json',
		circle : 'data/img/circle' + data.resSuffix + '.json',
		square : 'data/img/square' + data.resSuffix + '.json',
		triangle : 'data/img/triangle' + data.resSuffix + '.json',
		rectangle : 'data/img/rectangle' + data.resSuffix + '.json',
		back0 : 'data/img/0' + data.resSuffix + '.jpg',
		back1 : 'data/img/1' + data.resSuffix + '.jpg',
		back8 : 'data/img/8' + data.resSuffix + '.jpg',
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
			data.imgs.ui,
			data.imgs.circle,
			data.imgs.square,
			data.imgs.triangle,
			data.imgs.rectangle,
			data.imgs.back1,
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
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back1']));
				createSprites('play button');
				speech();
				break
			case 2:
			case 3:
			case 4:
			case 5:
				createShape();
				createSprites('next button');
				speech();
				break
			case 6:
				startAct1();
				createSprites('next button');	
				speech();
				break
			case 7:
				act1();
				break
			case 8:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back8']));
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
		if(data.page >= 1 && data.page <= 8 && data.page != 7) btns.push(data.content.getChildAt(data.content.children.length - 1));
		if(data.page == 7 && (data.act1.ended || data.act1.puzzleEnd)) btns.push(data.content.getChildAt(data.content.children.length - 1));
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
	
	function speech(sprite, fun){
		disabledUI(true);
		if(sprite){
			var sound = sprite;
		}else{
			var sound = data.page == 7 && data.act1.ended ? 'act_1_end' : 'page_' + data.page;
		}
		data.audio.play(sound, function(){
			disabledUI(false);
			if(fun) fun();
		});
	}
	
	function createShape(){
		if(data.page < 2 || data.page > 5) return
		// MAIN SHAPE
		var shape = PIXI.Sprite.fromFrame((data.page - 1) + '_full.png');
		shape.anchor.x = shape.anchor.y = .5;
		shape.position.x = - Round(data.width * .5);
		shape.position.y = Value(310);
		data.content.addChild(shape);
		TweenMax.to(shape.position, 1, {x: Value(310), ease: Back.easeOut});
		// TITLE
		var title = createTitle({frame: (data.page -1) + '_title.png', pos: new PIXI.Point(Value(310), data.height + Value(40)), sound: 'title_' + (data.page -1)});
		TweenMax.to(title.position, .5, {y: Value(590), ease: Power1.easeOut});
		// EXAMPLES
		var back = PIXI.Sprite.fromFrame('examples_back.png');
		back.position.x = Value(600);
		back.position.y = data.width;
		data.content.addChild(back);
		TweenMax.to(back.position, .5, {y: 0, ease: Power1.easeOut});
		var examplePosX = Value(755);
		var exampleStartPosY = Value(125);
		var exampleGapY = Value(220);
		for(var i = 0; i < 3; i++){
			var sprite = PIXI.Sprite.fromFrame((data.page - 1) + '_example_' + (i + 1) + '.png');
			sprite.anchor.x = sprite.anchor.y = .5;
			sprite.position.x = examplePosX;
			sprite.position.y = exampleStartPosY + (exampleGapY * i);
			sprite.alpha = 0;
			sprite.scale.x = 0.1;
			sprite.scale.y = 0.1;
			sprite.interactive = true;
			sprite.sound = 'example_' + (data.page -1) + '_' + (i + 1);
			sprite.mousedown = sprite.touchstart = function(evt){
				cancelEvent(evt);
				if(data.cancelButtons) return
				data.cancelButtons = true;
				TweenMax.to(this.scale, .15, {x: 1.2, y: 1.2, ease: Power1.easeInOut, repeat: 1, yoyo:true});
				data.audio.play(this.sound, function(){
					data.cancelButtons = false;
				});
			}
			data.content.addChild(sprite);
			TweenMax.to(sprite.scale, .5, {x: 1.0, y: 1.0, ease: Bounce.easeOut, delay: .5 + (.25 * i)});
			TweenMax.to(sprite, .5, {alpha: 1.0, ease: Power0.easeInOut, delay: .5 + (.25 * i)});
		}
	}
	
	function createTitle(title){
		var sprite = PIXI.Sprite.fromFrame(title.frame);
		sprite.anchor.x = sprite.anchor.y = .5; 
		sprite.position = title.pos;
		sprite.rotation = -DegToRad(2);
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
		sprite.tween = TweenMax.to(sprite, .25, {rotation: DegToRad(2), ease: Power1.easeInOut, repeat: -1, yoyo:true});					
		data.content.addChild(sprite);
		return sprite;
	}
	
	function startAct1(){
		data.act1.shapesOrder = ShuffleArray([1,2,3,4]);
		data.act1.shapesOrderCurrent = 0;
		data.act1.shapesCnt = data.act1.shapesOrder.length;
		data.act1.ended = false;
		var posX = Round(data.width / (data.act1.shapesCnt + 1));
		var shapesContainer = new PIXI.DisplayObjectContainer();
		shapesContainer.position.x = data.width;
		shapesContainer.position.y = Value(300);
		for(var i = data.act1.shapesCnt - 1; i >= 0; i--){
			var shapeID = data.act1.shapesOrder[i];
			var shape = PIXI.Sprite.fromFrame(shapeID + '_full.png');
			shape.anchor.x = shape.anchor.y = .5;
			shape.scale.x = shape.scale.y = .6;
			shape.rotation = - DegToRad(4);
			shape.position.x = posX * (i + 1);
			shape.sound = 'character_' + shapeID;
			shape.interactive = true;
			shape.mousedown = shape.touchstart = function(evt){
				cancelEvent(evt);
				if(data.cancelButtons) return
					data.cancelButtons = true;
					TweenMax.to(this.scale, .15, {x: .8, y: .8, ease: Power1.easeInOut, repeat: 1, yoyo:true});
					data.audio.play(this.sound, function(){
					data.cancelButtons = false;
				});
			}
			shapesContainer.addChild(shape);
			TweenMax.to(shape, .4, {rotation: DegToRad(4), ease: Power1.easeInOut, repeat: -1, yoyo:true});
			var tween = TweenMax.to(shape.position, .4, {y: Value(30), ease: Power1.easeInOut, repeat: -1, yoyo:true});
			tween.seek((i + 1) * .1);
		}
		data.content.addChild(shapesContainer);
		TweenMax.to(shapesContainer.position, 1, {x: 0, ease: Power1.easeOut})
	}

	function act1(){
		data.act1.shapesOrder = data.act1.shapesOrder || [1,2,3,4];
		data.act1.shapesOrderCurrent = data.act1.shapesOrderCurrent || 0;
		data.act1.shapesCnt = data.act1.shapesCnt || data.act1.shapesOrder.length;
		removeChildren(data.content);
		TweenMax.killAll();
		var shapeID = data.act1.shapesOrder[data.act1.shapesOrderCurrent];
		data.act1.shapesOrderCurrent++;
		var sprites = [];
		var parts = [];
		switch(shapeID){
			case 1:
				parts.push({img: '1_part_1.png', startPos: new PIXI.Point(Value(242), Value(289)), targetPos: new PIXI.Point(Value(538), Value(130))});
				parts.push({img: '1_part_2.png', startPos: new PIXI.Point(Value(20), Value(142)), targetPos: new PIXI.Point(Value(742), Value(130))});
				parts.push({img: '1_part_3.png', startPos: new PIXI.Point(Value(20), Value(412)), targetPos: new PIXI.Point(Value(538), Value(333))});
				parts.push({img: '1_part_4.png', startPos: new PIXI.Point(Value(242), Value(72)), targetPos: new PIXI.Point(Value(742), Value(333))});
				break
			case 2:
				parts.push({img: '2_part_1.png', startPos: new PIXI.Point(Value(20), Value(412)), targetPos: new PIXI.Point(Value(546), Value(138))});
				parts.push({img: '2_part_2.png', startPos: new PIXI.Point(Value(20), Value(177)), targetPos: new PIXI.Point(Value(742), Value(138))});
				parts.push({img: '2_part_3.png', startPos: new PIXI.Point(Value(246), Value(307)), targetPos: new PIXI.Point(Value(546), Value(333))});
				parts.push({img: '2_part_4.png', startPos: new PIXI.Point(Value(246), Value(72)), targetPos: new PIXI.Point(Value(742), Value(333))});	
				break
			case 3:
				parts.push({img: '3_part_1.png', startPos: new PIXI.Point(Value(20), Value(403)), targetPos: new PIXI.Point(Value(625), Value(130))});
				parts.push({img: '3_part_2.png', startPos: new PIXI.Point(Value(208), Value(254)), targetPos: new PIXI.Point(Value(508), Value(333))});
				parts.push({img: '3_part_3.png', startPos: new PIXI.Point(Value(20), Value(110)), targetPos: new PIXI.Point(Value(742), Value(333))});	
				break
			case 4:
				parts.push({img: '4_part_1.png', startPos: new PIXI.Point(Value(211), Value(72)), targetPos: new PIXI.Point(Value(507), Value(216))});
				parts.push({img: '4_part_2.png', startPos: new PIXI.Point(Value(20), Value(497)), targetPos: new PIXI.Point(Value(742), Value(216))});
				parts.push({img: '4_part_3.png', startPos: new PIXI.Point(Value(20), Value(214)), targetPos: new PIXI.Point(Value(507), Value(334))});
				parts.push({img: '4_part_4.png', startPos: new PIXI.Point(Value(211), Value(355)), targetPos: new PIXI.Point(Value(742), Value(334))});	
				break
		}		
		var back = PIXI.Sprite.fromFrame('puzzle_back.png');
		back.position.x = data.width;
		back.position.y = Value(67);
		var cutout = PIXI.Sprite.fromFrame(shapeID + '_cutout.png');
		cutout.anchor.x = cutout.anchor.y = .5;
		cutout.position.x = Value(744 - 464);
		cutout.position.y = Value(335 - 67);
		back.addChild(cutout);
		data.content.addChild(back);
		var full = PIXI.Sprite.fromFrame(shapeID + '_full.png');
		full.anchor.x = full.anchor.y = .5;
		full.position.x = Value(744);
		full.position.y = Value(335);
		full.visible = false;
		data.content.addChild(full);
		for(var i = 0; i < parts.length; i++){
			var part = parts[i];			
			var sprite = PIXI.Sprite.fromFrame(part.img);
			var midWidth = Round(sprite.width * .5);
			var midHeight = Round(sprite.height * .5)
			sprite.startPos = new PIXI.Point(part.startPos.x + midWidth, part.startPos.y + midHeight);
			sprite.targetPos = new PIXI.Point(part.targetPos.x + midWidth, part.targetPos.y + midHeight);
			sprite.interactive = true;
			sprite.container = data.content
			sprite.dropTarget = new PIXI.Rectangle(part.targetPos.x, part.targetPos.y, sprite.width, sprite.height);
			sprite.onPlace = false;
			sprite.mousedown = sprite.touchstart = function(evt){
				cancelEvent(evt);
				if(data.cancelButtons) return
				if(this.onPlace) return
				data.cancelButtons = true
				this.container.removeChild(this)
				this.container.addChild(this)
				data.audio.play('drag_pop');	
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
						checkAct1PuzzleEnd();
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
			sprite.anchor.x = sprite.anchor.y = 0.5;
			sprite.scale.x = sprite.scale.y = .1;
			sprite.alpha = 0;
			sprite.position = sprite.startPos.clone();
			data.content.addChild(sprite);
			sprites.push(sprite);
			TweenMax.to(sprite.scale, .5, {x: 1.0, y: 1.0, ease: Bounce.easeOut, delay: .5 + (.25 * i)});
			TweenMax.to(sprite, .5, {alpha: 1.0, ease: Power0.easeInOut, delay: .5 + (.25 * i)});
		}
		data.act1.partsCurrent = 0;
		data.act1.partsCnt = sprites.length;
		data.act1.parts = sprites;
		data.act1.puzzleEnd = false;
		TweenMax.to(back.position, 1, {x: data.width - back.width, ease: Bounce.easeOut});
		var title = createTitle({frame: shapeID + '_title.png', pos: new PIXI.Point(Value(744), data.height + Value(40)), sound: 'title_' + shapeID});
		title.tween.kill();
		title.rotation = 0;
		TweenMax.to(title.position, .5, {y: Value(607), ease: Power1.easeOut});
		if(data.act1.shapesOrderCurrent == 1){
			speech('page_7');
		}else{
			speech('puzzle_' + shapeID + '_start');
		};
	}

	function checkAct1PuzzleEnd(){
		var shapeID = data.act1.shapesOrder[data.act1.shapesOrderCurrent - 1];
		data.act1.partsCurrent++;
		if(data.act1.partsCurrent < data.act1.partsCnt) return
		disabledUI(true);
		data.audio.play('puzzle_end');
		for(var i = 0; i < data.act1.partsCnt; i++){
			data.content.removeChild(data.act1.parts[i]);
		}
		var full = data.content.getChildAt(1);
		full.visible = true;
		var back = data.content.getChildAt(0);
		var title = data.content.getChildAt(data.content.children.length - 1);
		TweenMax.to(title.position, .5, {y: data.height + Value(40), ease: Power1.easeIn});
		TweenMax.to(back.position, 1, {x: data.width, ease: Power1.easeIn, onComplete: function(){
			TweenMax.to(full, .2, {rotation: -DegToRad(4), ease: Power1.easeInOut, onComplete: function(){
				TweenMax.to(full, .4, {rotation: DegToRad(4), ease: Power1.easeInOut, repeat: -1, yoyo:true});
			}});
			TweenMax.to(full.position, 1, {x: Round(data.width * .5), ease: Back.easeInOut, onComplete: function(){
				if(data.act1.shapesOrderCurrent < data.act1.shapesCnt){
					data.audio.play('puzzle_' + shapeID + '_end', function(){
						createSprites('next shape button');
						disabledUI(false);
						data.act1.puzzleEnd = true;
					});
				}else{
					data.audio.play('act_1_end', function(){
						createSprites('next button');
						disabledUI(false);
						data.act1.ended = true;
					});					
				};
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
					sound: 'btn_1',
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
					sound: 'btn_1',
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
					sound: 'btn_1',
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
			case 'next shape button':
				createSprite('regular', {
					parent: data.content,
					back: 'next.png',
					ancX: .5,
					ancY: .5,
					posX: Value(944),
					posY: Value(600),
					halo: true,
					callback: function(){act1();},
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
					sound: 'btn_2',
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

