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

//Holds the movements of both players of the game
var units = [];
//player 1 units
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
		skills: {}
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
		skills: {}
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
		}
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
		skills: {}
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
		skills: {}
	}
];


// socket connection
io.sockets.on('connection', function(socket){
	var userID = nextUserID++;
	liveSockets[userID] = socket;
	console.log("New connection of ID " + userID);

	//will either return 1 or 2
		//used to easily access units[1] or units[2]
		function getUnitIndex(user_ID)
		{
			switch (user_ID)
			{
				case p1:
					return 1;  
				case p2:
					return 2;
			}
		}

		//will either return 1 or 2
		//used to easily access units[1] or units[2]
		function getEnemyUnitIndex(user_ID)
		{
			switch (user_ID)
			{
				case p1:
					return 2;  
				case p2:
					return 1;
			}
		}



	//send both players updated unit information
	function emitUpdatedUnits()
	{
		liveSockets[p1].emit('update', {'units': units});
		liveSockets[p2].emit('update', {'units': units});
	}

	//restore energy of all units
	function restoreAllEnergy()
	{
		for (i = 1; i <= 2; i++)
		{
			for (j = 0; j < units[i].length; j++)
				units[i][j].energy = units[i][j].maxenergy; 
		}
	}

	//make sure it's the player's turn
	function isPlayersTurn(userID, currentturn)
	{
		return (((userID == p1) && (currentturn == 1)) || ((userID == p2) && (currentturn == 2)));
	}

	//end turn
	socket.on('endturn', function(data){
		if (((userID == p1) && (currentturn == 1)) || ((userID == p2) && (currentturn == 2)))
		{
			restoreAllEnergy();
			emitUpdatedUnits();

			//refresh images
			//

			switch (currentturn)
			{
				case 0:
					console.log("Game has not started");
					break; 
				case 1:
					currentturn = 2;
					console.log("player 2's turn");
					module.exports.userID = p2;
					liveSockets[p2].emit('yourturn', {}); 
					break; 
				case 2:
					currentturn = 1; 
					console.log("player 1's turn");
					module.exports.userID = p1;
					liveSockets[p1].emit('yourturn', {}); 
					break;
			}
		}
	});

	//ready up
	socket.on('readyup', function(data){
		//console.log("Ready up: " + p1 + ", " + p2); 
		//if ((p1 != null) && (p2 != null))
		//{
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
		//}
		
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

			//make sure it's a valid player move
		function isValidPlayerMove(data)
		{
			return ((data.unit != null) && ((data.type == 'move') || (data.type == 'skill')));
		}

		





		//all functions for move

		var movementUtil = require('./movement.js'); 

		//movement ends here

		//skill variables

		//returns the index to the array of functions all skills


		//checks to see if the skill move 
		//unitPosition = position of your unit (coordinate)
		//targetPosition = position of the target (coordinate)
		function isWithinRange(unitPosition, targetPosition, range)
		{
			var distance = [0, 0];	//initialize variables
			distance[0] = unitPosition[0] - targetPosition[0];
			distance[1] = unitPosition[1] - targetPosition[1];
			console.log("unitPosition: " + unitPosition);
			console.log("targetPosition: " + targetPosition);
			console.log(distance); 
			console.log(range);
			console.log(range(distance)); 
			return (range(distance)); 
		}

		//functions for checking ranges
		var checkRange = [
				function(range, target, unitArray)	//enemy unit
				{
					var unitPosition = unitArray.position; 
					targetPosition = units[getEnemyUnitIndex(userID)][target].position;
					return (isWithinRange(unitPosition, targetPosition, range));  
				},
				function(range, target, unitArray)	//ally unit
				{
					var unitPosition = unitArray.position;
					targetPosition = units[getUnitIndex(userID)][target].position;
					return (isWithinRange(unitPosition, targetPosition, range));
				},
				function(range, target, unitArray)	//tile
				{
					var unitPosition = unitArray.position;	
					return (isWithinRange(unitPosition, target, range));
				}
		]; 

		//get index for checking ranges
		function getCheckRangeIndex(targetType)
		{
			switch(targetType)
			{
				case 'enemy unit':
					return 0; 
				case 'ally unit':
					return 1; 
				case 'tile':
					return 2; 
			}
		}

		//check to see if the move is within range
		//skillArray = skill array
		function isWithinRangeCheck(skillArray, target, unitArray)
		{
			var skillName = skillArray.name.toLowerCase();
			var targetType = skillArray.target; 
			console.log("Skill Name: " + skillName); 
			console.log("Target Type: " + targetType);

			var rangeIndex = getCheckRangeIndex(targetType);
			console.log("Range Index: " + rangeIndex); 
			console.log("Function: " + skillArray.range); 
			return (checkRange[rangeIndex](skillArray.range, target, unitArray));
		}

		//skillName = name of the skill (ex: "Attack") *case sensitive*
		function getAllActionsIndex(actionName)
		{
			switch (actionName)
			{
				case 'damage':
					return 0; 
				case 'movement':
					return 1; 
				case 'debuff':
					return 2; 
				case 'heal':
					return 3;
			}
		}

		var allActions = 
		[
			function (actionArray, unitArray, target)	//damage
				{
					var thisPosition = unitArray.position;
					var enemyUnit = units[getEnemyUnitIndex(userID)][target]; 
					var enemyPosition = enemyUnit.position; 
					console.log("My position: " + thisPosition);
					console.log("Enemy Position: " + enemyPosition);
					console.log("Range: " + skillArray.range);

					console.log("Skill is within range");
					console.log("Enemy HP Before: " + enemyUnit.hp); 
					var ratio = actionArray.ratio;
					console.log("Ratio: " + ratio);
					console.log("Strength: " + unitArray.strength);   
					var damage = unitArray.strength * ratio;
					console.log("Damage: " + damage); 
					enemyUnit.hp = enemyUnit.hp - damage; 
					console.log("Enemy HP After: " + enemyUnit.hp); 
				}
		]; 

		//is valid skill
		function isValidSkill(data)
		{
			return ((data.skill != null) && (data.unit != null) && (data.target != null)); 	
		}

		//get skill
		//unit is an index
		//skillName is name of the skill
		function getSkillArray(skillName, unit)
		{
			var index = getUnitIndex(userID);
			var skills = units[index][unit].skills; 
			for (i = 0; i < skills.length; i++)
			{
				if (skills[i].name.toUpperCase() == skillName.toUpperCase())
				{
					return (skills[i]); 
				}
			}
		}

		//has enough skill energy
		//unitArray = array of the unit
		//skill = skill array of the unit (not an index)
		function hasSkillEnergy(unitArray, skillArray)
		{
			console.log("Energy: " + unitArray.energy);
			console.log("Skill Array: " + skillArray); 
			console.log("Skill Cost: " + skillArray.cost); 

			if (unitArray.energy >= skillArray.cost)
			{
				console.log("Has enough energy to do skill");
				return true;
			}
			else
			{
				console.log("You don't have enough energy to move!");
				return false; 
			}
		}

		//process the skill move
		//returns true if processed, false if not
		//unit = index of the unit in array, units[]
		//skillArray = skill array
		function processSkillMove(unit, skillArray, target)
		{
			var unitIndex = getUnitIndex(userID);
			var unitArray = units[unitIndex][unit];

			if (hasSkillEnergy(unitArray, skillArray))
			{
				if (isWithinRangeCheck(skillArray, target, unitArray))
				{
					var actionArray = skillArray.action;
					console.log("Action array: " + actionArray); 
					for (i = 0; i < actionArray.length; i++)
					{
						var actionName = actionArray[i].type;
						var actionIndex = getAllActionsIndex(actionName);
						console.log("actionName: " + actionName);
						console.log("actionIndex: " + actionIndex); 
						allActions[actionIndex](actionArray[i], unitArray, target);
					}

					unitArray.energy = unitArray.energy - skillArray.cost;			
					return true;
				}
			}
			else
				console.log("Not Enough Energy for skill");

			return false; 
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
						if (movementUtil.processMovement(data))
						{
							console.log("Move processed");
							emitUpdatedUnits();
						}
						else
							console.log("Move not processed");
						break; 
					}
					case ('skill'):
					{
						if (isValidSkill(data))	//make sure name is valid and fields are not null
						{
							//socket.emit('update', {'units': units});
							var skillArray = getSkillArray(data.skill, data.unit);
							if (processSkillMove(data.unit, skillArray, data.target))
							{
								console.log("Skill processed");
								emitUpdatedUnits();
							}
							else
								console.log("Skill not processed");  
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
	module.exports.getUnitIndex = getUnitIndex;

});