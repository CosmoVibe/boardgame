// Button Code //


// method executed when tile is clicked
function tileclick(id) {
	// no unit selected
	if (selectedunit[0] === -1) {
		var fork = false;
		if (selectedtile[0] != id[0] || selectedtile[1] != id[1]) fork = true;
		
		resetmenugroup();
		resettileselection();
		resethighlightedtiles();
		// not clicking on highlighted tile
		if (fork) {
			selectedtile = clone(id);
			console.log("the tile " + id + " is selected");
			tileborders[id[0]][id[1]].setAttrs({stroke: 'yellow'});
		}
	}
	// unit selected
	else {
		// no action selected
		if (selectedaction === -1) {
			resetunitselection();
			resettileselection();
			resethighlightedtiles();

			selectedtile = clone(id);
			console.log("the tile " + id + " is selected");
			tileborders[id[0]][id[1]].setAttrs({stroke: 'yellow'});

			resetmenugroup();
			menugroup.hide();
		}
		// action selected
		else {
			// unit and selection highlighted, tile clicked

			// movement
			if (selectedaction == 0 && selectedunit[0] == playernum) {
				// send move to server
				/*socket.emit('playermove', {
					unit: selectedunit[1],
					type: 'move',
					arg: {
						direction: [
							id[0]-units[playernum][selectedunit[1]].position[0],
							id[1]-units[playernum][selectedunit[1]].position[1]
						]
					}
				});*/
				// local client movement
				units[playernum][selectedunit[1]].position = clone(id);
				unitrefresh();

				// clear selections
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

// method executed when unit is clicked
function unitclick(id) {
	// no unit selected
	if (selectedunit[0] === -1) {
		resetmenugroup();
		resettileselection();
		resethighlightedtiles();

		selectedunit = clone(id);
		// console.log("unit " + id[1] + " of player " + id[0] + " is selected");
		unitborders[id[0]][id[1]].setAttrs({stroke: 'yellow'});
		uniticonborders[id[0]][id[1]].setAttrs({stroke: 'yellow'});

		showInfo();
		if (selectedunit[0] === playernum) menugroup.show();
		else menugroup.hide();
	}
	// unit selected
	else {
		// no action selected
		if (selectedaction === -1) {
			var fork = false;
			if (selectedunit[0] != id[0] || selectedunit[1] != id[1]) fork = true;

			resetmenugroup();
			resetunitselection();
			// not clicking on selected unit
			if (fork) {
				selectedunit = clone(id);
				// console.log("unit " + id[1] + " of player " + id[0] + " is selected");
				unitborders[id[0]][id[1]].setAttrs({stroke: 'yellow'});
				uniticonborders[id[0]][id[1]].setAttrs({stroke: 'yellow'});

				showInfo();
				if (selectedunit[0] === playernum) menugroup.show();
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
		}
	}
	menuLayer.draw();
	unitLayer.draw();
	tileLayer.draw();
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
		socket.emit('readyup',{});
		confirmButtonText.setAttrs({text: "ready"});
		confirmButtonText.offset({x: confirmButtonText.width()/2, y: confirmButtonText.height()/2});
	}
	overlayLayer.draw();
});

// movement button
// once a unit is selected, the menu appears for this button
// once clicked, clicking a tile will send an emit out to the server, indicating a move
movementButton.on('mouseover', function() {
	document.body.style.cursor = 'pointer';
});
movementButton.on('mouseout', function() {
	document.body.style.cursor = 'default';
});
movementButton.on('click', function(evt) {
	if (selectedaction === 0) {
		resetmenugroup();
		resethighlightedtiles();
	}
	else {
		selectedaction = 0;
		movementButtonBox.setAttrs({stroke: 'yellow'});
		skillButtonBox.setAttrs({stroke: 'black'});
		// in case this button is clicked without a unit selected
		if (selectedunit[0] != -1) {
			// highlight all of the available move locations
			var x = units[selectedunit[0]][selectedunit[1]].position[0];
			var y = units[selectedunit[0]][selectedunit[1]].position[1];
			if (!occupied(x+1,y)) highlighttile(x+1,y, 'yellow');
			if (!occupied(x-1,y)) highlighttile(x-1,y, 'yellow');
			if (!occupied(x,y+1)) highlighttile(x,y+1, 'yellow');
			if (!occupied(x,y-1)) highlighttile(x,y-1, 'yellow');
		}
	}
	tileLayer.draw();
	menugroup.draw();
});

// skill button
// once a unit is selected, the menu appears for this button
// once clicked, clicking a tile or unit will send an emit out to the server, indicating a skill to be used
skillButton.on('mouseover', function() {
	document.body.style.cursor = 'pointer';
});
skillButton.on('mouseout', function() {
	document.body.style.cursor = 'default';
});
skillButton.on('click', function(evt) {
	if (selectedaction === 1) {
		resetmenugroup();
		resethighlightedtiles();
	}
	else {
		selectedaction = 1;
		skillButtonBox.setAttrs({stroke: 'yellow'});
		movementButtonBox.setAttrs({stroke: 'black'});
		if (selectedunit[0] != -1) {
			// highlight all of the available move locations
			var x = units[selectedunit[0]][selectedunit[1]].position[0];
			var y = units[selectedunit[0]][selectedunit[1]].position[1];
			if (occupied(x+1,y) === (playernum === 1 ? 2 : 1)) highlighttile(x+1,y, 'red');
			if (occupied(x-1,y) === (playernum === 1 ? 2 : 1)) highlighttile(x-1,y, 'red');
			if (occupied(x,y+1) === (playernum === 1 ? 2 : 1)) highlighttile(x,y+1, 'red');
			if (occupied(x,y-1) === (playernum === 1 ? 2 : 1)) highlighttile(x,y-1, 'red');
		}
	}
	tileLayer.draw();
	menugroup.draw();
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



