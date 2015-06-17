// Client variables
var selectedunit = [-1,-1];
var selectedtile = [-1,-1];
var gamestarted = false;
var playernum = -1;
var currentturn = 0;


// Game state variables //
var units = [];
units[1] = [
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
units[2] = [
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



// Layers //

// these layers should be in this display order from top to bottom
var overlayLayer = new Kinetic.Layer(); 	// draws buttons and info
var unitLayer = new Kinetic.Layer();	// draws the units
var tileLayer = new Kinetic.Layer();	// draws the tiles
var bgLayer = new Kinetic.Layer();	// draws bg



// background
var bg = new Kinetic.Rect({
	width: windowWidth,
	height: windowHeight,
	x: 0,
	y: 0,
	strokeWidth: 0,
	fill: '#EEEEEE'
});
bgLayer.add(bg);
stage.add(bgLayer);	// add layer to stage



// Overlay

// connection button
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

// confirm button
var confirmButton = new Kinetic.Group({x: 400, y: 100});
var confirmButtonBox = new Kinetic.Rect({
	width: 200,
	height: 40,
	x: 0,
	y: 0,
	stroke: 'black',
	strokeWidth: 2,
	fill: '#CCCCCC'
});
var confirmButtonText = new Kinetic.Text({
	x: confirmButtonBox.width()/2,
	y: confirmButtonBox.height()/2,
	text: 'ready',
	fontSize: 20,
	fontFamily: 'Calibri',
	fill: 'black'
});
confirmButtonText.offset({x: confirmButtonText.width()/2, y: confirmButtonText.height()/2});
confirmButton.add(confirmButtonBox);
confirmButton.add(confirmButtonText);
confirmButtonText.moveToTop();
overlayLayer.add(confirmButton);

stage.add(overlayLayer);	// add layer to stage


// Board Setup //
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
			// if a tile clicked is already highlighted, un-highlight it
			if (selectedtile == this.id) {
				selectedtile = [-1,-1];
				console.log("no tile selected");
				tileborders[this.id[0]][this.id[1]].setAttrs({stroke: 'black'});
			}
			// if a tile is clicked, highlight it (and un-highlight the previously selected unit)
			else {
				if (!selectedtile == [-1,-1]) tileborders[selectedtile[0]][selectedtile[1]].setAttrs({stroke: 'black'});
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
stage.add(tileLayer);	// add layer to stage

// refreshes the tile images and redraws them
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

// Draw Units //
var unitborders = [];
unitborders[1] = [];
unitborders[2] = [];
var unitimages = [];
unitimages[1] = [];
unitimages[2] = [];
for (var p = 1; p <= 2; p++) {
	for (var n = 0; n < 5; n++) {
		unitborders[p][n] = new Kinetic.Rect({
			x: boardstartx+((p-1)*4)*tilesize+1,
			y: boardstarty+n*tilesize+1,
			width: tilesize-2,
			height: tilesize-2,
			stroke: 'blue',
			strokeWidth: 1
		});
		unitimages[p][n] = new Kinetic.Image({
			x: boardstartx+((p-1)*4)*tilesize,
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
			// if a unit clicked is already highlighted, un-highlight it
			if (selectedunit == this.id) {
				selectedunit = [-1,-1];
				console.log("no unit selected");
				unitborders[this.id[0]][this.id[1]].setAttrs({stroke: 'blue'});
			}
			// if a unit is clicked, highlight it (and un-highlight the previously selected unit)
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
stage.add(unitLayer);	// add layer to stage

// refreshes the unit images and redraws them
function unitrefresh() {
	for (var p = 1; p <= 2; p++) {
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



// Button Code //

// connect button
// when a player connects to the server, this button puts the player into the game (assuming server isn't full)
connectButton.on('mouseover', function() {
	document.body.style.cursor = 'pointer';
});
connectButton.on('mouseout', function() {
	document.body.style.cursor = 'default';
});
connectButton.on('click', function(evt) {
	if (playernum == -1) socket.emit('confirmlogin',{});
});

// confirm button
// after a player is in the game, this button lets the server know the player is ready to start the game
// after game has started, the button ends the player's turn (if it is his turn)
confirmButton.on('mouseover', function() {
	document.body.style.cursor = 'pointer';
});
confirmButton.on('mouseout', function() {
	document.body.style.cursor = 'default';
});
confirmButton.on('click', function(evt) {
	if (gamestarted && playernum == currentturn) {
		socket.emit('endturn', {});
		console.log("it is not your turn");
		
		currentturn = (playernum == 1 ? 2 : 1);

		confirmButtonText.setAttrs({text: "opponent's turn"});
		confirmButtonText.offset({x: confirmButtonText.width()/2, y: confirmButtonText.height()/2});
		overlayLayer.draw();
	}
	else socket.emit('readyup',{});
});



// Server Events //

// player is notified he is in the game
socket.on('confirmlogin2', function(data) {
	playernum = data.player;
	console.log('you are player ' + playernum);
	// connect button changes appearance accordingly
	connectButtonBox.setAttrs({fill: '#66FF66'});
	connectButtonText.setAttrs({text: 'you are player ' + (data.player)});
	connectButtonText.offset({x: connectButtonText.width()/2, y: connectButtonText.height()/2});
	overlayLayer.draw();
});
// player is notified that server is full
socket.on('playersfull', function(data) {
	// connect button changes appearance accordingly
	connectButtonBox.setAttrs({fill: '#FF6666'});
	connectButtonText.setAttrs({text: 'server is full'});
	connectButtonText.offset({x: connectButtonText.width()/2, y: connectButtonText.height()/2});
	console.log('server is full');
	overlayLayer.draw();
});

// game has started
socket.on('startgame', function(data) {
	console.log('game started');
	gamestarted = true;
	// lets player know whose turn it is
	if (playernum == data.playerturn) {
		currentturn = playernum;
		
		console.log("it is your turn");
		// changes text of confirm button accordingly
		confirmButtonText.setAttrs({text: 'end turn'});
	}
	else {
		currentturn = (playernum == 1 ? 2 : 1);
		
		console.log("it is not your turn");		
		// changes text of confirm button accordingly
		confirmButtonText.setAttrs({text: "opponent's turn"});
	}
	confirmButtonText.offset({x: confirmButtonText.width()/2, y: confirmButtonText.height()/2});
	
	overlayLayer.draw();
});
// notifies player it is his turn
socket.on('yourturn', function(data) {
	console.log("it is your turn");
	currentturn = playernum;
	
	// changes text of confirm button accordingly
	confirmButtonText.setAttrs({text: 'end turn'});
	confirmButtonText.offset({x: confirmButtonText.width()/2, y: confirmButtonText.height()/2});
	overlayLayer.draw();
});