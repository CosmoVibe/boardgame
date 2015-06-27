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
			stroke: (selectedunit[0] === playernum ? 'blue' : 'red'),
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
			stroke: (selectedunit[0] === playernum ? 'blue' : 'red'),
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


var buttonsX = 2;
var buttonsY = 3;
var maxButtons = buttonsX * buttonsY;
var skillButtonWidth = 220;
var skillButtonHeight = 40;
var skillButtonGap = 3;

var skillButtons = [];
var skillButtonsBox = [];
var skillButtonsText = [];

for (var k = 0; k < maxButtons; k++) {
	skillButtons[k] = new Kinetic.Group({
		x: Math.floor(k/buttonsY)*(skillButtonGap + skillButtonWidth) + skillButtonGap,
		y: (k%buttonsY)*(skillButtonGap + skillButtonHeight) + skillButtonGap
	});
	skillButtonsBox[k] = new Kinetic.Rect({
		width: skillButtonWidth,
		height: skillButtonHeight,
		x: 0,
		y: 0,
		stroke: 'black',
		strokeWidth: 2,
		fill: '#CCCCCC'
	});
	skillButtonsText[k] = new Kinetic.Text({
		x: skillButtonWidth/2,
		y: skillButtonHeight/2,
		text: 'move',
		fontSize: 20,
		fontFamily: 'Calibri',
		fill: 'black'
	});
	skillButtonsText[k].offset({x: skillButtonsText[k].width()/2, y: skillButtonsText[k].height()/2});
	skillButtons[k].add(skillButtonsBox[k]);
	skillButtons[k].add(skillButtonsText[k]);
	skillButtonsText[k].moveToTop();
	
	skillButtons[k].id = k;
	skillButtons[k].on('mouseover', function() {
		document.body.style.cursor = 'pointer';
	});
	skillButtons[k].on('mouseout', function() {
		document.body.style.cursor = 'default';
	});
	skillButtons[k].on('click', function(evt) {
		skillButtonsClick(this.id);
	});

	menugroup.add(skillButtons[k]);
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