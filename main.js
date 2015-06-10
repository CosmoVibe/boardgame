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
	grass: 'img/grass.png'
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
}
preloadGameImages();


// General layer to use until we need more
var layer = new Kinetic.Layer();



// Board setup
var tilegroup = new Kinetic.Group();
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
layer.add(tilegroup);
stage.add(layer);

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
	layer.draw();
}
boardrefresh();





// Socket commands to communicate with server
// emit - send to server
// on - executes on receiving from server

socket.emit('talk', {'string': "HI SHELLEY!"});
socket.on('playersfull', function(data) {
	console.log('Server is full.');
});