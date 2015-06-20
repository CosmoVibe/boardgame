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
var p1;
var p2;
var currentturn = 0;	// 0 means game is not underway, 1 means it is p1's turn, 2 means it is p2's turn
var ready = 0;			//keep track of when game has started. when ready == 2, game has started

//Holds the movements of both players of the game
var units = [];
//player 1 units
units[1] = [
    {
		id: 0,	// fighter
		position: [0,0],
		name: 'fighter',
		maxhp: 200,
		hp: 200,
		strength: 40,
		maxEnergy: 100,
		energy: 3,
		movecost: 1,
		skills: {
			attack: {
				cost: 1,
				target: 0,	//integer of the other player
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
        id: 1,
        position: [0,1]
    },
    {
        id: 2,
        position: [0,2]
    },
    {
        id: 3,
        position: [0,3]
    },
    {
        id: 4,
        position: [0,4]
    }
];
//player 2 units
units[2] = [
    {
        id: 5,
        position: [4,0]
    },
    {
        id: 6,
        position: [4,1]
    },
    {
        id: 7,
        position: [4,2]
    },
    {
        id: 8,
        position: [4,3]
    },
    {
        id: 9,
        position: [4,4]
    }
];

// socket connection
io.sockets.on('connection', function(socket) {
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
					liveSockets[p2].emit('yourturn', {}); 
					break; 
				case 2:
					currentturn = 1; 
					console.log("player 1's turn");
					liveSockets[p1].emit('yourturn', {}); 
					break;
			}
		}
	});

	//ready up
	socket.on('readyup', function(data){
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
	});

	//playermove
	socket.on('playermove', function(data) {

		//makes sure the user can only move left, right, up, or down
		function isValidDirection(direction){
			if ((direction[0] == -1) || (direction[0] == 1))
				return (direction[1] == 0);

			if ((direction[1] == -1) || (direction[1] == 1))
				return (direction[0] == 0);
		
			return false; 
		}

		//make sure the position is between [0, 0] and [4, 4]
		function isValidPosition(position) {
			return ((position[0] >= 0) && (position[1] >= 0) && (position[0] <= 4) && (position[1] <= 4));	
		}

		//ensure there are no collisions
		function isOverlapping(position){
			for (i = 0; i < units[1].length; i++)
			{
				if ((units[1][i].position.equals(position)) || (units[2][i].position.equals(position)))
				{ 
					return true; 
				}
			}
			return false; 
		}

		//assume the direction is already valid
		function movePosition(direction, unit) {
			var newPosition = [0, 0];	//initialize variable
			var index; 
			switch (userID)
			{
				case p1:
					index = 1; 
					break; 
				case p2:
					index = 2; 
					break; 
			}
			var temp = units[index][unit];
	 		newPosition[0] = direction[0] + temp.position[0];
	 		newPosition[1] = direction[1] + temp.position[1];

	 		if (!isValidPosition(newPosition))
	 			console.log("newPosition: " + newPosition + " is off the board");
	 		else if (isOverlapping(newPosition))	//overlapping position
	 			console.log("newPosition: " + newPosition + "is overlapping with another piece");
	 		else
	 			units[index][unit].position = newPosition; 
	 		
			return newPosition; 
		}

		//checks movement's energy level and movement cost level to see if it can move
		function hasMoveEnergy(unit)
		{
			if (unit.energy >= unit.movecost)
			{
				console.log("Movement granted");
				unit.energy = unit.energy - unit.movecost;
				return true;  
			}
			else
			{
				console.log("You don't have enough energy to move!");
				return false; 
			}
		}

		//make sure it's the player's turn
		function isPlayersTurn(userID, currentturn)
		{
			return (((userID == p1) && (currentturn == 1)) || ((userID == p2) && (currentturn == 2)));
		}

		//make sure it's a valid player move
		function isValidPlayerMove(data)
		{
			return ((data.unit != null) && ((data.type == 'move') || (data.type == 'skill')));
		}

		//has valid direction
		function hasValidDirection(data)
		{
			return ((data.arg) && (data.arg.direction != null)); 
		}

		//is valid skill
		function isValidSkill(data)
		{
			return ((data.arg) && (data.arg.name != null)); 	
		}

		//movement variables
		var unit; 
		var type;
		var direction; 
		var name; 

		//check for player's turn
		if (isPlayersTurn(userID, currentturn))
		{
			//check for invalid move
			if (!isValidPlayerMove(data))
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
						//has enough energy
						if (hasMoveEnergy(data.unit))
						{
							//make sure there's a valid direction
							if (hasValidDirection(data))
							{
								if (isValidDirection(data.arg.direction))
								{
									direction = data.arg.direction;
									var newPosition = movePosition(data.arg.direction, data.unit);  
									if (!isValidPosition(newPosition))
									{
										console.log("Invalid move! Your piece moved off the board!"); 
									}
									else
									{
										console.log("New position is " + newPosition);
										//let both players know what the move was
										liveSockets[p1].emit('update', {'units': units});
										liveSockets[p2].emit('update', {'units': units});  
									}
								}
								else
									console.log("Your direction isn't up, down, left, or right."); 
							}
							else 
								console.log("Direction is null!"); 
						}
						else 
							console.log("You don't have enough energy to move."); 
						break; 
					}
					case ('skill'):
					{
						if (isValidSkill(data))	//make sure name is valid
						{
							name = data.arg.name; 
							unit = data.unit;
							socket.emit('update', {'units': units});
							console.log("Valid player move (type skill)");
							console.log("Unit is " + unit);
							console.log("Type is " + data.type);
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
});