
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
	data.pagesCnt = 5;
	data.act1 = {};
	data.travel = {};
	
	// AUDIO ENGINE
	data.audio = AudioEngine();
	data.audioSprites = {
		btn_1: {start: 0.500, length: 0.366},
		btn_2: {start: 1.400, length: 0.269},
		ui_on: {start: 2.200, length: 0.150},
		drop_wrong: {start: 2.900, length: 0.600},
		drop_ok: {start: 4.000, length: 1.100},
		chime: {start: 5.600, length: 1.600},
		page_1: {start: 7.700, length: 25.500},
		page_3: {start: 33.700, length: 17.800},
		page_4: {start: 52.000, length: 4.000},
		page_5: {start: 56.500, length: 12.000},
		planet_1: {start: 69.000, length: 11.400},
		planet_2: {start: 80.900, length: 11.500},
		planet_3: {start: 92.900, length: 12.600},
		planet_4: {start: 106.000, length: 5.400},
		planet_5: {start: 111.900, length: 12.600},
		planet_6: {start: 125.000, length: 9.400},
		planet_7: {start: 134.900, length: 6.100},
		planet_8: {start: 141.500, length: 10.600},
		title_1: {start: 152.600, length: 0.800},
		title_2: {start: 154.000, length: 0.600},
		title_3: {start: 155.100, length: 0.500},
		title_4: {start: 156.100, length: 0.600},
		title_5: {start: 157.200, length: 0.700},
		title_6: {start: 158.400, length: 0.800},
		title_7: {start: 159.700, length: 0.600},
		title_8: {start: 160.800, length: 0.800},
		go_home: {start: 162.100, length: 2.000},
		go_info: {start: 164.600, length: 0.800}
	}

	// IMAGES
	data.imgs = {
		loader : 'data/img/loader' + data.resSuffix + '.json',
		sprites1 : 'data/img/sprites1' + data.resSuffix + '.json',
		sprites2 : 'data/img/sprites2' + data.resSuffix + '.json',
		stars : 'data/img/stars' + data.resSuffix + '.png',
		back0 : 'data/img/0' + data.resSuffix + '.jpg',
		back1 : 'data/img/1' + data.resSuffix + '.jpg',
		back3 : 'data/img/3' + data.resSuffix + '.jpg',
		back4 : 'data/img/4' + data.resSuffix + '.jpg',
		back5 : 'data/img/5' + data.resSuffix + '.jpg',
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
		var assetLoader = new PIXI.AssetLoader([data.imgs.back0, data.imgs.stars, data.imgs.loader]);
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
		
		// SETUP LOADER WINDOW
		var starsTexture = PIXI.Texture.fromFrame(data.imgs.stars);
		var stars = new PIXI.TilingSprite(starsTexture, data.width, data.height);
		data.loader.addChild(stars);
		var spaceShuttle = new PIXI.DisplayObjectContainer();
		var shuttle = PIXI.Sprite.fromFrame('shuttle.png');
		shuttle.anchor.x = shuttle.anchor.y = .5;
		shuttle.position = new PIXI.Point(Value(120), Value(30));
		shuttle.rotation = DegToRad(-25)
		spaceShuttle.addChild(shuttle);
		var astronaut = PIXI.Sprite.fromFrame('astronaut.png');
		astronaut.anchor.x = astronaut.anchor.y = .5;
		spaceShuttle.addChild(astronaut);
		spaceShuttle.position.x = data.width + Value(100);
		spaceShuttle.position.y = Value(290);
		data.loader.addChild(spaceShuttle);
		var ship = new PIXI.DisplayObjectContainer();
		var fire = PIXI.Sprite.fromFrame('fire.png');
		fire.anchor.x = 1.0;
		fire.anchor.y = .5;
		fire.position.x = - Value(155);
		fire.position.y = Value(38);
		ship.addChild(fire);
		var shipBody = PIXI.Sprite.fromFrame('ship.png');
		shipBody.anchor.x = .5;
		shipBody.anchor.y = .5;
		ship.addChild(shipBody);
		ship.position.x = - Round(shipBody.width * .5);
		ship.position.y = data.height - Value(150);
		data.loader.addChild(ship);
		var text = PIXI.Sprite.fromFrame('text.png');
		text.anchor.x = text.anchor.y = .5;
		text.position.x = Value(512);
		text.position.y = Value(200);
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
				TweenMax.to(text, .5, {alpha: 1, ease: Power1.easeInOut});
			}});
			TweenMax.to(text.scale, .5, {x: 1.5, ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(text.scale, .7, {y: 1.5, ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(text, 3, {rotation: DegToRad(2), ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(fire.scale, .25, {y: 1.1, ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(fire.scale, .35, {x: 1.5, ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(ship.scale, 2, {x: 1.2, y:1.2, ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(ship.position, 8, {x: data.width + Round(shipBody.width / 2) + Value(100), ease: Power0.easeInOut, repeat: -1});
			TweenMax.to(ship.position, 2, {y: data.height - Value(220), ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(spaceShuttle.position, 12, {x: - Value(300), ease: Power0.easeInOut, repeat: -1, delay: 2, repeatDelay: 2});
			TweenMax.to(spaceShuttle.position, 5, {y: Value(320), ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(astronaut, 15, {rotation: DegToRad(360), ease: Power0.easeInOut, repeat: -1});
			TweenMax.to(astronaut.position, 3, {y: Value(20), ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(shuttle, 20, {rotation: DegToRad(0), ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(shuttle.position, 8, {y: Value(60), ease: Power1.easeInOut, repeat: -1, yoyo:true});
			TweenMax.to(stars.tilePosition, 12, {x: -data.width, ease: Power0.easeInOut, repeat: -1});
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
			data.imgs.back3,
			data.imgs.back4,
			data.imgs.back5,
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
				travel();
				break
			case 3:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				act1();
				speech(function(){
					data.cancelButtons = true;
					for(var i = 0; i < data.act1.spritesCnt; i++){
						var sprite = data.act1.sprites[i];
						sprite.scale.x = sprite.scale.y = .1;
						sprite.visible = true;
						if(i == data.act1.spritesCnt - 1){
							TweenMax.to(sprite.scale, .4, {x: 1, y: 1, ease: Bounce.easeOut, delay: i * .1, onComplete: function(){data.cancelButtons = false;}});
						}else{
							TweenMax.to(sprite.scale, .4, {x: 1, y: 1, ease: Bounce.easeOut, delay: i * .1});
						};
					};
				});
				break
			case 4:
				data.content.addChild(PIXI.Sprite.fromFrame(data.imgs['back' + data.page]));
				createSprites('next button');
				speech();
				break
			case 5:
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
		if(data.page >= 1 && data.page <= 5 && data.page != 2 && data.page != 3) btns.push(data.content.getChildAt(data.content.children.length - 1));
		if(data.page == 2 && data.content.children.length > 3) btns.push(data.content.getChildAt(data.content.children.length - 1)); 
		var cnt = btns.length;
		if(bool){
			data.cancelButtons = true;
			disableMenuButton(data.home, true);
			disableMenuButton(data.voice, true);
			disableMenuButton(data.info, true);
			for(var i = 0; i < cnt; i++){
				btns[i].interactive = false;
				btns[i].visible = false;
			};
		}else{
			if(data.page != 1) disableMenuButton(data.home, false);
			if(data.audio.enabled) disableMenuButton(data.voice, false);
			disableMenuButton(data.info, false);
			for(var i = 0; i < cnt; i++){
				btns[i].interactive = true;
				btns[i].visible = true;
			};
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
		var sound;
		switch(data.page){
			case 2: sound = 'planet_' + data.travel.planetCurrent; break;
			default: sound = 'page_' + data.page;
		}
		data.audio.play(sound, function(){
			disabledUI(false);
			if(fun) fun();
		});
	}
	
	function travel(){
		var starsTexture = PIXI.Texture.fromFrame(data.imgs.stars);
		var stars = new PIXI.TilingSprite(starsTexture, data.width, data.height);
		var starsTween = TweenMax.to(stars.tilePosition, 30, {x: -data.width, ease: Power0.easeInOut, repeat: -1});
		data.content.addChild(stars);
		var posX = Round(data.width * .5);
		var posY = Value(300);
		var planets = new PIXI.DisplayObjectContainer();
		var sun = PIXI.Sprite.fromFrame('sun.png');
		sun.anchor.x = sun.anchor.y = .5;
		sun.position.x = posX;
		sun.position.y = posY;
		planets.addChild(sun);
		posX += data.width;
		for(var i = 0; i < 8; i++){
			var planet = PIXI.Sprite.fromFrame( (i + 1) + '_planet.png');
			planet.anchor.x = planet.anchor.y = .5;
			planet.position.x = posX;
			planet.position.y = posY;
			planet.sound = 'title_' + (i + 1);
 			planet.interactive = true;
			planet.mousedown = planet.touchstart = function(evt){
				cancelEvent(evt);
				if(data.cancelButtons) return
				data.cancelButtons = true;
				data.audio.play(this.sound, function(){data.cancelButtons = false;});
				TweenMax.to(this.scale, .4, {x: 1.5, y: 1.5, ease: Power1.easeInOut, repeat: 1, yoyo:true});
			};
			planets.addChild(planet);
			var title = PIXI.Sprite.fromFrame( (i + 1) + '_title.png');
			title.anchor.x = title.anchor.y = .5;
			title.position.x = posX;
			title.position.y = data.height - Value(75);
			title.alpha = 0;
			title.visible = false;
			title.sound = 'title_' + (i + 1);
			title.interactive = true;
			title.mousedown = title.touchstart = function(evt){
				cancelEvent(evt);
				if(data.cancelButtons) return
				data.cancelButtons = true;
				data.audio.play(this.sound, function(){data.cancelButtons = false;});
				TweenMax.to(this.scale, .4, {x: 1.5, y: 1.5, ease: Power1.easeInOut, repeat: 1, yoyo:true});
			};
			planets.addChild(title);
			posX += data.width;
		}
		data.content.addChild(planets);
		var ship = new PIXI.DisplayObjectContainer();
		var fire = PIXI.Sprite.fromFrame('fire.png');
		fire.anchor.x = 1.0;
		fire.anchor.y = .5;
		fire.position.x = - Value(155);
		fire.position.y = Value(38);
		ship.addChild(fire);
		var shipBody = PIXI.Sprite.fromFrame('ship.png');
		shipBody.anchor.x = .5;
		shipBody.anchor.y = .5;
		ship.addChild(shipBody);
		ship.position.x = -Value(200);
		ship.position.y = data.height - Value(180);
		ship.scale.x = ship.scale.y = .3;
		TweenMax.to(fire.scale, .25, {y: 1.1, ease: Power1.easeInOut, repeat: -1, yoyo:true});
		var shipFireTween = TweenMax.to(fire.scale, .35, {x: 1.5, ease: Power1.easeInOut, repeat: -1, yoyo:true});
		TweenMax.to(ship.position, 2, {y: data.height - Value(200), ease: Power1.easeInOut, repeat: -1, yoyo:true});
		data.content.addChild(ship);
		data.travel.ship = ship;
		data.travel.shipFireTween = shipFireTween;
		data.travel.stars = stars;
		data.travel.starsTween = starsTween;
		data.travel.planets = planets;
		data.travel.planetsCnt = 8;
		data.travel.planetCurrent = 0;
		setTimeout(nextPlanet, 1000);
	}
	
	function nextPlanet(){
		if(data.content.children.length > 3) data.content.removeChild(data.content.getChildAt(data.content.children.length - 1));
		disabledUI(true);
		if(data.travel.planetCurrent >= 1){
			var lastTitle = data.travel.planets.getChildAt((data.travel.planetCurrent * 2));
			TweenMax.to(lastTitle, 1, {alpha: 0, ease: Power1.easeOut, onComplete: function(){
				lastTitle.visible = false;
			}});
		};
		data.travel.planetCurrent++;
		if(data.travel.planetCurrent > data.travel.planetsCnt){
			TweenMax.to(data.travel.starsTween, 1.5, {timeScale: 100, ease: Power0.easeIn});
			TweenMax.to(data.travel.shipFireTween, 1.5, {timeScale: 10, ease: Power0.easeIn});
			TweenMax.to(data.travel.ship.position, 4, {x: data.width + Value(200), ease: Power1.easeIn});
			TweenMax.to(data.travel.ship.scale, 1.5, {y: data.travel.ship.scale.y * .8, ease: Power1.easeIn});
			TweenMax.to(data.travel.planets.position, 3, {x: data.travel.planets.position.x - data.width, ease: Power1.easeIn, onComplete: function(){
				data.travel = {};
				stepPage(true);
			}});
		}else{
			TweenMax.to(data.travel.starsTween, 1.5, {timeScale: 100, ease: Power0.easeInOut, repeat: 1, yoyo: true});
			TweenMax.to(data.travel.shipFireTween, 1.5, {timeScale: 10, ease: Power0.easeInOut, repeat: 1, yoyo: true});
			TweenMax.to(data.travel.ship.position, 4, {x: data.travel.planetCurrent == 1 ? Value(110) : data.travel.ship.position.x + Value(110), ease: Power1.easeInOut});
			TweenMax.to(data.travel.ship.scale, 1.5, {y: data.travel.ship.scale.y * .8, ease: Power1.easeInOut, repeat: 1, yoyo: true});
			var nextTitle = data.travel.planets.getChildAt((data.travel.planetCurrent * 2));
			nextTitle.visible = true;
			TweenMax.to(nextTitle, 1, {alpha: 1.0, ease: Power1.easeIn, delay: 2});
			TweenMax.to(data.travel.planets.position, 3, {x: data.travel.planets.position.x - data.width, ease: Power1.easeInOut, onComplete: function(){
				speech(function(){
					createSprites('next planet');
				});
			}});
		};
	}

	function act1(){
		var sprites = [];
		var parts = [];
		parts.push({startPos: new PIXI.Point(Value(434),Value(565)), targetPos: new PIXI.Point(Value(56), Value(173))});
		parts.push({startPos: new PIXI.Point(Value(566),Value(550)), targetPos: new PIXI.Point(Value(319), Value(35))});
		parts.push({startPos: new PIXI.Point(Value(176), Value(530)), targetPos: new PIXI.Point(Value(263), Value(260))});
		parts.push({startPos: new PIXI.Point(Value(648), Value(496)), targetPos: new PIXI.Point(Value(510), Value(108))});
		parts.push({startPos: new PIXI.Point(Value(733), Value(440)), targetPos: new PIXI.Point(Value(421), Value(344))});
		parts.push({startPos: new PIXI.Point(Value(0), Value(481)), targetPos: new PIXI.Point(Value(664), Value(161))});
		parts.push({startPos: new PIXI.Point(Value(913), Value(548)), targetPos: new PIXI.Point(Value(834), Value(26))});
		parts.push({startPos: new PIXI.Point(Value(270), Value(488)), targetPos: new PIXI.Point(Value(817), Value(340))});
		for(var i = 0; i < parts.length; i++){
			var part = parts[i];			
			var sprite = PIXI.Sprite.fromFrame((i + 1) + '_part.png');
			var midWidth = Round(sprite.width * .5);
			var midHeight = Round(sprite.height * .5);
			sprite.startPos = new PIXI.Point(part.startPos.x + midWidth, part.startPos.y + midHeight);
			sprite.targetPos = new PIXI.Point(part.targetPos.x + midWidth, part.targetPos.y + midHeight);
			sprite.interactive = true;
			sprite.container = data.content;
			sprite.dropTarget = new PIXI.Rectangle(part.targetPos.x, part.targetPos.y, sprite.width, sprite.height);
			sprite.onPlace = false;
			sprite.visible = false;
			sprite.sound = 'title_' + (i + 1);
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
				TweenMax.to(this.scale, .2, {x: 1, y: 1, ease: Back.easeOut})
				var newPosition = this.evt.getLocalPosition(this.parent);
				this.position.x = newPosition.x;
				this.position.y = newPosition.y;
			};	
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
					}});
				}else{
					data.audio.play('drop_wrong');	
					TweenMax.to(this.position, .4, {x: this.startPos.x, y: this.startPos.y, ease: Back.easeOut, onComplete: function(){
						data.cancelButtons = false;	
					}});
				};
			};	
			sprite.mousemove = sprite.touchmove = function(evt){
				cancelEvent(evt);
				if(this.dragging){
					var newPosition = this.evt.getLocalPosition(this.parent);
					this.position.x = newPosition.x;
					this.position.y = newPosition.y;
				};
			};
			sprites.push(sprite);			
			sprite.anchor.x = sprite.anchor.y = 0.5;
			sprite.position = sprite.startPos.clone();
			data.content.addChild(sprite);	
		}
		data.act1.cnt = 0;
		data.act1.spritesCnt = sprites.length;
		data.act1.sprites = sprites;
	}

	function checkAct1End(){
		data.act1.cnt++;
		if(data.act1.cnt < data.act1.spritesCnt) return
		disabledUI(true);
		data.audio.play('chime', function(){
			for(var i = 0; i < data.act1.spritesCnt; i++){
				var sprite = data.act1.sprites[i];
				var delay = i * 1;
				if(i == data.act1.spritesCnt - 1){
					TweenMax.to(sprite.scale, .4, {x: 1.5, y: 1.5, ease: Power1.easeInOut, repeat: 1, yoyo:true, delay: delay, onComplete: function(){
						setTimeout(function(){data.act1 = {}; stepPage(true);}, 1000);
					}});					
				}else{
					TweenMax.to(sprite.scale, .4, {x: 1.5, y: 1.5, ease: Power1.easeInOut, repeat: 1, yoyo:true, delay: delay});
				};
				setTimeout(function(id){data.audio.play('title_' + id);}, delay * 1000, i + 1);
			};
		});
	}

	function showModal(modal, bool, fun){
		if(bool){
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
			if (fun !== undefined) fun();
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
			case 'next planet':
				createSprite('regular', {
					parent: data.content,
					back: 'next.png',
					ancX: .5,
					ancY: .5,
					posX: Value(944),
					posY: Value(600),
					halo: true,
					callback: function(){nextPlanet()},
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
					callback: function(){setPage(3)},
					tween: {target: 'scale', time: .5, props: {x: 1.2, y: 1.2, ease: Power1.easeInOut, repeat: -1, yoyo:true}}
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
				};
				if(props.tween) button.tweenObj = TweenMax.to(props.tween.target !== '' ? button[props.tween.target] : button, props.tween.time, props.tween.props);
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

