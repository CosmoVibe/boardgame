var boardgameserver = require('./boardgameserver.js');
//makes sure the user can only move left, right, up, or down
		//direction (ex: [1, 0], [0, 1], [1, 0], etc...)
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
		//make sure position isn't on an occupied space
		function isOverlapping(position){
			for (i = 0; i < boardgameserver.units[1].length; i++)
			{
				if ((boardgameserver.units[1][i].position.equals(position)) || (boardgameserver.units[2][i].position.equals(position)))
				{ 
					return true; 
				}
			}
			return false; 
		}

		//assume the direction is already valid
		//move the unit to a new position
		//returns a new position if valid move
		function movePosition(direction, unit) {
			var newPosition = [0, 0];	//initialize variable
			var index = boardgameserver.getUnitIndex(boardgameserver.userID); 
	
			var temp = boardgameserver.units[index][unit];
			console.log("Original Position: " + temp.position); 
	 		newPosition[0] = direction[0] + temp.position[0];
	 		newPosition[1] = direction[1] + temp.position[1];

	 		if (!isValidPosition(newPosition))
	 			console.log("newPosition: " + newPosition + " is off the board");
	 		else if (isOverlapping(newPosition))	//overlapping position
	 			console.log("newPosition: " + newPosition + "is overlapping with another piece");
	 		else
	 			boardgameserver.units[index][unit].position = newPosition; 
	 		
			return newPosition; 
		}

		//checks movement's energy level and movement cost level to see if it can move
		//untit is an index of what to move (units[index][unit])
		function hasMoveEnergy(unit)
		{
			var index = boardgameserver.getUnitIndex(boardgameserver.userID);
			var actualUnit = boardgameserver.units[index][unit];
			console.log("Player: " + boardgameserver.userID);
			console.log("Get unit index: " + boardgameserver.getUnitIndex(boardgameserver.userID));
			console.log("Test Position: " + actualUnit.position); 
			console.log("Energy: " + actualUnit.energy);
			console.log("Move Cost: " + actualUnit.movecost); 

			if (actualUnit.energy >= actualUnit.movecost)
			{
				console.log("Movement granted");
				//actualUnit.energy = actualUnit.energy - actualUnit.movecost;
				return true;  
			}
			else
			{
				console.log("You don't have enough energy to move!");
				return false; 
			}
		}

		//has valid direction
		function hasValidDirection(data)
		{
			return ((data.arg) && (data.arg.direction != null)); 
		}

		//process movement
		//returns true if the move went through, false otherwise
		function processMovement(data)
		{
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
							//decrease energy
							var index = boardgameserver.getUnitIndex(boardgameserver.userID);
							var actualUnit = boardgameserver.units[index][data.unit];
							actualUnit.energy = actualUnit.energy - actualUnit.movecost;
							return true; 
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

			return false; 
		}
module.exports.isValidDirection = isValidDirection; 
module.exports.isValidPosition = isValidPosition; 
module.exports.isOverlapping = isOverlapping; 
module.exports.movePosition = movePosition; 
module.exports.hasMoveEnergy = hasMoveEnergy; 
module.exports.hasValidDirection = hasValidDirection;
module.exports.processMovement = processMovement;