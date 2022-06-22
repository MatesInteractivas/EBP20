
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
	data.pagesCnt = 7;
	data.act1 = {};

	
	// AUDIO ENGINE
	data.audio = AudioEngine();
	data.audioSprites = {
		btn_1: {start: 0.500, length: 0.366},
		btn_2: {start: 1.400, length: 0.269},
		ui_on: {start: 2.200, length: 0.150},
		drop_fail: {start: 2.900, length: 0.600},
		chime: {start: 4.000, length: 1.600},
		page_1: {start: 6.100, length: 11.200},
		page_2: {start: 17.800, length: 19.000},
		page_3: {start: 37.300, length: 5.000},
		page_4: {start: 42.800, length: 4.100},
		page_5: {start: 47.400, length: 4.100},
		page_6: {start: 52.000, length: 12.700},
		page_7: {start: 65.200, length: 12.700},
		title_1: {start: 78.400, length: 0.700},
		title_2: {start: 79.600, length: 0.700},
		title_3: {start: 80.800, length: 0.800},
		character_1: {start: 82.100, length: 1.300},
		character_2: {start: 83.900, length: 1.400},
		character_3: {start: 85.800, length: 1.400},
		worm_1: {start: 87.700, length: 1.000},
		worm_2: {start: 89.200, length: 1.100},
		worm_3: {start: 90.800, length: 1.100},
		drop_wrong: {start: 92.400, length: 2.400},
		drop_ok_1: {start: 95.300, length: 2.500},
		drop_ok_2: {start: 98.300, length: 2.400},
		go_home: {start: 101.200, length: 2.100},
		go_info: {start: 103.800, length: 0.900}
	}

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
		back7 : 'data/img/7' + data.resSuffix + '.jpg',
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
			data.imgs.back7,
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
		
		// CONVERT SPRITESHEET FRAME TO SINGLE IMAGE FOR TILE SPRITES
		setTileTextureFromeSpriteSheet('clouds.png', 'clouds_crop.png');
		
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
				// CLOUDS
				var cloudsTexture = PIXI.Texture.fromFrame('clouds_crop.png');
				var clouds = new PIXI.TilingSprite(cloudsTexture, data.width, cloudsTexture.height);
				clouds.position.y = Value(200);
				data.content.addChild(clouds);		
				TweenMax.to(clouds.tilePosition, 80, {x: -cloudsTexture.width, ease: Power0.easeInOut, repeat: -1});
				// HELICOPTER								
				var helicopter = createSprite('simple', {
					parent: data.content,
					back: 'helicopter.png',
					ancX: .0715,
					ancY: .5,
					posX: data.width + Value(50),
					posY: Value(160),
					rotation: DegToRad(-3)
				});
				TweenMax.to(helicopter.position, 30, {x: - Value(622), ease: Power0.easeInOut, repeat: -1});
				TweenMax.to(helicopter.position, 3, {y: helicopter.position.y + Value(20), ease: Power1.easeInOut, repeat: -1, yoyo: true});
				TweenMax.to(helicopter, 6, {rotation: DegToRad(3), ease: Power1.easeInOut, repeat: -1, yoyo: true});
				// MONSTER 1
				var monster1 = createSprite('simple', {
					parent: data.content,
					back: 'monster_1.png',
					ancX: .5,
					ancY: 1,
					posX: Value(532),
					posY: Value(510)
				});
				TweenMax.to(monster1.scale, .8, {y: 1.05, ease: Power1.easeInOut, repeat: -1, yoyo: true});
				// MONSTER 2
				var monster2 = createSprite('simple', {
					parent: data.content,
					back: 'monster_2.png',
					ancX: .5,
					ancY: 1,
					posX: Value(772),
					posY: Value(510),
					rotation: DegToRad(-2)
				});
				TweenMax.to(monster2.scale, .5, {y: 1.05, ease: Power1.easeInOut, repeat: -1, yoyo: true});	
				TweenMax.to(monster2, 1, {rotation: DegToRad(2), ease: Power1.easeInOut, repeat: -1, yoyo: true});
				// MONSTER 3
				var monster3 = createSprite('simple', {
					parent: data.content,
					back: 'monster_3.png',
					ancX: .5,
					ancY: 1,
					posX: Value(461),
					posY: Value(440)
				});
				TweenMax.to(monster3.scale, 1, {y: 1.05, ease: Power1.easeInOut, repeat: -1, yoyo: true});	
				// MONSTER 4
				var monster4 = createSprite('simple', {
					parent: data.content,
					back: 'monster_4.png',
					ancX: .5,
					ancY: 1,
					posX: Value(57),
					posY: Value(485),
					rotation: DegToRad(2)
				});
				TweenMax.to(monster4.scale, .4, {y: 1.05, ease: Power1.easeInOut, repeat: -1, yoyo: true});	
				TweenMax.to(monster4, .8, {rotation: DegToRad(-2), ease: Power1.easeInOut, repeat: -1, yoyo: true});
				// CAR 1
				var car1 = createSprite('simple', {
					parent: data.content,
					back: 'car_1.png',
					ancX: .5,
					ancY: .5,
					posX: Value(-60),
					posY: Value(510),
					rotation: DegToRad(1)
				});
				TweenMax.to(car1.position, 10, {x: data.width + Value(60), ease: Power0.easeInOut, repeat: -1});
				TweenMax.to(car1, .3, {rotation: DegToRad(-1), ease: Power1.easeInOut, repeat: -1, yoyo: true});
				// CAR 2
				var car2 = createSprite('simple', {
					parent: data.content,
					back: 'car_2.png',
					ancX: .5,
					ancY: .5,
					posX: Value(-60),
					posY: Value(530),
					rotation: DegToRad(-1)
				});
				var car2Tween = TweenMax.to(car2.position, 7, {x: data.width + Value(60), ease: Power0.easeInOut, repeat: -1});
				car2Tween.seek(3.5)
				TweenMax.to(car2, .22, {rotation: DegToRad(1), ease: Power1.easeInOut, repeat: -1, yoyo: true});
				createSprites('next button');
				speech();
				break				
			case 3:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				var title = createSprite('regular', {
					parent: data.content,
					back: 'title_1.png',
					ancX: .5,
					ancY: .5,
					posX: Value(786),
					posY: Value(202),
					callback: function(){
						TweenMax.to(title.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						data.audio.play('title_1', function(){data.cancelButtons = false});
					}
				});
				TweenMax.to(title, 1, {rotation: DegToRad(10), ease: Power1.easeInOut, repeat: -1, yoyo:true});
				createSprites('next button');
				speech();
				break				
			case 4:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				var title = createSprite('regular', {
					parent: data.content,
					back: 'title_2.png',
					ancX: .5,
					ancY: .5,
					posX: Value(515),
					posY: Value(100),
					callback: function(){
						TweenMax.to(title.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						data.audio.play('title_2', function(){data.cancelButtons = false});
					}
				});
				TweenMax.to(title, 1, {rotation: DegToRad(10), ease: Power1.easeInOut, repeat: -1, yoyo:true});
				createSprites('next button');
				speech();
				break
			case 5:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				var title = createSprite('regular', {
					parent: data.content,
					back: 'title_3.png',
					ancX: .5,
					ancY: .5,
					posX: Value(343),
					posY: Value(147),
					callback: function(){
						TweenMax.to(title.scale, .1, {x: 1.4, y: 1.4, ease: Power1.easeOut, repeat: 1, yoyo: true});
						data.audio.play('title_3', function(){data.cancelButtons = false});
					}
				});
				TweenMax.to(title, 1, {rotation: DegToRad(10), ease: Power1.easeInOut, repeat: -1, yoyo:true});
				createSprites('next button');
				speech();
				break
			case 6:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				act1();
				speech();
				break
			case 7:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				// CLOUDS
				var cloudsTexture = PIXI.Texture.fromFrame('clouds_crop.png');
				var clouds = new PIXI.TilingSprite(cloudsTexture, data.width, cloudsTexture.height);
				clouds.position.y = Value(200);
				data.content.addChild(clouds);		
				TweenMax.to(clouds.tilePosition, 80, {x: -cloudsTexture.width, ease: Power0.easeInOut, repeat: -1});
				// HELICOPTER								
				var helicopter = createSprite('simple', {
					parent: data.content,
					back: 'helicopter_big.png',
					ancX: .0715,
					ancY: .5,
					posX: data.width + Value(70),
					posY: Value(160),
					rotation: DegToRad(-3)
				});
				var helicopterTween = TweenMax.to(helicopter.position, 30, {x: - Value(820), ease: Power0.easeInOut, repeat: -1});
				helicopterTween.seek(7);
				TweenMax.to(helicopter.position, 3, {y: helicopter.position.y + Value(20), ease: Power1.easeInOut, repeat: -1, yoyo: true});
				TweenMax.to(helicopter, 6, {rotation: DegToRad(3), ease: Power1.easeInOut, repeat: -1, yoyo: true});
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
		if(data.page != 6) btns.push(data.content.getChildAt(data.content.children.length - 1));		
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
		var charPos = ShuffleArray([
			{posX: Value(162), dropX: Value(37)},
			{posX: Value(506), dropX: Value(380)},
			{posX: Value(854), dropX: Value(728)}
		]);
		var charactersData = [
			{
				id: 1,
				pos: new PIXI.Point(charPos[0].posX, Value(355)),
				mouth: new PIXI.Point(Value(2), Value(-8)),
				drop: new PIXI.Rectangle(charPos[0].dropX, Value(195), Value(251), Value(200)), 
				target: new PIXI.Point(charPos[0].posX, Value(332)),
			},
			{
				id: 2,
				pos: new PIXI.Point(charPos[1].posX, Value(355)),
				mouth: new PIXI.Point(Value(6), Value(-49)),
				drop: new PIXI.Rectangle(charPos[1].dropX, Value(195), Value(251), Value(200)), 
				target: new PIXI.Point(charPos[1].posX, Value(302))
			},
			{
				id: 3,
				pos: new PIXI.Point(charPos[2].posX, Value(355)), 
				mouth: new PIXI.Point(Value(2), Value(-19)),
				drop: new PIXI.Rectangle(charPos[2].dropX, Value(195), Value(251), Value(200)), 
				target: new PIXI.Point(charPos[2].posX, Value(332))
			}
		];
		var characters = [
			makeCharacter(charactersData[0]),
			makeCharacter(charactersData[1]),
			makeCharacter(charactersData[2])
		];
		var charactersCnt = characters.length;
		var table = createSprite('simple', {
			parent: data.content,
			back: 'table.png',
			ancX: 0,
			ancY: 1,
			posX: Value(0),
			posY: data.height,
			scaX: 2,
			scaY: 2
		});
		var wormsPos = ShuffleArray([
			new PIXI.Point(Value(350), Value(504)),
			new PIXI.Point(Value(538), Value(473)),
			new PIXI.Point(Value(486), Value(554)),
			new PIXI.Point(Value(669), Value(542)),
			new PIXI.Point(Value(381), Value(615)),
			new PIXI.Point(Value(587), Value(621))
		]);
		var index = 0;
		var sprites = [];
		for(var i = 0; i < charactersCnt; i++){
			var character = characters[i];
			sprites.push(makeWorm(wormsPos[index++], character));
			sprites.push(makeWorm(wormsPos[index++], character));
		};
		data.act1.cnt = 0;
		data.act1.spritesCnt = sprites.length;
		data.act1.sprites = sprites;
	}

	function checkAct1End(){
		data.act1.cnt++;
		if(data.act1.cnt < data.act1.spritesCnt) return
		disabledUI(true);
		data.audio.play('chime', function(){
			setTimeout(function(){stepPage(true); data.act1 = {};}, 1000);
		});
	}

	function makeCharacter(cData){
		var character = createSprite('simple', {
			parent: data.content,
			back: 'character_' + cData.id + '.png',
			ancX: .5,
			ancY: .5,
			posX: cData.pos.x,
			posY: cData.pos.y
		});
		character.data = cData;
		character.mouth = createSprite('simple', {
			parent: character,
			back: 'mouth_' + cData.id + '.png',
			ancX: .5,
			ancY: .5,
			posX: cData.mouth.x,
			posY: cData.mouth.y,
			visible: false
		});
		character.tween = TweenMax.to(character.scale, RandomInt(6, 9) * .1, {y: .98, ease: Power1.easeInOut, repeat: -1, yoyo: true});
		character.tween.seek(RandomInt(1, 8) * .1);
		character.interactive = true;
		character.mousedown = character.touchstart = function(evt){
			cancelEvent(evt);
			if(data.cancelButtons) return
			data.audio.play('character_' + this.data.id);
			TweenMax.to(this.scale, .1, {x: 1.2, y: 1.2, ease: Power1.easeOut, repeat: 1, yoyo: true, overwrite: 0});
		}
		return character
	}

	function makeWorm(pos, character){
		var cData = character.data;
		var sprite = PIXI.Sprite.fromFrame('worm_' + cData.id + '.png');
			sprite.anchor.x = sprite.anchor.y = .5;
			sprite.startPos = pos;
			sprite.targetPos = cData.target;
			sprite.position = pos.clone();
			sprite.interactive = true;
			sprite.drop = cData.drop;
			sprite.character = character;
			sprite.container = data.content;
			sprite.onPlace = false;
			sprite.sound = 'worm_' + cData.id;
			sprite.mousedown = sprite.touchstart = function(evt){
				cancelEvent(evt);
				if(data.cancelButtons) return
				if(this.onPlace) return
				data.cancelButtons = true;
				this.container.removeChild(this);
				this.container.addChild(this);
				data.audio.play(this.sound);
				this.evt = evt;
				this.dragging = true;
				this.scale.x = this.scale.y = .5;
				TweenMax.to(this.scale, .2, {x: 1, y: 1, ease: Back.easeOut});
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
				if(this.drop.contains(this.position.x, this.position.y)){
					this.interactive = false;					
					this.onPlace = true;
					if(data.act1.cnt < data.act1.spritesCnt - 1) data.audio.play('drop_ok_' + RandomInt(1, 2));
					TweenMax.to(this.position, .2, {x: this.targetPos.x, y: this.targetPos.y, ease: Power0.easeInOut});
					TweenMax.to(this.scale, .2, {x: .5, y: .5, ease: Power0.easeInOut, onCompleteScope: this, onComplete: function(){
						this.visible = false;
						var character = this.character;
						character.mouth.visible = true;
						TweenMax.to(character.position, .2, {y: character.position.y - Value(50), ease: Power1.easeInOut, repeat: 3, yoyo: true, onCompleteScope: character, onComplete: function(){
							this.mouth.visible = false;
							data.cancelButtons = false;
							checkAct1End();
						}});
					}});
				}else{
					data.audio.play('drop_fail');
					var cnt = data.act1.spritesCnt;
					var character = null;
					for(var i = 0; i < cnt; i++){
						if(data.act1.sprites[i].drop.contains(this.position.x, this.position.y)){
							data.audio.play('drop_wrong');
							character = data.act1.sprites[i].character;
							character.rotation = DegToRad(-10);
							TweenMax.to(character.position, .3, {y: character.position.y + Value(50), ease: Power1.easeInOut, repeat: 1, yoyo: true});
							var characterTween = TweenMax.to(character, .1, {rotation: DegToRad(10), ease: Power1.easeInOut, repeat: 3, yoyo: true, onComplete: function(){
								TweenMax.to(character, .1, {rotation: DegToRad(0), ease: Power1.easeInOut, onComplete: function(){
									data.cancelButtons = false;	
								}});
							}});
							characterTween.seek(.05);
							break;
						};
					};
					TweenMax.to(this.position, .4, {x: this.startPos.x, y: this.startPos.y, ease: Back.easeOut, onComplete: function(){
						if(character == null) data.cancelButtons = false;
					}});
				};
			}
			sprite.mousemove = sprite.touchmove = function(evt){
				cancelEvent(evt);
				if(this.dragging){
					var newPosition = this.evt.getLocalPosition(this.parent);
					this.position.x = newPosition.x;
					this.position.y = newPosition.y;
				};
			}
			data.content.addChild(sprite);
			return sprite
	}

	function showModal(modal, bool, fun){
		if(bool){
			pauseAllTweens(true);
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
				sprite.visible = ('visible' in props) ? props.visibl : true;
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
	
	function RandomInt(min, max){
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

