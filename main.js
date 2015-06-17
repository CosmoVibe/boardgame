// Window setup //
var windowWidth = 800,
	windowHeight = 600;
var stage = new Kinetic.Stage({
	container: 'container',
	width: windowWidth,
	height: windowHeight
});

// Images //
//
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



// Client variables
var selectedunit = [-1,-1];
var selectedtile = [-1,-1];


// Game state variables //

var units = [];
units[0] = [
	{
		id: 0,
		position: [0,0]
	},
	{
		id: 1,
		position: [0,1]
	},
	{
		id: 2,
		position: [0,2]
	},
	{
		id: 3,
		position: [0,3]
	},
	{
		id: 4,
		position: [0,4]
	}
];
units[1] = [
	{
		id: 5,
		position: [4,0]
	},
	{
		id: 6,
		position: [4,1]
	},
	{
		id: 7,
		position: [4,2]
	},
	{
		id: 8,
		position: [4,3]
	},
	{
		id: 9,
		position: [3,4]
	}
];







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

// code for buttons
connectButton.on('mouseover', function() {
	document.body.style.cursor = 'pointer';
});
connectButton.on('mouseout', function() {
	document.body.style.cursor = 'default';
});

socket.on('confirmlogin2', function(data) {
	connectButtonBox.setAttrs({fill: 'green'});
	connectButtonText.setAttrs({text: 'you are player ' + (data.player)});
	connectButtonText.offset({x: connectButtonText.width()/2, y: connectButtonText.height()/2});
	console.log('you are player ' + (data.player));
	overlayLayer.draw();
});

connectButton.on('click', function(evt) {
	console.log("Clicked"); 
	socket.emit('confirmlogin',{});
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
			strokeWidth: 1
		});
		boardtiles[x][y] = new Kinetic.Image({
			x: boardstartx+x*tilesize,
			y: boardstarty+y*tilesize,
			image: new Image(),
			width: tilesize,
			height: tilesize
		});
		boardtiles[x][y].id = [x,y];	// we use this to help us figure out which tile is being clicked (see below)

		// code for buttons
		boardtiles[x][y].on('mouseover', function() {
			document.body.style.cursor = 'pointer';
		});
		boardtiles[x][y].on('mouseout', function() {
			document.body.style.cursor = 'default';
		});
		boardtiles[x][y].on('click', function(evt) {
			if (selectedtile == this.id) {
				selectedtile = [-1,-1];
				console.log("no tile selected");
				tileborders[this.id[0]][this.id[1]].setAttrs({stroke: 'black'});
			}
			else {
				selectedtile = this.id;
				console.log("the tile " + this.id + " is selected");
				tileborders[this.id[0]][this.id[1]].setAttrs({stroke: 'yellow'});
			}
			tileLayer.draw();
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
					// console.log('Drawing tile ' + x + ', ' + y);
					// At the moment every tile is drawn the same
					// This would be where you check to see what tile should be drawn
					boardtiles[x][y].setImage(images.grass);
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
for (var p = 0; p < 2; p++) {
	for (var n = 0; n < 5; n++) {
		unitborders[p][n] = new Kinetic.Rect({
			x: boardstartx+(p*4)*tilesize+1,
			y: boardstarty+n*tilesize+1,
			width: tilesize-2,
			height: tilesize-2,
			stroke: 'blue',
			strokeWidth: 1
		});
		unitimages[p][n] = new Kinetic.Image({
			x: boardstartx+(p*4)*tilesize,
			y: boardstarty+n*tilesize,
			image: images.spritesheet,
			width: tilesize,
			height: tilesize,
			crop: {
				x: 64*n,
				y: 64*n,
				width: 64,
				height: 64
			}
		});
		unitimages[p][n].id = [p,n];	// we use this to help us figure out which unit is being clicked (see below)

		// code for buttons
		unitimages[p][n].on('mouseover', function() {
			document.body.style.cursor = 'pointer';
		});
		unitimages[p][n].on('mouseout', function() {
			document.body.style.cursor = 'default';
		});
		unitimages[p][n].on('click', function(evt) {
			if (selectedunit == this.id) {
				selectedunit = [-1,-1];
				console.log("no unit selected");
				unitborders[this.id[0]][this.id[1]].setAttrs({stroke: 'blue'});
			}
			else {
				selectedunit = this.id;
				console.log("unit " + this.id[1] + " of player " + (this.id[0]+1) + " is selected");
				unitborders[this.id[0]][this.id[1]].setAttrs({stroke: 'yellow'});
			}
			unitLayer.draw();
		});
		
		unitLayer.add(unitborders[p][n]);
		unitLayer.add(unitimages[p][n]);
	}
}
stage.add(unitLayer);

function unitrefresh() {
	for (var p = 0; p < 2; p++) {
		for (var n = 0; n < 5; n++) {
			if (unitimages[p][n]) {
				if (unitimages[p][n]) {
					// adjust unit image appropriately
					
					// adjust position/tile
					unitborders[p][n].setAttrs({
						x: boardstartx + units[p][n].position[0]*tilesize + 1,
						y: boardstarty + units[p][n].position[1]*tilesize + 1
					});
					unitimages[p][n].setAttrs({
						x: boardstartx + units[p][n].position[0]*tilesize,
						y: boardstarty + units[p][n].position[1]*tilesize
					});
					// change sprite
					unitimages[p][n].setAttrs({crop: spriteloc[units[p][n].id]});
				}
			}
		}
	}
	unitLayer.draw();
}
unitrefresh();



// Socket commands to communicate with server
// emit - send to server
// on - executes on receiving from server

//socket.emit('talk', {'string': "HI SHELLEY!"});
socket.on('playersfull', function(data) {
	console.log('Server is full.');
});