// Client variables
var selectedunit = [-1,-1];
var selectedtile = [-1,-1];
var gamestarted = false;
var playernum = -1;
var currentturn = 0;
var selectedaction = -1;	// 0 means movement, 1+ means skill


// Game state variables //
var units = [];
units[1] = [
	{
		id: 0,	// fighter
		position: [0,0],
		name: 'fighter',
		maxhp: 200,
		hp: 200,
		strength: 40,
		maxenergy: 3,
		energy: 3,
		movecost: 1,
		skills: {
			attack: {
				cost: 1,
				target: 'enemy unit',
				range: function(dir) {
					if (dir[0] === 0 && (dir[1] === 1 || dir[1] === -1)) return true;
					else if (dir[1] === 0 && (dir[0] === 1 || dir[0] === -1)) return true;
					else return false;
				},
				action: [
					{
						type: 'damage',
						ratio: 1
					}
				]
			},
			bash: {
				cost: 3,
				target: 'enemy unit',
				range: function(dir) {
					if (dir[0] === 0 && (dir[1] === 1 || dir[1] === -1)) return true;
					else if (dir[1] === 0 && (dir[0] === 1 || dir[0] === -1)) return true;
					else return false;
				},
				action: [
					{
						type: 'damage',
						ratio: 2.5
					}
				]
			},
		}
	},
	{
		id: 1,	// rogue
		position: [0,1]
	},
	{
		id: 2,	// tank
		position: [0,2]
	},
	{
		id: 3,	// mage
		position: [0,3]
	},
	{
		id: 4,	// support
		position: [0,4]
	}
];
units[2] = [
	{
		id: 2,
		position: [4,0]
	},
	{
		id: 1,
		position: [4,1]
	},
	{
		id: 0,
		position: [4,2]
	},
	{
		id: 4,
		position: [4,3]
	},
	{
		id: 3,
		position: [4,4]
	}
];



// Layers //

// these layers should be in this display order from top to bottom
var infoLayer = new Kinetic.Layer(); 	// draws buttons and info
var menuLayer = new Kinetic.Layer();	// draws menu box that holds button where players choose what the unit does
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
var connectButton = new Kinetic.Group({x: 340, y: 10});
var connectButtonBox = new Kinetic.Rect({
	width: 220,
	height: 30,
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
var confirmButton = new Kinetic.Group({x: 570, y: 10});
var confirmButtonBox = new Kinetic.Rect({
	width: 220,
	height: 30,
	x: 0,
	y: 0,
	stroke: 'black',
	strokeWidth: 2,
	fill: '#CCCCCC'
});
var confirmButtonText = new Kinetic.Text({
	x: confirmButtonBox.width()/2,
	y: confirmButtonBox.height()/2,
	text: '-',
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
var boardstartx = 10;
var boardstarty = 10;
var tilegroup = new Kinetic.Group({
	x: boardstartx,
	y: boardstarty
});
var mapx = 5;
var mapy = 5;
var tilesize = 64;
var boardtiles = [];
var tileborders = [];
for (var x = 0; x < mapx; x++) {
	boardtiles[x] = [];
	tileborders[x] = [];
	for (var y = 0; y < mapy; y++) {
		tileborders[x][y] = new Kinetic.Rect({
			x: x*tilesize,
			y: y*tilesize,
			width: tilesize,
			height: tilesize,
			stroke: 'black',
			strokeWidth: 1
		});
		boardtiles[x][y] = new Kinetic.Image({
			x: x*tilesize,
			y: y*tilesize,
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
		// at some point, we need to put this in a function to move the code somewhere that makes more sense
		boardtiles[x][y].on('click', function(evt) {
			tileclick(this.id);
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

function resettileselection() {
	if (selectedtile[0] != -1) {
		tileborders[selectedtile[0]][selectedtile[1]].setAttrs({stroke: 'black'});
		selectedtile = [-1,-1];
		tileLayer.draw();
	}
}



// Draw Units //

// units on the board
var unitborders = [];
unitborders[1] = [];
unitborders[2] = [];
var unitimages = [];
unitimages[1] = [];
unitimages[2] = [];
// unit icons for info
var uniticonborders = [];
uniticonborders[1] = [];
uniticonborders[2] = [];
var uniticonimages = [];
uniticonimages[1] = [];
uniticonimages[2] = [];
// unit overall button
var unitbuttons = [];
unitbuttons[1] = [];
unitbuttons[2] = [];

for (var p = 1; p <= 2; p++) {
	for (var n = 0; n < 5; n++) {
		unitbuttons[p][n] = new Kinetic.Group({});
		
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
		
		uniticonborders[p][n] = new Kinetic.Rect({
			x: 340+n*(tilesize+10),
			y: 50+(p-1)*(tilesize+10),
			width: tilesize,
			height: tilesize,
			stroke: 'blue',
			strokeWidth: 2
		});
		uniticonimages[p][n] = new Kinetic.Image({
			x: 340+n*(tilesize+10),
			y: 50+(p-1)*(tilesize+10),
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

		unitbuttons[p][n].add(unitborders[p][n]);
		unitbuttons[p][n].add(unitimages[p][n]);
		unitbuttons[p][n].add(uniticonborders[p][n]);
		unitbuttons[p][n].add(uniticonimages[p][n]);
		unitbuttons[p][n].id = [p,n];	// we use this to help us figure out which unit is being clicked (see below)
		
		
		// code for buttons
		unitbuttons[p][n].on('mouseover', function() {
			document.body.style.cursor = 'pointer';
		});
		unitbuttons[p][n].on('mouseout', function() {
			document.body.style.cursor = 'default';
		});
		// at some point, we need to put this in a function to move the code somewhere that makes more sense
		unitbuttons[p][n].on('click', function(evt) {
			unitclick(this.id);
		});
		
		unitLayer.add(unitbuttons[p][n]);
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
					unitimages[p][n].setAttrs({crop: idsprite(units[p][n].id)});
					uniticonimages[p][n].setAttrs({crop: idsprite(units[p][n].id)});
				}
			}
		}
	}
	unitLayer.draw();
}
unitrefresh();

// resets unit selection
function resetunitselection() {
	if (selectedunit[0] != -1) {
		unitborders[selectedunit[0]][selectedunit[1]].setAttrs({stroke: 'blue'});
		uniticonborders[selectedunit[0]][selectedunit[1]].setAttrs({stroke: 'blue'});
		selectedunit = [-1,-1];
		unitLayer.draw();
	}
}


// Selection layer
var menugroup = new Kinetic.Group({x: 340, y: 198});
var menubox = new Kinetic.Rect({
	width: 450,
	height: 330-198,
	x: 0,
	y: 0,
	strokeWidth: 2,
	fill: '#CCCCCC'
});
menugroup.add(menubox);

// move button
var movementButton = new Kinetic.Group({x: 3, y: 3});
var movementButtonBox = new Kinetic.Rect({
	width: 220,
	height: 40,
	x: 0,
	y: 0,
	stroke: 'black',
	strokeWidth: 2,
	fill: '#CCCCCC'
});
var movementButtonText = new Kinetic.Text({
	x: movementButtonBox.width()/2,
	y: movementButtonBox.height()/2,
	text: 'move',
	fontSize: 20,
	fontFamily: 'Calibri',
	fill: 'black'
});
movementButtonText.offset({x: movementButtonText.width()/2, y: movementButtonText.height()/2});
movementButton.add(movementButtonBox);
movementButton.add(movementButtonText);
movementButtonText.moveToTop();
menugroup.add(movementButton);

// skill button
var skillButton = new Kinetic.Group({x: 3, y: 3+40+3});
var skillButtonBox = new Kinetic.Rect({
	width: 220,
	height: 40,
	x: 0,
	y: 0,
	stroke: 'black',
	strokeWidth: 2,
	fill: '#CCCCCC'
});
var skillButtonText = new Kinetic.Text({
	x: skillButtonBox.width()/2,
	y: skillButtonBox.height()/2,
	text: 'skill',
	fontSize: 20,
	fontFamily: 'Calibri',
	fill: 'black'
});
skillButtonText.offset({x: skillButtonText.width()/2, y: skillButtonText.height()/2});
skillButton.add(skillButtonBox);
skillButton.add(skillButtonText);
skillButtonText.moveToTop();
menugroup.add(skillButton);


menuLayer.add(menugroup);
stage.add(menuLayer);	// add layer to stage
menugroup.hide();

// resets state and button border color
function resetmenugroup() {
	selectedaction = -1;
	movementButtonBox.setAttrs({stroke: 'black'});
	skillButtonBox.setAttrs({stroke: 'black'});
}