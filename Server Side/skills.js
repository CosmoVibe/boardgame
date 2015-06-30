var boardgameserver = require('./boardgameserver.js');
var serverUtility = require('./bgServerUtility.js');
var movementUtil = require('./movement.js');
var units = require('./units.js').units;

//skill variables
//returns the index to the array of functions all skills

//checks to see if the skill move is within range and on the board
//unitPosition = position of your unit (coordinate)
//targetPosition = position of the target (coordinate)
function isWithinRange(unitPosition, targetPosition, range)
{
	var distance = [0, 0];	//initialize variables
	distance[0] = targetPosition[0] - unitPosition[0];
	distance[1] = targetPosition[1] - unitPosition[1];
	console.log("unitPosition: " + unitPosition);
	console.log("targetPosition: " + targetPosition);
	console.log(distance); 

	for (i = 0; i < range.length; i++)
	{
		if (distance.equals(range[i]))
			return true; 
	}

	return false; 
}

//functions for checking ranges
var checkRange = [
	function(range, target, unitArray)	//enemy unit
	{
		var unitPosition = unitArray.position; 
		targetPosition = units[serverUtility.getEnemyUnitIndex(boardgameserver.userID)][target].position;
		return (isWithinRange(unitPosition, targetPosition, range));  
	},
	function(range, target, unitArray)	//ally unit
	{
		var unitPosition = unitArray.position;
		targetPosition = units[serverUtility.getUnitIndex(boardgameserver.userID)][target].position;
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
	if (skillArray.name.toLowerCase() == 'swiftness')
		return true; 

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
		var enemyUnit = units[serverUtility.getEnemyUnitIndex(boardgameserver.userID)][target]; 
		var enemyPosition = enemyUnit.position; 
		console.log("My position: " + thisPosition);
		console.log("Enemy Position: " + enemyPosition);

		console.log("Skill is within range");
		console.log("Enemy HP Before: " + enemyUnit.hp); 
		var ratio = actionArray.ratio;
		console.log("Ratio: " + ratio);
		console.log("Strength: " + unitArray.strength);   
		var damage = unitArray.strength * ratio;
		console.log("Damage: " + damage); 
		enemyUnit.hp = enemyUnit.hp - damage; 
		console.log("Enemy HP After: " + enemyUnit.hp);
		return true;  
	},
	function(actionArray, unitArray, target)	//movement
	{
		var range = actionArray.range;
		console.log("Unit Array Position: " + unitArray.position);
		console.log("Target: " + target);
		console.log("Range: " + actionArray.range); 
		var distance = [0, 0];
		var unitPosition = unitArray.position; 
		distance[0] = target[0] - unitPosition[0];
		distance[1] = target[1] - target[1];
		console.log(isWithinRange(unitArray.position, target, actionArray.range));
		console.log(movementUtil.isValidPosition(distance));
		console.log((!movementUtil.isOverlapping(distance))); 
		var canMove = ((isWithinRange(unitArray.position, target, actionArray.range)) && (movementUtil.isValidPosition(target)) && (!movementUtil.isOverlapping(target)));
		if (canMove)
			unitArray.position = target;
		return canMove;
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
	var index = serverUtility.getUnitIndex(boardgameserver.userID);
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
	var unitIndex = serverUtility.getUnitIndex(boardgameserver.userID);
	var unitArray = units[unitIndex][unit];
	var isDone = true; 

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
				isDone = ((isDone) && (allActions[actionIndex](actionArray[i], unitArray, target)))
			}

			if (isDone)
				unitArray.energy = unitArray.energy - skillArray.cost;	
			else
				console.log("Not everything went through xD");		
			
			return true;
		}
	}
	else
		console.log("Not Enough Energy for skill");

	return false; 
}

module.exports.isWithinRange = isWithinRange;
module.exports.isValidSkill = isValidSkill; 
module.exports.getSkillArray = getSkillArray; 
module.exports.hasSkillEnergy = hasSkillEnergy; 
module.exports.processSkillMove = processSkillMove;