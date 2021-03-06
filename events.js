// Button Code //


// method executed when tile is clicked
function tileclick(id) {
	// no unit selected
	if (selectedUnitIndex[0] === -1) {
		var fork = false;
		if (selectedTileIndex[0] != id[0] || selectedTileIndex[1] != id[1]) fork = true;
		
		resetmenugroup();
		resettileselection();
		resethighlightedtiles();
		// not clicking on highlighted tile
		if (fork) {
			selectedTileIndex = clone(id);
			console.log("the tile " + id + " is selected");
			tileborders[id[0]][id[1]].setAttrs({stroke: 'yellow'});
		}
	}
	// unit selected
	else {
		// no action selected
		if (selectedActionIndex === -1) {
			resetunitselection();
			resettileselection();
			resethighlightedtiles();

			selectedTileIndex = clone(id);
			console.log("the tile " + id + " is selected");
			tileborders[id[0]][id[1]].setAttrs({stroke: 'yellow'});

			resetmenugroup();
			menugroup.hide();
		}
		// action selected
		else {
		
			// unit and selection highlighted, tile clicked
			if (selectedUnitIndex[0] == playernum) {
				var success = false;
				// movement
				if (selectedActionIndex == 0) {
					// send move to server
					socket.emit('playermove', {
						unit: selectedUnitIndex[1],
						type: 'move',
						arg: {
							direction: [
								id[0]-units[playernum][selectedUnitIndex[1]].position[0],
								id[1]-units[playernum][selectedUnitIndex[1]].position[1]
							]
						}
					});
					// local client movement
					/*
					units[playernum][selectedUnitIndex[1]].position = clone(id);
					unitrefresh();
					*/
					success = true;
				}
				else {
					if (selectedUnit().skills[n-1].target === 'tile') {
						socket.emit('playermove', {
							unit: selectedUnitIndex[1],
							type: 'skill',
							index: n-1,
							arg: {
								tile: selectedTileIndex
							}
						});
						success = true;
					}
				}
				// reset and clear
				if (success) {
					resetmenugroup();
					menugroup.hide();
					menuLayer.draw();

					resettileselection();
					resethighlightedtiles();				
					resetunitselection();
					
					hideInfo();
				}
			}
		}
	}
	menuLayer.draw();
	unitLayer.draw();
	tileLayer.draw();
}


// method executed when unit is clicked
function unitclick(id) {
	// no unit selected
	if (selectedUnitIndex[0] === -1) {
		resetmenugroup();
		resettileselection();
		resethighlightedtiles();

		selectedUnitIndex = clone(id);
		// console.log("unit " + id[1] + " of player " + id[0] + " is selected");
		unitborders[id[0]][id[1]].setAttrs({stroke: 'yellow'});
		uniticonborders[id[0]][id[1]].setAttrs({stroke: 'yellow'});

		showInfo();
		if (selectedUnitIndex[0] === playernum) menugroup.show();
		else menugroup.hide();
	}
	// unit selected
	else {
		// no action selected
		if (selectedActionIndex === -1) {
			var fork = false;
			if (selectedUnitIndex[0] != id[0] || selectedUnitIndex[1] != id[1]) fork = true;

			resetmenugroup();
			resetunitselection();
			// not clicking on selected unit
			if (fork) {
				selectedUnitIndex = clone(id);
				// console.log("unit " + id[1] + " of player " + id[0] + " is selected");
				unitborders[id[0]][id[1]].setAttrs({stroke: 'yellow'});
				uniticonborders[id[0]][id[1]].setAttrs({stroke: 'yellow'});

				showInfo();
				if (selectedUnitIndex[0] === playernum) menugroup.show();
				else menugroup.hide();
			}
			// clicking on selected unit
			else {
				hideInfo();
				menugroup.hide();
			}
		}
		// action selected
		else {
			// click on unit after unit skill is selected
			var success = false;
			switch (selectedUnit().skills[n-1].target) {
				case 'unit':
					socket.emit('playermove', {
						unit: selectedUnitIndex[1],
						type: 'skill',
						index: n-1,
						arg: {
							target: id[1]
						}
					});
					success = true;
					break;
				case 'ally unit':
					if (id[0] === playernum) {
						socket.emit('playermove', {
							unit: selectedUnitIndex[1],
							type: 'skill',
							index: n-1,
							arg: {
								target: id[1]
							}
						});
						success = true;
					}
					break;
				case 'enemy unit':
					if (id[0] === (playernum === 1 ? 2 : 1) ) {
						socket.emit('playermove', {
							unit: selectedUnitIndex[1],
							type: 'skill',
							index: n-1,
							arg: {
								target: id[1]
							}
						});
						success = true;
					}
					break;
			}

			// reset and clear
			if (success) {
				resetmenugroup();
				menugroup.hide();
				menuLayer.draw();

				resettileselection();
				resethighlightedtiles();				
				resetunitselection();
				
				hideInfo();
			}
		}
	}
	menuLayer.draw();
	unitLayer.draw();
	tileLayer.draw();
}


// method executed when a skill button is clicked
function skillButtonsClick(n) {
	// cancel skill by clicking on already highlighted button
	if (selectedActionIndex === n) {
		resetmenugroup();
		resethighlightedtiles();
		selectedActionIndex = -1;
	}
	else {
		resetmenugroup();
		resethighlightedtiles();
		
		// highlight tiles based on what skill was selected
		// (!) need a better method to figure out what to highlight. basic movement case used as placeholder
		if (n === 0) {
			// movement
			// in case this button is clicked without a unit selected
			if (selectedUnitIndex[0] != -1) {
				// highlight all of the available move locations
				var x = selectedUnit().position[0];
				var y = selectedUnit().position[1];
				if (!occupied(x+1,y)) highlighttile(x+1,y, 'yellow');
				if (!occupied(x-1,y)) highlighttile(x-1,y, 'yellow');
				if (!occupied(x,y+1)) highlighttile(x,y+1, 'yellow');
				if (!occupied(x,y-1)) highlighttile(x,y-1, 'yellow');

				skillButtonsBox[n].setAttrs({stroke: 'yellow'});
				selectedActionIndex = n;
			}
		}
		else {
			
			// in case the skill for this button doesn't exist
			if (selectedUnit().skills[n-1]) {

				// make sure the skill is not passive and toggleable
				var sel = true;
				if (selectedUnit().skills[n-1].target === 'passive') {
					if (!selectedUnit().skills[n-1].toggleable) sel = false;
				}
				if (sel) {
					skillButtonsBox[n].setAttrs({stroke: 'yellow'});
					selectedActionIndex = n;

					// first check what is targetable
					// then find what needs to be highlighted
					// finally highlight
					var tilearr = [];
					if (selectedUnit().skills[n-1].range) {
						for (var k = 0; k < selectedUnit().skills[n-1].range.length; k++) {
							tilearr[k] = [selectedUnit().position[0]+selectedUnit().skills[n-1].range[k][0],selectedUnit().position[1]+selectedUnit().skills[n-1].range[k][1]];
						}
					}
					switch (selectedUnit().skills[n-1].target) {
						case 'unit':
							for (var k = 0; k < tilearr.length; k++) {
								if (occupied(tilearr[k][0],tilearr[k][1]) != 0) highlighttile(tilearr[k][0],tilearr[k][1], 'red');
							}
							break;
						case 'enemy unit':
							for (var k = 0; k < tilearr.length; k++) {
								if (occupied(tilearr[k][0],tilearr[k][1]) === (playernum === 1 ? 2 : 1)) highlighttile(tilearr[k][0],tilearr[k][1], 'red');
							}
							break;
						case 'ally unit':
							for (var k = 0; k < tilearr.length; k++) {
								if (occupied(tilearr[k][0],tilearr[k][1]) === playernum) highlighttile(tilearr[k][0],tilearr[k][1], 'red');
							}
							break;
						case 'tile':
							for (var k = 0; k < tilearr.length; k++) {
								highlighttile(tilearr[k][0],tilearr[k][1], 'red');
							}
							break;
						case 'passive':
							break;
						default:
							break;
					}
				}
			}
		}
		
	}
	tileLayer.draw();
	menugroup.draw();
}


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
	}
	else {
		if (playernum != -1) {
			socket.emit('readyup',{});
			confirmButtonText.setAttrs({text: "ready"});
			confirmButtonText.offset({x: confirmButtonText.width()/2, y: confirmButtonText.height()/2});
		}
	}
	overlayLayer.draw();
});




// Server Events //

// player is notified he is in the game
socket.on('confirmlogin2', function(data) {
	playernum = parseInt(data.player);
	console.log('you are player ' + playernum);
	// connect button changes appearance accordingly
	connectButtonBox.setAttrs({fill: '#66FF66'});
	connectButtonText.setAttrs({text: 'you are player ' + (data.player)});
	connectButtonText.offset({x: connectButtonText.width()/2, y: connectButtonText.height()/2});
	// confirm button changes appearance accordingly
	confirmButtonText.setAttrs({text: "click to ready"});
	confirmButtonText.offset({x: confirmButtonText.width()/2, y: confirmButtonText.height()/2});

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
	unitrefresh();
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

// receiving update of board state
socket.on('update', function(data) {
	// need to copy received board state to client variables
	console.log('received updated');
	units = data.units;
	unitrefresh();
});



