// Client variables

var gamestarted = false;
var playernum = -1;
var currentturn = 0;

var selectedunit = [-1,-1];
var selectedtile = [-1,-1];
var selectedaction = -1;	// 0 means movement, 1+ means skill



// Game state variables //

// this is what the unit information should sort of look like
// in order to make your server logic work, feel free to change this however you like, just keep in mind that it needs to be as modular as possible
var units = [];
units[1] = [
	{
		id: 0,	// fighter
		position: [0,0],
		name: 'Fighter',
		maxhp: 200,
		hp: 200,
		strength: 40,
		maxenergy: 3,
		energy: 3,
		movecost: 1,
		skills: [
			{
				name: 'Attack',
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
			{
				name: 'Bullet Punch',
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
		],
		
		// this is a cosmetic description, server logic doesn't have to worry about this property
		// however, it does describe the role of each character, so you could use this to help yourself understand the game better
		description: 'A tough unit whose job is to brute force his way into the enemy team and dish out heavy damage.\n\n' +
			'- The Bullet Punch skill does an extremely high amount of damage. Zone the opponent by threatening the tile they plan on landing on.\n' +
			"- Try to get up close to priority targets to take them down quickly, but don't go so far in that you get surrounded and overwhelmed."
	},
	{
		id: 1,	// rogue
		position: [0,1],
		name: 'Rogue',
		maxhp: 170,
		hp: 150,
		strength: 30,
		maxenergy: 5,
		energy: 2,
		movecost: 1,
		skills: [
			{
				name: 'Attack',
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
			{
				// This passive allows this unit to move diagonally (see range test)
				name: 'Swiftness',
				cost: 0,
				target: 'passive',
				toggle: true,
				toggleable: false,
				action: [
					{
						type: 'movement',
						// this will return true if the direction of movement is legal
						range: function(dir) {
							if (dir[0] <= 1 && dir[0] >= -1 && dir[1] <= 1 && dir[1] >= -1) return true;
							else return false;
						}
					}
				]
			},
		],
		
		description: 'A fast-moving unit that weaves in and out of combat, dishing out constant damage while avoiding being hit.\n\n' +
			'- Try to leave yourself enough energy to move away from the opponent after attacking, keeping your unit safe from damage.\n'+
			'- Because the passive allows diagonal movement, use that to flee from opponents, leaving ally units in front to block the chase.'
	},
	{
		id: 2,	// tank
		position: [0,2],
		name: 'Tank',
		maxhp: 250,
		hp: 250,
		strength: 30,
		maxenergy: 3,
		energy: 3,
		movecost: 1,
		skills: [
			{
				name: 'Attack',
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
			{
				name: 'Bash',
				cost: 2,
				target: 'enemy unit',
				range: function(dir) {
					if (dir[0] === 0 && (dir[1] === 1 || dir[1] === -1)) return true;
					else if (dir[1] === 0 && (dir[0] === 1 || dir[0] === -1)) return true;
					else return false;
				},
				action: [
					{
						type: 'debuff',
						debuff: 'stun',
						duration: 1
					}
				]
			},
		],

		description: 'A heavy unit whose role is to lock down enemy units, setting them up for the team to surround them.\n\n' +
			'- Try to stun high priority targets. Enemy units who are the most threatening are usually worthwhile to stun.\n' +
			"- Don't worry so much about the damage you take. This unit has a high amount of HP and isn't useful for much other than disrupting the enemy team."
	},
	{
		id: 3,	// mage
		position: [0,3],
		name: 'Mage',
		maxhp: 120,
		hp: 120,
		strength: 40,
		maxenergy: 3,
		energy: 3,
		movecost: 1,
		skills: [
			{
				name: 'Attack',
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
			{
				name: 'Meteor',
				cost: 2,
				target: 'tile',
				range: function(dir) {
					if (Math.abs(dir[0]) + Math.abs(dir[1]) === 2) return true;
					else return false;
				},
				action: [
					{
						type: 'damage',
						ratio: 1.75
					}
				]
			},
		],

		description: 'A heavy damage dealing ranged unit, capable of destroying entire teams if left untouched.\n\n' +
			'- Keep your allies in front of this unit in order to protect it. The amount of damage dealt by this unit adds up very fast if left unchecked.\n'+
			'- The Meteor skill targets a tile, not a unit. Be careful not to hurt your own allies!'
	},
	{
		id: 4,	// support
		position: [0,4],
		name: 'Support',
		maxhp: 130,
		hp: 130,
		strength: 20,
		maxenergy: 3,
		energy: 3,
		movecost: 1,
		skills: [
			{
				name: 'Attack',
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
			{
				name: 'Heal',
				cost: 2,
				target: 'ally unit',
				range: function(dir) {
					if (dir[0] <= 1 && dir[0] >= -1 && dir[1] <= 1 && dir[1] >= -1) return true;
					else return false;
				},
				action: [
					{
						type: 'heal',
						amount: 20
					}
				]
			},
		],

		description: 'A unit whose strength lies in assisting teammates and keeping them alive and healthy.\n\n' +
			"- This unit's stats are quite poor, so it should just stay in the back healing while being protected by allies.\n" +
			'- In addition to having poor stats, this unit is unable to heal itself. Therefore, it should not be the last unit standing, protecting allies even at the cost of its own life.\n'
	}
];
units[2] = [
	{
		id: 2,	// tank
		position: [4,2],
		name: 'Tank',
		maxhp: 250,
		hp: 250,
		strength: 30,
		maxenergy: 3,
		energy: 3,
		movecost: 1,
		skills: {},
		description: ''
	},
	{
		id: 1,	// rogue
		position: [4,1],
		name: 'Rogue',
		maxhp: 170,
		hp: 150,
		strength: 30,
		maxenergy: 5,
		energy: 5,
		movecost: 1,
		skills: {},
		description: ''
	},
	{
		id: 0,	// fighter
		position: [4,0],
		name: 'Fighter',
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
		},
		description: ''
	},
	{
		id: 4,	// support
		position: [4,4],
		name: 'fighter',
		maxhp: 130,
		hp: 130,
		strength: 20,
		maxenergy: 3,
		energy: 3,
		movecost: 1,
		skills: {},
		description: ''
	},
	{
		id: 3,	// mage
		position: [4,3],
		name: 'Mage',
		maxhp: 120,
		hp: 120,
		strength: 40,
		maxenergy: 3,
		energy: 3,
		movecost: 1,
		skills: {},
		description: ''
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
var boardtileimages = [];
var tileborders = [];
var tilehighlights = [];
for (var x = 0; x < mapx; x++) {
	boardtiles[x] = [];
	boardtileimages[x] = [];
	tileborders[x] = [];
	tilehighlights[x] = [];
	for (var y = 0; y < mapy; y++) {
		boardtiles[x][y] = new Kinetic.Group({x: x*tilesize, y: y*tilesize});
		
		tileborders[x][y] = new Kinetic.Rect({
			x: 0,
			y: 0,
			width: tilesize,
			height: tilesize,
			stroke: 'black',
			strokeWidth: 1
		});
		tilehighlights[x][y] = new Kinetic.Rect({
			x: 0,
			y: 0,
			width: tilesize,
			height: tilesize,
			strokeWidth: 0,
			fill: 'yellow',
			opacity: 0.4,
			visible: false
		});
		boardtileimages[x][y] = new Kinetic.Image({
			x: 0,
			y: 0,
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

		boardtiles[x][y].add(tileborders[x][y]);
		boardtiles[x][y].add(boardtileimages[x][y]);
		boardtiles[x][y].add(tilehighlights[x][y]);
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
					boardtileimages[x][y].setImage(images.grass);
				}
			}
		}
	}
	tileLayer.draw();
}
boardrefresh();

// resets the selected tile
function resettileselection() {
	if (selectedtile[0] != -1) {
		tileborders[selectedtile[0]][selectedtile[1]].setAttrs({stroke: 'black'});
		selectedtile = [-1,-1];
		tileLayer.draw();
	}
}

// highlights the tile (still need to draw)
function highlighttile(x,y,color) {
	if (x < mapx && x >= 0 && y < mapy && y >= 0) {
		tilehighlights[x][y].show();
		if (color) tilehighlights[x][y].setAttrs({fill: color});
	}
}
// reset tile highlights (still need to draw)
function resethighlightedtiles() {
	for (var x = 0; x < mapx; x++) {
		for (var y = 0; y < mapy; y++) {
			tilehighlights[x][y].hide();
		}
	}
}


// Draw Units //

// unit overall button
var unitbuttons = [];
unitbuttons[1] = [];
unitbuttons[2] = [];
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
// unit hp bars
var unitHPbar = [];
unitHPbar[1] = [];
unitHPbar[2] = [];
var unitHPbarbg = [];
unitHPbarbg[1] = [];
unitHPbarbg[2] = [];

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
		unitHPbar[p][n] = new Kinetic.Rect({
			x: 340+n*(tilesize+10),
			y: 50+(p-1)*(tilesize+10)+60,
			width: tilesize,
			height: 4,
			fill: '#00FF00',
			strokeWidth: 0
		});
		unitHPbarbg[p][n] = new Kinetic.Rect({
			x: 340+n*(tilesize+10),
			y: 50+(p-1)*(tilesize+10)+60,
			width: tilesize,
			height: 4,
			fill: '#FF3300',
			strokeWidth: 0
		});
		
		unitbuttons[p][n].add(unitborders[p][n]);
		unitbuttons[p][n].add(unitimages[p][n]);
		unitbuttons[p][n].add(uniticonborders[p][n]);
		unitbuttons[p][n].add(uniticonimages[p][n]);
		unitbuttons[p][n].add(unitHPbarbg[p][n]);
		unitbuttons[p][n].add(unitHPbar[p][n]);
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

					// change sprite
					unitimages[p][n].setAttrs({crop: idsprite(units[p][n].id)});
					uniticonimages[p][n].setAttrs({crop: idsprite(units[p][n].id)});
					
					// adjust position/tile
					unitborders[p][n].setAttrs({
						x: boardstartx + units[p][n].position[0]*tilesize + 1,
						y: boardstarty + units[p][n].position[1]*tilesize + 1
					});
					unitimages[p][n].setAttrs({
						x: boardstartx + units[p][n].position[0]*tilesize,
						y: boardstarty + units[p][n].position[1]*tilesize
					});
					
					// update health bars
					unitHPbar[p][n].setAttrs({width: (units[p][n].hp/units[p][n].maxhp)*tilesize});
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





// Info layer

var infoGroup = new Kinetic.Group({x: 10, y: 340});
var infoBox = new Kinetic.Rect({
	width: 780,
	height: 250,
	x: 0,
	y: 0,
	strokeWidth: 2,
	fill: '#CCCCCC'
});
infoGroup.add(infoBox);

var infoUnitIcon = new Kinetic.Image({
	x: 10,
	y: 10,
	image: images.spritesheet,
	width: tilesize,
	height: tilesize
});
infoGroup.add(infoUnitIcon);

var infoHPbar = new Kinetic.Rect({
	x: 10,
	y: 84,
	width: tilesize,
	height: 6,
	fill: '#00FF00',
	strokeWidth: 0
});
var infoHPbarbg = new Kinetic.Rect({
	x: 10,
	y: 84,
	width: tilesize,
	height: 6,
	fill: '#FF3300',
	strokeWidth: 0
});
infoGroup.add(infoHPbarbg);
infoGroup.add(infoHPbar);

var infoEnergyBar = new Kinetic.Rect({
	x: 10,
	y: 94,
	width: tilesize,
	height: 6,
	fill: '#FFFF00',
	strokeWidth: 0
});
var infoEnergyBarbg = new Kinetic.Rect({
	x: 10,
	y: 94,
	width: tilesize,
	height: 6,
	fill: '#000099',
	strokeWidth: 0
});
infoGroup.add(infoEnergyBarbg);
infoGroup.add(infoEnergyBar);

var infoNameText = new Kinetic.Text({
	x: 84,
	y: 10,
	text: 'Name',
	fontSize: 18,
	fontFamily: 'Calibri',
	fill: 'black'
});
infoGroup.add(infoNameText);

var infoPositionText = new Kinetic.Text({
	x: 84,
	y: 40,
	text: 'Position:',
	fontSize: 14,
	fontFamily: 'Calibri',
	fill: 'black'
});
infoGroup.add(infoPositionText);

var infoHPText = new Kinetic.Text({
	x: 84,
	y: 40 + 20,
	text: 'HP: x/y',
	fontSize: 14,
	fontFamily: 'Calibri',
	fill: 'black'
});
infoGroup.add(infoHPText);

var infoEnergyText = new Kinetic.Text({
	x: 84,
	y: 40 + 40,
	text: 'Energy:',
	fontSize: 14,
	fontFamily: 'Calibri',
	fill: 'black'
});
infoGroup.add(infoEnergyText);

var infoStrengthText = new Kinetic.Text({
	x: 84,
	y: 40 + 60,
	text: 'Strength:',
	fontSize: 14,
	fontFamily: 'Calibri',
	fill: 'black'
});
infoGroup.add(infoStrengthText);

var infoMovementCostText = new Kinetic.Text({
	x: 84,
	y: 40 + 80,
	text: 'Movement Cost:',
	fontSize: 14,
	fontFamily: 'Calibri',
	fill: 'black'
});
infoGroup.add(infoMovementCostText);

var infoDescriptionText = new Kinetic.Text({
	x: 280,
	y: 40,
	text: 'Description',
	fontSize: 13,
	fontFamily: 'Calibri',
	fill: 'black',
	width: 450
});
infoGroup.add(infoDescriptionText);


infoLayer.add(infoGroup);
infoGroup.hide();
stage.add(infoLayer);

function showInfo() {
	// load info
	infoUnitIcon.setAttrs({crop: idsprite(units[selectedunit[0]][selectedunit[1]].id)});
	infoHPbar.setAttrs({width: tilesize*(units[selectedunit[0]][selectedunit[1]].hp / units[selectedunit[0]][selectedunit[1]].maxhp)});
	infoEnergyBar.setAttrs({width: tilesize*(units[selectedunit[0]][selectedunit[1]].energy / units[selectedunit[0]][selectedunit[1]].maxenergy)});

	infoNameText.setAttrs({text: units[selectedunit[0]][selectedunit[1]].name});
	infoPositionText.setAttrs({text: 'Position: ' + units[selectedunit[0]][selectedunit[1]].position[0] + ',' + units[selectedunit[0]][selectedunit[1]].position[1]});
	infoHPText.setAttrs({text: 'HP: ' + units[selectedunit[0]][selectedunit[1]].hp + '/' + units[selectedunit[0]][selectedunit[1]].maxhp});
	infoEnergyText.setAttrs({text: 'Energy: ' + units[selectedunit[0]][selectedunit[1]].energy + '/' + units[selectedunit[0]][selectedunit[1]].maxenergy});
	infoStrengthText.setAttrs({text: 'Strength: ' + units[selectedunit[0]][selectedunit[1]].strength});
	infoMovementCostText.setAttrs({text: 'Movement Cost: ' + units[selectedunit[0]][selectedunit[1]].movecost});
	infoDescriptionText.setAttrs({text: units[selectedunit[0]][selectedunit[1]].description});
	
	// display info
	infoGroup.show();
	infoLayer.draw();
}
function hideInfo() {
	infoGroup.hide();
	infoLayer.draw();
}