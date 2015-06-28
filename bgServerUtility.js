var boardgameserver = require('./boardgameserver.js');
var units = require('./units.js').units; 

	//will either return 1 or 2
	//used to easily access units[1] or units[2]
	function getUnitIndex(user_ID)
	{
		switch (user_ID)
		{
			case boardgameserver.p1:
				return 1;  
			case boardgameserver.p2:
				return 2;
		}
	}

	//will either return 1 or 2
	//used to easily access units[1] or units[2]
	function getEnemyUnitIndex(user_ID)
	{
		switch (user_ID)
		{
			case boardgameserver.p1:
				return 2;  
			case boardgameserver.p2:
				return 1;
		}
	}

	//send both players updated unit information
	function emitUpdatedUnits()
	{
		boardgameserver.liveSockets[boardgameserver.p1].emit('update', {'units': units});
		boardgameserver.liveSockets[boardgameserver.p2].emit('update', {'units': units});
	}

	//restore energy of player's units only
	function restoreAllEnergy(user_ID)
	{
		var myUnit = units[getUnitIndex(user_ID)]; 
		for (i = 0; i < myUnit.length; i++)
		{
			myUnit[i].energy = myUnit[i].maxenergy; 
		}
	}

	//make sure it's the player's turn
	function isPlayersTurn(userID, currentturn)
	{
		return (((userID == boardgameserver.p1) && (currentturn == 1)) || ((userID == boardgameserver.p2) && (currentturn == 2)));
	}

	//is the current player in the game?
	function isInGame(player)
	{
		return ((player == boardgameserver.p1) || (player == boardgameserver.p2));
	}

	//make sure it's a valid player move
	function isValidPlayerMove(data)
	{
		return ((data.unit != null) && ((data.type == 'move') || (data.type == 'skill')));
	}

module.exports.getUnitIndex = getUnitIndex;
module.exports.getEnemyUnitIndex = getEnemyUnitIndex;
module.exports.emitUpdatedUnits = emitUpdatedUnits;
module.exports.restoreAllEnergy = restoreAllEnergy;
module.exports.isPlayersTurn = isPlayersTurn;
module.exports.isInGame = isInGame; 
module.exports.isValidPlayerMove = isValidPlayerMove;