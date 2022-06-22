
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
	data.pagesCnt = 10;
	data.act1 = {};

	
	// AUDIO ENGINE
	data.audio = AudioEngine();
	data.audioSprites = {
		btn_1: {start: 0.500, length: 0.366},
		btn_2: {start: 1.400, length: 0.269},
		ui_on: {start: 2.200, length: 0.150},
		chime: {start: 2.900, length: 1.600},
		page_1: {start: 5.000, length: 10.300},
		page_2: {start: 15.800, length: 19.300},
		page_3: {start: 35.600, length: 8.100},
		page_4: {start: 44.200, length: 10.500},
		page_5: {start: 55.200, length: 6.300},
		page_6: {start: 62.000, length: 9.600},
		page_7: {start: 72.100, length: 7.100},
		page_8: {start: 79.700, length: 5.300},
		page_9: {start: 85.500, length: 17.901},
		page_10: {start: 103.900, length: 24.400},
		title_1: {start: 128.800, length: 1.400},
		title_2: {start: 130.700, length: 1.500},
		title_3: {start: 132.700, length: 1.400},
		title_4: {start: 134.600, length: 1.800},
		title_5: {start: 136.900, length: 1.800},
		title_6: {start: 139.200, length: 1.400},
		title_7: {start: 141.100, length: 1.700},
		act_1_feedback_1: {start: 143.300, length: 4.600},
		act_1_feedback_2: {start: 148.400, length: 4.100},
		act_1_feedback_3: {start: 153.000, length: 4.100},
		go_home: {start: 157.600, length: 1.900},
		go_info: {start: 160.000, length: 1.000}
	};

	// IMAGES
	data.imgs = {
		loader : 'data/img/loader' + data.resSuffix + '.json',
		sprites1 : 'data/img/sprites1' + data.resSuffix + '.json',
		sprites2 : 'data/img/sprites2' + data.resSuffix + '.json',
		sprites3 : 'data/img/sprites3' + data.resSuffix + '.json',
		back0 : 'data/img/0' + data.resSuffix + '.jpg',
		back1 : 'data/img/1' + data.resSuffix + '.jpg',
		back2 : 'data/img/2' + data.resSuffix + '.jpg',
		back3 : 'data/img/3' + data.resSuffix + '.jpg',
		back4 : 'data/img/4' + data.resSuffix + '.jpg',
		back5 : 'data/img/5' + data.resSuffix + '.jpg',
		back6 : 'data/img/6' + data.resSuffix + '.jpg',
		back7 : 'data/img/7' + data.resSuffix + '.jpg',
		back8 : 'data/img/8' + data.resSuffix + '.jpg',
		back9 : 'data/img/9' + data.resSuffix + '.jpg',
		back10 : 'data/img/10' + data.resSuffix + '.jpg',
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
			data.imgs.sprites3,
			data.imgs.back1,
			data.imgs.back2,
			data.imgs.back3,
			data.imgs.back4,
			data.imgs.back5,
			data.imgs.back6,
			data.imgs.back7,
			data.imgs.back8,
			data.imgs.back9,
			data.imgs.back10,
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
		TweenMax.to(data.home.scale, .5, {x: 1, y: 1, ease: Bounce.easeOut});
		TweenMax.to(data.home, .5, {alpha: 1, ease: Power1.easeInOut});
		TweenMax.to(data.voice.scale, .5, {x: 1, y: 1, ease: Bounce.easeOut});
		TweenMax.to(data.voice, .5, {alpha: 1, ease: Power1.easeInOut});
		TweenMax.to(data.info.scale, .5, {x: 1, y: 1, ease: Bounce.easeOut});
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
				var title1 = createSprite('regular', {
					parent: data.content,
					back: 'vamos.png',
					ancX: .5,
					ancY: .5,
					posX: Value(250),
					posY: Value(290),
					callback: function(){
						TweenMax.to(title1.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						TweenMax.to(title2.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						data.audio.play('title_1', function(){data.cancelButtons = false});
					}
				});
				TweenMax.to(title1, 1, {rotation: DegToRad(20), ease: Power1.easeInOut, repeat: -1, yoyo:true});
				var title2 = createSprite('regular', {
					parent: data.content,
					back: 'avanza.png',
					ancX: .5,
					ancY: .5,
					posX: Value(250),
					posY: Value(430),
					callback: function(){
						TweenMax.to(title1.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						TweenMax.to(title2.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						data.audio.play('title_1', function(){data.cancelButtons = false});
					}
				});
				TweenMax.to(title2, 1, {rotation: DegToRad(-20), ease: Power1.easeInOut, repeat: -1, yoyo:true});
				createSprites('next button');
				speech();
				break				
			case 3:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				var title1 = createSprite('regular', {
					parent: data.content,
					back: 'precaucion.png',
					ancX: .5,
					ancY: .5,
					posX: Value(250),
					posY: Value(290),
					callback: function(){
						TweenMax.to(title1.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						TweenMax.to(title2.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						data.audio.play('title_2', function(){data.cancelButtons = false});
					}
				});
				TweenMax.to(title1, 1, {rotation: DegToRad(20), ease: Power1.easeInOut, repeat: -1, yoyo:true});
				var title2 = createSprite('regular', {
					parent: data.content,
					back: 'conductor.png',
					ancX: .5,
					ancY: .5,
					posX: Value(250),
					posY: Value(430),
					callback: function(){
						TweenMax.to(title1.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						TweenMax.to(title2.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						data.audio.play('title_2', function(){data.cancelButtons = false});
					}
				});
				TweenMax.to(title2, 1, {rotation: DegToRad(-20), ease: Power1.easeInOut, repeat: -1, yoyo:true});
				createSprites('next button');
				speech();
				break				
			case 4:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				var title1 = createSprite('regular', {
					parent: data.content,
					back: 'alto.png',
					ancX: .5,
					ancY: .5,
					posX: Value(350),
					posY: Value(250),
					callback: function(){
						TweenMax.to(title1.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						TweenMax.to(title2.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						data.audio.play('title_3', function(){data.cancelButtons = false});
					}
				});
				TweenMax.to(title1, 1, {rotation: DegToRad(20), ease: Power1.easeInOut, repeat: -1, yoyo:true});
				var title2 = createSprite('regular', {
					parent: data.content,
					back: 'detente.png',
					ancX: .5,
					ancY: .5,
					posX: Value(350),
					posY: Value(370),
					callback: function(){
						TweenMax.to(title1.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						TweenMax.to(title2.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						data.audio.play('title_3', function(){data.cancelButtons = false});
					}
				});
				TweenMax.to(title2, 1, {rotation: DegToRad(-20), ease: Power1.easeInOut, repeat: -1, yoyo:true});
				createSprites('next button');
				speech();
				break
			case 5:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				var car = createSprite('regular', {
					parent: data.content,
					back: 'car.png',
					ancX: .5,
					ancY: .5,
					posX: Value(-200),
					posY: Value(460),
					rotation: DegToRad(-2),
					callback: function(){
						TweenMax.to(car.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						data.audio.play('title_4', function(){data.cancelButtons = false});
					}
				});
				TweenMax.to(car, .4, {rotation: DegToRad(2), ease: Power1.easeInOut, repeat: -1, yoyo:true});
				TweenMax.to(car.position, .25, {y: Value(450), ease: Power1.easeInOut, repeat: -1, yoyo:true});
				TweenMax.to(car.position, 2, {x: Value(310), ease: Power1.easeOut});
				createSprites('next button');
				speech();
				break
			case 6:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				var kids = createSprite('regular', {
					parent: data.content,
					back: 'kids.png',
					ancX: .5,
					ancY: .9,
					posX: Value(330),
					posY: Value(590),
					callback: function(){
						TweenMax.to(kids.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true, overwrite: 0});
						data.audio.play('title_5', function(){data.cancelButtons = false});
					}
				});
				TweenMax.to(kids.scale, 2, {y: .97, ease: Power1.easeInOut, repeat: -1, yoyo:true});
				createSprites('next button');
				speech();
				break	
			case 7:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				var title1 = createSprite('regular', {
					parent: data.content,
					back: 'puedes_cruzar.png',
					ancX: .5,
					ancY: .5,
					posX: Value(690),
					posY: Value(250),
					callback: function(){
						TweenMax.to(title1.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						TweenMax.to(title2.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						data.audio.play('title_6', function(){data.cancelButtons = false});
					}
				});
				TweenMax.to(title1, 1, {rotation: DegToRad(20), ease: Power1.easeInOut, repeat: -1, yoyo:true});
				var title2 = createSprite('regular', {
					parent: data.content,
					back: 'la_calle.png',
					ancX: .5,
					ancY: .5,
					posX: Value(740),
					posY: Value(370),
					callback: function(){
						TweenMax.to(title1.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						TweenMax.to(title2.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						data.audio.play('title_6', function(){data.cancelButtons = false});
					}
				});
				TweenMax.to(title2, 1, {rotation: DegToRad(-20), ease: Power1.easeInOut, repeat: -1, yoyo:true});
				createSprites('next button');
				speech();
				break
			case 8:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				var title1 = createSprite('regular', {
					parent: data.content,
					back: 'alto.png',
					ancX: .5,
					ancY: .5,
					posX: Value(690),
					posY: Value(270),
					callback: function(){
						TweenMax.to(title1.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						TweenMax.to(title2.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						data.audio.play('title_7', function(){data.cancelButtons = false});
					}
				});
				TweenMax.to(title1, 1, {rotation: DegToRad(20), ease: Power1.easeInOut, repeat: -1, yoyo:true});
				var title2 = createSprite('regular', {
					parent: data.content,
					back: 'peligro.png',
					ancX: .5,
					ancY: .5,
					posX: Value(690),
					posY: Value(380),
					callback: function(){
						TweenMax.to(title1.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						TweenMax.to(title2.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						data.audio.play('title_7', function(){data.cancelButtons = false});
					}
				});
				TweenMax.to(title2, 1, {rotation: DegToRad(-20), ease: Power1.easeInOut, repeat: -1, yoyo:true});
				createSprites('next button');
				speech();
				break
			case 9:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				act1();
				break
			case 10:
				data.act1 = {}
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
		if(data.page != 9) btns.push(data.content.getChildAt(data.content.children.length - 1));		
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
		data.audio.play(sound, function(){
			disabledUI(false);
			if(fun) fun();
		});
	}

	function act1(){
		var characters = [];
		var topLaneCars = [];
		var bottomLaneCars = [];
		var semaphoreLights = [];
		var semaphore2Lights = [];
		// CHARACTERS
		var santiago = createSprite('simple', {
			parent: data.content,
			back: 'santiago.png',
			ancX: .5, 
			ancY: .9,
			posX: Value(620),
			posY: Value(240)
		});
		characters.push(santiago);
		var sofia = createSprite('simple', {
			parent: data.content,
			back: 'sofia.png',
			ancX: .5, 
			ancY: .9,
			posX: Value(520),
			posY: Value(240)
		});
		characters.push(sofia);
		var merlin = createSprite('simple', {
			parent: data.content,
			back: 'merlin.png',
			ancX: .5, 
			ancY: .9,
			posX: Value(420),
			posY: Value(250)
		});	
		characters.push(merlin);
		// CARS
		for(var i = 0; i < 6; i++){
			var car = createSprite('simple', {
				parent: data.content,
				back: 'car_' + (i + 1) + '.png',
				ancX: .5,
				ancY: .5,
				posX: Value(-285),
				posY: Value(335),
				visible: false
			});
			car.lane = true;
			topLaneCars.push(car);
		};
		for(var i = 0; i < 6; i++){
			var car = createSprite('simple', {
				parent: data.content,
				back: 'car_' + (i + 1) + '.png',
				ancX: .5,
				ancY: .5,
				posX: Value(-285),
				posY: Value(335),
				visible: false
			});
			car.lane = false;
			bottomLaneCars.push(car);
		};
		// SEMAPHORE
		var semaphore = createSprite('simple', {
			parent: data.content,
			back: 'semaphore.png',
			posX: Value(810),
			posY: Value(155)
		});
		var semaphore_red = createSprite('simple', {
			parent: semaphore,
			back: 'semaphore_red.png',
			ancX: .5,
			ancY: .5,
			posX: Value(59),
			posY: Value(70),
			visible: false
		});
		semaphoreLights.push(semaphore_red);
		var semaphore_yellow = createSprite('simple', {
			parent: semaphore,
			back: 'semaphore_yellow.png',
			ancX: .5,
			ancY: .5,
			posX: Value(59),
			posY: Value(138),
			visible: false
		});
		semaphoreLights.push(semaphore_yellow);
		var semaphore_green = createSprite('simple', {
			parent: semaphore,
			back: 'semaphore_green.png',
			ancX: .5,
			ancY: .5,
			posX: Value(59),
			posY: Value(207),
			visible: false
		});
		semaphoreLights.push(semaphore_green);
		var semaphore_2_red = createSprite('simple', {
			parent: semaphore,
			back: 'semaphore_2_red.png',
			ancX: .5,
			ancY: .5,
			posX: Value(50),
			posY: Value(310),
			visible: false
		});
		semaphore2Lights.push(semaphore_2_red);
		var semaphore_2_green = createSprite('simple', {
			parent: semaphore,
			back: 'semaphore_2_green.png',
			ancX: .5,
			ancY: .5,
			posX: Value(50),
			posY: Value(363),
			visible: false
		});
		semaphore2Lights.push(semaphore_2_green);
		// CROSSING BUTTON
		var button = createSprite('regular', {
			parent: data.content,
			back: 'down.png',
			ancX: .5, 
			ancY: .5,
			posX: Value(635),
			posY: Value(430),
			sound: 'btn_1',
			alpha: 0,
			visible: false,
			callback: function(){
				var button = data.act1.button;
				button.interactive = false;
				TweenMax.to(button.scale, .1, {x: 1.2, y: 1.2, ease: Power1.easeInOut, repeat: 1, yoyo:true, onComplete: function(){
					button.alpha = 0;
					button.visible = false;
					button.tween.pause();
				}});
				crossStreet();
			}
		});
		button.tween = TweenMax.to(button.position, .25, {y: button.position.y - Value(10), ease: Power1.easeInOut, repeat: -1, yoyo:true, paused: true});
		data.act1.button = button;
		data.act1.characters = characters;
		data.act1.charactersCnt = characters.length;
		data.act1.currentCharacter = 0;
		data.act1.topLaneCar;
		data.act1.bottomLaneCar;
		data.act1.topLaneCars = topLaneCars;
		data.act1.bottomLaneCars = bottomLaneCars;
		data.act1.semaphoreState = 'green';
		data.act1.semaphoreLights = semaphoreLights;
		data.act1.semaphore2Lights = semaphore2Lights;
		data.act1.timeout = 0;
		setSemaphore('green');
		speech(function(){startLightsLoop(2000);});
	}

	function startLightsLoop(startTime){
		setSemaphore('green');
		data.act1.timeout = setTimeout(function(){
			data.act1.timeout = setTimeout(function(){
				data.act1.timeout = setTimeout(function(){
					startLightsLoop();
				}, 6000);
				setSemaphore('red');
			}, 3000);
			setSemaphore('yellow');
		}, startTime || 8000);
	}

	function setSemaphore(state){
		var lastState = data.act1.semaphoreState;
		data.act1.semaphoreState = state;
		var cars = [data.act1.topLaneCar ||  setCar(true), data.act1.bottomLaneCar ||  setCar(false)];		
		for(var i = 0; i < 3; i++){
			var light = data.act1.semaphoreLights[i];
			light.visible = false;
		}
		for(var i = 0; i < 2; i++){
			var light2 = data.act1.semaphore2Lights[i];
			light2.visible = false;
		}
		switch(state){
			case 'green':
				data.act1.semaphoreLights[2].visible = true;
				data.act1.semaphore2Lights[0].visible = true;
				if(lastState != 'green'){
					TweenMax.to(data.act1.semaphoreLights[2].scale, .2, {x: 1.5, y: 1.5, ease: Power1.easeOut, repeat: 1, yoyo: true});
					TweenMax.to(data.act1.semaphore2Lights[0].scale, .2, {x: 1.5, y: 1.5, ease: Power1.easeOut, repeat: 1, yoyo: true});
				};
				for(var i = 0; i < 2; i++){
					var car = cars[i];
					TweenMax.to(car.tweenY, 2, {timeScale: 1, ease: Power1.easeInOut});
					TweenMax.to(car.tweenDrive, 2, {timeScale: 1, ease: Power1.easeInOut});;
				};
				var button = data.act1.button;
				if(button.visible){
					button.interactive = false;
					TweenMax.to(button, .2, {alpha: 0, ease: Power1.easeInOut, onComplete: function(){
						button.alpha = 0;
						button.visible = false;
						button.tween.pause();
					}});
				};
				break
			case 'yellow':
				data.act1.semaphoreLights[1].visible = true;
				data.act1.semaphore2Lights[0].visible = true;
				TweenMax.to(data.act1.semaphoreLights[1].scale, .2, {x: 1.5, y: 1.5, ease: Power1.easeOut, repeat: 1, yoyo: true});
				break
			case 'red':
				data.act1.semaphoreLights[0].visible = true;
				data.act1.semaphore2Lights[1].visible = true;
				TweenMax.to(data.act1.semaphoreLights[0].scale, .2, {x: 1.5, y: 1.5, ease: Power1.easeOut, repeat: 1, yoyo: true});
				TweenMax.to(data.act1.semaphore2Lights[1].scale, .2, {x: 1.5, y: 1.5, ease: Power1.easeOut, repeat: 1, yoyo: true});
				var button = data.act1.button;
				button.alpha = 0;
				button.visible = true;
				button.tween.play();
				TweenMax.to(button, .4, {alpha: 1, ease: Power1.easeInOut, onComplete: function(){
					button.interactive = true;
				}});
				break
		};
	}

	function setCar(bool){
		var car;
		var speed = RandomInt(2, 4) + (RandomInt(-5, 5) * .1);
		if(bool){
			do{
				car = data.act1.topLaneCars[RandomInt(0, 5)];
			}while(car == data.act1.topLaneCar);
			data.act1.topLaneCar = car;
			if(data.act1.bottomLaneCar != null && speed == data.act1.bottomLaneCar.speed) speed += RandomInt(-5, 5) * .1;
		}else{
			do{
				car = data.act1.bottomLaneCars[RandomInt(0, 5)];
			}while(car == data.act1.bottomLaneCar);
			data.act1.bottomLaneCar = car;
			if(data.act1.topLaneCar != null && speed == data.act1.topLaneCar.speed) speed += RandomInt(-5, 5) * .1;	
		}
		var midCar = Round(car.width * .5);
		var startPosX = - midCar - Value(10);
		var endPosX = data.width + midCar + Value(10);
		var startPosY = bool ? Value(280) : Value(420);
		var endPosY = startPosY - Value(5);
		var stopPosition = Value(458) - midCar;
		var stopPositionWeight = 7;
		car.speed = speed;
		car.position.x = startPosX;
		car.position.y = startPosY;
		car.visible = true;
		car.scale.x = car.scale.y = 1.0;
		car.tweenY = TweenMax.to(car.position, speed * .05, {y: endPosY, ease: Power1.easeInOut, repeat: -1, yoyo:true});
		car.tweenDrive = TweenMax.to(car.position, speed, {x: endPosX, ease: Power0.easeInOut, onCompleteScope: car, onComplete: function(){
			this.visible = false;
			this.tweenY.kill();
			setCar(this.lane);
		}});
		if(data.act1.semaphoreState != 'green'){
			var duration = (stopPosition * speed / (endPosX - startPosX)) * stopPositionWeight;
			TweenMax.to(car.tweenY, duration, {timeScale: 0, ease: Power1.easeOut});
			TweenMax.to(car.tweenDrive, duration, {timeScale: 0, ease: Power1.easeOut});
		}
		return car
	}

	function crossStreet(){
		clearTimeout(data.act1.timeout);
		disabledUI(true);
		var character = data.act1.characters[data.act1.currentCharacter];
		var targetPosY = data.height + (character.height * 2);
		var targetPosX = character.position.x + Value(50);
		var duration = 7;
		var characterRot = DegToRad(5);
		TweenMax.to(character.position, duration, {x: targetPosX, y: targetPosY, ease: Power1.easeIn, onComplete: function(){
			TweenMax.killTweensOf(character); 
			character.visible = false;
			data.act1.currentCharacter++;
			setSemaphore('green');
			if(data.act1.currentCharacter < data.act1.charactersCnt){
				data.audio.play('act_1_feedback_' + data.act1.currentCharacter, function(){
					disabledUI(false);
					startLightsLoop();
				});
			}else{
				data.audio.play('act_1_feedback_' + data.act1.currentCharacter, function(){
					data.audio.play('chime');
					setTimeout(function(){stepPage(true);}, 2500);
				});
			};
		}});
		TweenMax.to(character, .25, {rotation: -characterRot, ease: Power1.easeInOut, onComplete: function(){
			TweenMax.to(character, .5, {rotation: characterRot, ease: Power1.easeInOut, repeat: -1, yoyo:true});
		}});
		TweenMax.to(character.scale, duration, {x: 2, y: 2, ease: Power1.easeIn});
		if(data.act1.currentCharacter < data.act1.charactersCnt - 1){
			for(var i = data.act1.currentCharacter + 1; i < data.act1.charactersCnt; i++){
				var char = data.act1.characters[i];
				TweenMax.to(char.position, 1, {x: char.position.x + Value(100), ease: Power1.easeInOut, delay: duration * .5});
			};
		};
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
					ancY: .5,
					posX: Value(22 + 36),
					posY: Value(22 + 34),
					scaX: 0.1,
					scaY: 0.1,
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
					scaX: 0.1,
					scaY: 0.1,
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
					scaX: 0.1,
					scaY: 0.1,
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
					callback: function(){setPage(9)},
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

