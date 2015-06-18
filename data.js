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
var spriteloc = [
	{x: 6, y: 7, width: 64, height: 64},	// 0
	{x: 88, y: 8, width: 64, height: 64},
	{x: 166, y: 9, width: 64, height: 64},
	{x: 252, y: 10, width: 64, height: 64},
	{x: 326, y: 10, width: 64, height: 64},
	{x: 6, y: 97, width: 64, height: 64},	// 5
	{x: 90, y: 93, width: 64, height: 64},
	{x: 170, y: 88, width: 64, height: 64},
	{x: 253, y: 86, width: 64, height: 64},
	{x: 330, y: 85, width: 64, height: 64}
];