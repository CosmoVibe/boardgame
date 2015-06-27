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

// funcDirSearch(func) - all of the tile coordinates are passed into func, and if returned true, are added to the return array
// the input of func is dir, the DIFFERENCE between the selected unit's position and the coordinate
function funcDirSearch(func) {
	console.log(func);
	var arr = [];
	for (var x = 0; x < mapx; x++) {
		for (var y = 0; y < mapy; y++) {
			if (func([selectedUnit().position[0]-x,selectedUnit().position[1]-y])) arr.push([x,y]);
		}
	}
	return arr;
}

// selectedUnit() - returns the currently selected unit
function selectedUnit() {
	if (selectedUnitIndex[0] != -1) return units[selectedUnitIndex[0]][selectedUnitIndex[1]];
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
	if (selectedTileIndex[0] != -1) {
		tileborders[selectedTileIndex[0]][selectedTileIndex[1]].setAttrs({stroke: 'black'});
		selectedTileIndex = [-1,-1];
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
	if (selectedUnitIndex[0] != -1) {
		unitborders[selectedUnitIndex[0]][selectedUnitIndex[1]].setAttrs({stroke: (selectedUnitIndex[0] === playernum ? 'blue' : 'red')});
		uniticonborders[selectedUnitIndex[0]][selectedUnitIndex[1]].setAttrs({stroke: (selectedUnitIndex[0] === playernum ? 'blue' : 'red')});
		selectedUnitIndex = [-1,-1];
		unitLayer.draw();
	}
}




// Skill menu functions //

// resetmenugroup() - resets state and button border color (still need to manually redraw)
function resetmenugroup() {
	selectedActionIndex = -1;
	for (var k = 0; k < skillButtons.length; k++) {
		skillButtonsBox[k].setAttrs({stroke: 'black'});
	}
}

// showkButtons(k) - hides buttons past a count of n
function showkButtons(k) {
	for (var n = k+1; n < skillButtons.length; n++) {
		skillButtons[n].hide();
	}
	menuLayer.draw();
}




// Information/detail layer functions //

// showInfo() - loads and displays details on infoLayer for the selected tile/unit
function showInfo() {
	// load info
	infoUnitIcon.setAttrs({crop: idsprite(selectedUnit().id)});
	infoHPbar.setAttrs({width: tilesize*(selectedUnit().hp / selectedUnit().maxhp)});
	infoEnergyBar.setAttrs({width: tilesize*(selectedUnit().energy / selectedUnit().maxenergy)});

	infoNameText.setAttrs({text: selectedUnit().name});
	infoPositionText.setAttrs({text: 'Position: ' + selectedUnit().position[0] + ',' + selectedUnit().position[1]});
	infoHPText.setAttrs({text: 'HP: ' + selectedUnit().hp + '/' + selectedUnit().maxhp});
	infoEnergyText.setAttrs({text: 'Energy: ' + selectedUnit().energy + '/' + selectedUnit().maxenergy});
	infoStrengthText.setAttrs({text: 'Strength: ' + selectedUnit().strength});
	infoMovementCostText.setAttrs({text: 'Movement Cost: ' + selectedUnit().movecost});
	infoDescriptionText.setAttrs({text: selectedUnit().description});
	
	// display info
	infoGroup.show();
	infoLayer.draw();
	
	// load skill buttons
	for (var k = 0; k < maxButtons; k++) {
		if (k === 0) {
			skillButtonsText[k].setAttrs({text: "Move"});
			skillButtonsText[k].offset({x: skillButtonsText[k].width()/2, y: skillButtonsText[k].height()/2});
		}
		else if (k <= selectedUnit().skills.length) {
			skillButtonsText[k].setAttrs({text: selectedUnit().skills[k-1].name});
			skillButtonsText[k].offset({x: skillButtonsText[k].width()/2, y: skillButtonsText[k].height()/2});
		}
		else {
			skillButtonsText[k].setAttrs({text: ''});
		}
	}	
	
	// display skill buttons
	showkButtons(selectedUnit().skills.length);
}

// hideInfo() - hides the infoLayer details for the selected tile/unit
function hideInfo() {
	infoGroup.hide();
	infoLayer.draw();
}