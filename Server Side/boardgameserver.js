//function for comparing arrays
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
} 

// socket.io
var io = require('socket.io').listen(8895);
// remove debug msgs
io.set('log level', 1);


// Global variables
var liveSockets = [];
var isReady = []; 
var nextUserID = 1;

// Server variables
var p1 = null;
var p2 = null;
var currentturn = 0;	// 0 means game is not underway, 1 means it is p1's turn, 2 means it is p2's turn
var ready = 0;			//keep track of when game has started. when ready == 2, game has started
var unitsRequired = require('./units.js');
var units = unitsRequired.units;
var serverUtility = require('./bgServerUtility.js'); 

// socket connection
io.sockets.on('connection', function(socket){
	var userID = nextUserID++;
	liveSockets[userID] = socket;
	console.log("New connection of ID " + userID);

	//end turn
	socket.on('endturn', function(data){
		if (((userID == p1) && (currentturn == 1)) || ((userID == p2) && (currentturn == 2)))
		{
			switch (currentturn)
			{
				case 0:
					console.log("Game has not started");
					break; 
				case 1:
					currentturn = 2;
					console.log("player 2's turn");
					module.exports.userID = p2;
					serverUtility.restoreAllEnergy(p2);
					liveSockets[p2].emit('yourturn', {}); 
					break; 
				case 2:
					currentturn = 1; 
					console.log("player 1's turn");
					module.exports.userID = p1;
					serverUtility.restoreAllEnergy(p1);
					liveSockets[p1].emit('yourturn', {}); 
					break;
			}
			serverUtility.emitUpdatedUnits();
		}
	});

	//ready up
	socket.on('readyup', function(data){
		//Ready up only if in game
		if (serverUtility.isInGame(userID))
		{
			if (ready < 2)
			{
				if (!isReady[userID])
				{
					isReady[userID] = 1; 
					console.log("User " + userID + " is ready.");
					ready++;  

					if (ready == 2)
					{
						console.log("Both players are ready. Game starts."); 
						currentturn = 1; 
						liveSockets[p1].emit("startgame", {'playerturn': '1'}); 
						liveSockets[p2].emit("startgame", {'playerturn': '1'}); 
					}
				}
				else
					console.log("User " + userID + " is already ready."); 	
			}
		}
		else
			console.log("UserID " + userID + " is not in game yet"); 
		
	}); 

	// Assigns 2 players to play
	socket.on('confirmlogin', function(data) {
		
		if (!p1)
		{
			p1 = userID;
			console.log("p1: " + p1 + ", p2: " + p2);
			socket.emit('confirmlogin2',{'player': '1'});
			console.log("Socket of ID " + userID + " has logged on."); 
		}
		else if (!p2)
		{
			p2 = userID;
			console.log("p1: " + p1 + ", p2: " + p2);
			socket.emit('confirmlogin2',{'player': '2'});
			console.log("Socket of ID " + userID + " has logged on.");
		}
		else
		{
			if (!((userID == p1) || (userID == p2)))
				socket.emit('playersfull', {});
		}
		module.exports.userID = p1;
		module.exports.p1 = p1;
		module.exports.p2 = p2;
	});

	//playermove
	//socket.emit('playermove', {unit: 2, type: 'move'});
	//socket.emit('playermove', {type: 'skill', skill: 'attack', unit: 0, target: 0});
	socket.on('playermove', function(data) {

		var movementUtil = require('./movement.js');
		var skillUtil = require('./skills.js');  

		//movement variables
		var unit; 
		var type;
		var direction; 
		var name; 

		//check for player's turn
		if (serverUtility.isPlayersTurn(userID, currentturn))
		{
			//check for invalid move
			if (!serverUtility.isValidPlayerMove(data))
			{
				console.log("Invalid player move");
			}
			else
			{
				//check move type
				switch (data.type)
				{
					case ('move'):
					{
						if (movementUtil.processMovement(data))
						{
							console.log("Move processed");
							serverUtility.emitUpdatedUnits();
						}
						else
							console.log("Move not processed");
						break; 
					}
					case ('skill'):
					{
						if (skillUtil.isValidSkill(data))	//make sure name is valid and fields are not null
						{
							//socket.emit('update', {'units': units});
							var skillArray = skillUtil.getSkillArray(data.skill, data.unit);
							if (skillArray != null)
							{
								if (skillUtil.processSkillMove(data.unit, skillArray, data.target))
								{
									console.log("Skill processed");
									serverUtility.emitUpdatedUnits();
								}
								else
									console.log("Skill not processed"); 
							}
							else
								console.log("Skill name doesn't exist"); 
						}
						else 
							console.log("Name is null!");
						break; 
					}
				}
			}	
		}
		else
			console.log("It's not your turn!"); 
	});
	
	socket.on('disconnect', function(data) {
		console.log("Releasing socket of ID " + userID);
		delete liveSockets[userID];
	});
	module.exports.units = units;
	module.exports.liveSockets = liveSockets; 
});