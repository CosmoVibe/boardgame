// General utility functions //

// clone(obj) - returns a clone of the objects (cannot be a cyclic or recursive object)
function clone(obj) {
	var copy;

	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;

	// Handle Date
	if (obj instanceof Date) {
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Array
	if (obj instanceof Array) {
		copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = clone(obj[i]);
		}
		return copy;
	}

	// Handle Object
	if (obj instanceof Object) {
		copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
		}
		return copy;
	}

	throw new Error("Unable to copy obj! Its type isn't supported.");
}




// Game utility functions //

// occupied(x,y) - determines whether or not the tile is occupied by a character
// returns 0 for no character, 1 for a character of player 1, and 2 for a character of player 2
function occupied(x,y) {
	for (var k = 0; k < 5; k++) {
		if (units[1][k].position[0] === x && units[1][k].position[1] === y) return 1;
		else if (units[2][k].position[0] === x && units[2][k].position[1] === y) return 2;
	}
	return 0;
}




// Tile functions //

// boardrefresh() - refreshes the tile images and redraws them
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

// resettileselection() - resets the selected tile
function resettileselection() {
	if (selectedtile[0] != -1) {
		tileborders[selectedtile[0]][selectedtile[1]].setAttrs({stroke: 'black'});
		selectedtile = [-1,-1];
		tileLayer.draw();
	}
}

// highlighttile(x,y,color) - highlights the tile at (x,y) with a color (still need to manually draw)
function highlighttile(x,y,color) {
	if (x < mapx && x >= 0 && y < mapy && y >= 0) {
		tilehighlights[x][y].show();
		if (color) tilehighlights[x][y].setAttrs({fill: color});
	}
}

// resethighlightedtiles() - reset tile highlights (still need to draw)
function resethighlightedtiles() {
	for (var x = 0; x < mapx; x++) {
		for (var y = 0; y < mapy; y++) {
			tilehighlights[x][y].hide();
		}
	}
}




// Unit functions //


// unitrefresh() - refreshes the unit images and redraws them
function unitrefresh() {
	for (var p = 1; p <= 2; p++) {
		for (var n = 0; n < 5; n++) {
			if (unitimages[p][n]) {
				if (unitimages[p][n]) {
					// adjust unit image appropriately

					// change sprite
					unitimages[p][n].setAttrs({crop: idsprite(units[p][n].id)});
					uniticonimages[p][n].setAttrs({crop: idsprite(units[p][n].id)});
					
					// update borders
					unitborders[p][n].setAttrs({stroke: (p === playernum ? 'blue' : 'red')});
					uniticonborders[p][n].setAttrs({stroke: (p === playernum ? 'blue' : 'red')});
					
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

// resetunitselection() - resets unit selection
function resetunitselection() {
	if (selectedunit[0] != -1) {
		unitborders[selectedunit[0]][selectedunit[1]].setAttrs({stroke: (selectedunit[0] === playernum ? 'blue' : 'red')});
		uniticonborders[selectedunit[0]][selectedunit[1]].setAttrs({stroke: (selectedunit[0] === playernum ? 'blue' : 'red')});
		selectedunit = [-1,-1];
		unitLayer.draw();
	}
}




// Skill menu functions //

// resetmenugroup() - resets state and button border color (still need to manually redraw)
function resetmenugroup() {
	selectedaction = -1;
	movementButtonBox.setAttrs({stroke: 'black'});
	skillButtonBox.setAttrs({stroke: 'black'});
}




// Information/detail layer functions //

// showInfo() - loads and displays details on infoLayer for the selected tile/unit
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

// hideInfo() - hides the infoLayer details for the selected tile/unit
function hideInfo() {
	infoGroup.hide();
	infoLayer.draw();
}