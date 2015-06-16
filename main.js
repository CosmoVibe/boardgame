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


// Layers
var tileLayer = new Kinetic.Layer();
var unitLayer = new Kinetic.Layer();
var overlayLayer = new Kinetic.Layer();

// Overlay
var connectButton = new Kinetic.Group({x: 400, y: 1});
var connectButtonBox = new Kinetic.Rect({
	width: 200,
	height: 40,
	x: 0,
	y: 0,
	stroke: 'black',
	strokeWidth: 2,
	fill: '#CCCCCC'
});
var connectButtonText = new Kinetic.Text({
	x: connectButtonBox.width()/2,
	y: connectButtonBox.height()/2,
	text: 'not connected',
	fontSize: 20,
	fontFamily: 'Calibri',
	fill: 'black'
});
connectButtonText.offset({x: connectButtonText.width()/2, y: connectButtonText.height()/2});
connectButton.add(connectButtonBox);
connectButton.add(connectButtonText);
connectButtonText.moveToTop();
overlayLayer.add(connectButton);
stage.add(overlayLayer);

connectButton.on('mouseover', function() {
	document.body.style.cursor = 'pointer';
});
connectButton.on('mouseout', function() {
	document.body.style.cursor = 'default';
});
connectButton.on('click', function(evt) {
	socket.emit('confirmlogin',{});
});
socket.on('confirmlogin', function(data) {
	connectButtonBox.setAttrs({fill: 'green'});
	connectButtonText.setAttrs({text: 'you are player ' + (data.p+1)});
	connectButtonText.offset({x: connectButtonText.width()/2, y: connectButtonText.height()/2});
	console.log('you are player ' + (data.p+1));
	overlayLayer.draw();
});
socket.on('playersfull', function(data) {
	connectButtonBox.setAttrs({fill: 'red'});
	connectButtonText.setAttrs({text: 'server is full'});
	connectButtonText.offset({x: connectButtonText.width()/2, y: connectButtonText.height()/2});
	console.log('server is full');
	overlayLayer.draw();
});


// Board setup
var tilegroup = new Kinetic.Group({
	x: boardstartx,
	y: boardstarty
});
var mapx = 5;
var mapy = 5;
var boardstartx = 10;
var boardstarty = 10;
var tilesize = 64;
var boardtiles = [];
var tileborders = [];
for (var x = 0; x < mapx; x++) {
	boardtiles[x] = [];
	tileborders[x] = [];
	for (var y = 0; y < mapy; y++) {
		tileborders[x][y] = new Kinetic.Rect({
			x: boardstartx+x*tilesize,
			y: boardstarty+y*tilesize,
			width: tilesize,
			height: tilesize,
			stroke: 'black',
			strokeWidth: 2
		});
		boardtiles[x][y] = new Kinetic.Image({
			x: boardstartx+x*tilesize,
			y: boardstarty+y*tilesize,
			image: new Image(),
			width: tilesize,
			height: tilesize
		});
		tilegroup.add(tileborders[x][y]);
		tilegroup.add(boardtiles[x][y]);
	}
}
tileLayer.add(tilegroup);
stage.add(tileLayer);

function boardrefresh() {
	for (var x = 0; x <= mapx; x++) {
		for (var y = 0; y <= mapy; y++) {
			if (boardtiles[x]) {
				if (boardtiles[x][y]) {
					console.log('Drawing tile ' + x + ', ' + y);
					// At the moment every tile is drawn the same
					// This would be where you check to see what tile should be drawn
					boardtiles[x][y].setImage(images.tile);
				}
			}
		}
	}
	tileLayer.draw();
}
boardrefresh();

// Draw units
var unitborders = [];
unitborders[0] = [];
unitborders[1] = [];
var unitimages = [];
unitimages[0] = [];
unitimages[1] = [];
for (var p = 0; p < 1; p++) {
	for (var n = 0; n < 5; n++) {
		unitborders[p][n] = new Kinetic.Rect({
			x: boardstartx+(p*4)*tilesize,
			y: boardstarty+n*tilesize,
			width: tilesize,
			height: tilesize,
			stroke: 'black',
			strokeWidth: 2
		});
		unitimages[p][n] = new Kinetic.Image({
			x: boardstartx+(p*4)*tilesize,
			y: boardstarty+n*tilesize,
			image: new Image(),
			width: tilesize,
			height: tilesize
		});
		unitLayer.add(unitborders[p][n]);
		unitLayer.add(unitimages[p][n]);
	}
}
stage.add(unitLayer);





// Socket commands to communicate with server
// emit - send to server
// on - executes on receiving from server

socket.emit('talk', {'string': "HI SHELLEY!"});
socket.on('playersfull', function(data) {
	console.log('Server is full.');
});