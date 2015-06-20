// Window setup //
var windowWidth = 800,
	windowHeight = 600;
var stage = new Kinetic.Stage({
	container: 'container',
	width: windowWidth,
	height: windowHeight
});

// Images //
var imgsources = {
	tile: 'img/tile.png',
	wall: 'img/wall.png',
	grass: 'img/grass.png',
	spritesheet: 'img/spritesheet.png'
};
var images = {};
function preloadGameImages() {
	for (var src in imgsources) {
		images[src] = new Image();
		images[src].src = imgsources[src];
		images[src].onload = function() {
			stage.draw();
		}
	}
	console.log("all images loaded");
}
preloadGameImages();

// Sprite locations of the pokemon sprite sheet
var spriteloc = {
	bulbasaur: {x: 6, y: 7, width: 64, height: 64},
	ivysaur: {x: 88, y: 8, width: 64, height: 64},
	venusaur: {x: 166, y: 9, width: 64, height: 64},
	charmander: {x: 252, y: 10, width: 64, height: 64},
	charmeleon: {x: 326, y: 10, width: 64, height: 64},
	nidoranf: {x: 6, y: 97, width: 64, height: 64},
	nidorina: {x: 90, y: 93, width: 64, height: 64},
	nidoqueen: {x: 170, y: 88, width: 64, height: 64},
	nidoranm: {x: 253, y: 86, width: 64, height: 64},
	nidorino: {x: 330, y: 85, width: 64, height: 64},
	machamp: {x: 890, y: 159, width: 64, height: 64},
	scizor: {x: 1205, y: 565, width: 64, height: 64},
	mismagius: {x: 655, y: 1205, width: 64, height: 64},
	weavile: {x: 960, y: 1285, width: 64, height: 64},
	rhyperior: {x: 1202, y: 1288, width: 64, height: 64},
	cresselia: {x: 882, y: 1365, width: 64, height: 64}
};

function idsprite(id) {
	switch (id) {
		case 0:
			return spriteloc.scizor;
			break;
		case 1:
			return spriteloc.weavile;
			break;
		case 2:
			return spriteloc.rhyperior;
			break;
		case 3:
			return spriteloc.mismagius;
			break;
		case 4:
			return spriteloc.cresselia;
			break;
		case 5:
			return spriteloc.machamp;
			break;
		case 6:
			return spriteloc.bulbasaur;
			break;
		case 7:
			return spriteloc.bulbasaur;
			break;
		case 8:
			return spriteloc.bulbasaur;
			break;
		case 9:
			return spriteloc.bulbasaur;
			break;
		case 10:
			return spriteloc.bulbasaur;
			break;
		case 11:
			return spriteloc.bulbasaur;
			break;
	}
}