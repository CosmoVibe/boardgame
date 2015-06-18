// Button Code //

// method executed when tile is clicked
function tileclick(id) {
	// if there is selected action taking place
	if (selectedaction === 1) {
		// if unit was selected, and move choice was made, send move to the server
	}
	else if (selectedaction == 0 && selectedunit[0] == playernum) {
		// send move to server
		socket.emit('playermove', {
			unit: selectedunit[1],
			type: 'move',
			arg: {
				direction: [
					id[0]-units[playernum][selectedunit[1]].position[0],
					id[1]-units[playernum][selectedunit[1]].position[1]
				]
			}
		});
		// clear selections
		resetmenugroup();
		menugroup.hide();
		menuLayer.draw();
		
		resettileselection();
		
		resetunitselection();
		
	}
	// if there is no selected action taking place
	else {
		// if a tile clicked is already highlighted, un-highlight it
		if (selectedtile == id) {
			resettileselection();
		}
		// if a tile is clicked, highlight it (and un-highlight the previously selected unit or tile)
		else {
			resetunitselection();
			
			// if unit was selected, but move choice was not, hide menu group
			resetmenugroup();
			menugroup.hide();
			menuLayer.draw();

			if (selectedtile[0] != -1) tileborders[selectedtile[0]][selectedtile[1]].setAttrs({stroke: 'black'});
			selectedtile = id;
			console.log("the tile " + id + " is selected");
			tileborders[id[0]][id[1]].setAttrs({stroke: 'yellow'});
		}
	}
	tileLayer.draw();
}


// method executed when unit is clicked
function unitclick(id) {
	// if there is selected action taking place
	if (selectedaction === 1) {
	}
	// if there is no selected action taking place
	else {
		// if a unit clicked is already highlighted, un-highlight it
		if (selectedunit == id) {
			console.log("no unit selected");
			resetunitselection();
			// in addition, remove the menu for move options
			resetmenugroup();
			menugroup.hide();
			menuLayer.draw();
		}
		// if a unit is clicked, highlight it (and un-highlight the previously selected unit or tile)
		else {
			resettileselection();
			
			if (selectedunit[0] != -1) unitborders[selectedunit[0]][selectedunit[1]].setAttrs({stroke: 'blue'});
			selectedunit = id;
			console.log("unit " + id[1] + " of player " + id[0] + " is selected");
			unitborders[id[0]][id[1]].setAttrs({stroke: 'yellow'});

			// in addition, if it is own unit, bring up the menu for move options, otherwise, hide it
			if (selectedunit[0] === playernum) {
				menugroup.show();
				resetmenugroup();
			}
			else menugroup.hide();
			menugroup.draw();
		}
	}
	unitLayer.draw();
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
		overlayLayer.draw();
	}
	else socket.emit('readyup',{});
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
	}
	else {
		selectedaction = 0;
		movementButtonBox.setAttrs({stroke: 'yellow'});
		skillButtonBox.setAttrs({stroke: 'black'});
	}
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
	}
	else {
		selectedaction = 1;
		skillButtonBox.setAttrs({stroke: 'yellow'});
		movementButtonBox.setAttrs({stroke: 'black'});
	}
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



// test functions

// V socket.emit('playermove', {unit: 0, type: 'move', arg: {direction: [1,0]}});
// V socket.emit('playermove', {unit: 1, type: 'move', arg: {direction: [-1,3]}});
// V socket.emit('playermove', {unit: 3, type: 'skill', arg: {name: 'dicks'}});
// V socket.emit('playermove', {unit: 4, type: 'skill', arg: {name: 405245}});
// I socket.emit('playermove', {unit: 2, type: 'move', arg: {direction: [1,0,4]}});
// I socket.emit('playermove', {unit: 3, type: 'move', arg: {name: 'hi'}});
// I socket.emit('playermove', {unit: 0, type: 'skill', arg: {direction: [1,0]}});
// I socket.emit('playermove', {unit: 5, type: 'move', arg: {direction: [1,0]}});
// I socket.emit('playermove', {type: 'move', arg: {direction: [1,0]}});
// I socket.emit('playermove', {unit: 2, type: 'move'});