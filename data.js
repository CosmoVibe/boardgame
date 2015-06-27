// Window setup //
var windowWidth = 800,
	windowHeight = 600;
var stage = new Kinetic.Stage({
	container: 'container',
	width: windowWidth,
	height: windowHeight
});

// Images //
var imgsources = {
	tile: 'img/tile.png',
	wall: 'img/wall.png',
	grass: 'img/grass.png',
	spritesheet: 'img/spritesheet.png'
};
var images = {};
function preloadGameImages() {
	for (var src in imgsources) {
		images[src] = new Image();
		images[src].src = imgsources[src];
		images[src].onload = function() {
			stage.draw();
		}
	}
	console.log("all images loaded");
}

// This function would normally be put under main.js, but due to asynchronous function calls, is placed as early as possible to facilitate efficient loading
preloadGameImages();


// Sprite locations of the pokemon sprite sheet
var spriteloc = {
	bulbasaur: {x: 6, y: 7, width: 64, height: 64},
	ivysaur: {x: 88, y: 8, width: 64, height: 64},
	venusaur: {x: 166, y: 9, width: 64, height: 64},
	charmander: {x: 252, y: 10, width: 64, height: 64},
	charmeleon: {x: 326, y: 10, width: 64, height: 64},
	nidoranf: {x: 6, y: 97, width: 64, height: 64},
	nidorina: {x: 90, y: 93, width: 64, height: 64},
	nidoqueen: {x: 170, y: 88, width: 64, height: 64},
	nidoranm: {x: 253, y: 86, width: 64, height: 64},
	nidorino: {x: 330, y: 85, width: 64, height: 64},
	machamp: {x: 890, y: 159, width: 64, height: 64},
	scizor: {x: 1205, y: 565, width: 64, height: 64},
	mismagius: {x: 655, y: 1205, width: 64, height: 64},
	weavile: {x: 960, y: 1285, width: 64, height: 64},
	rhyperior: {x: 1202, y: 1288, width: 64, height: 64},
	cresselia: {x: 882, y: 1365, width: 64, height: 64}
};

function idsprite(id) {
	switch (id) {
		case 0:
			return spriteloc.scizor;
			break;
		case 1:
			return spriteloc.weavile;
			break;
		case 2:
			return spriteloc.rhyperior;
			break;
		case 3:
			return spriteloc.mismagius;
			break;
		case 4:
			return spriteloc.cresselia;
			break;
		case 5:
			return spriteloc.machamp;
			break;
		case 6:
			return spriteloc.bulbasaur;
			break;
		case 7:
			return spriteloc.bulbasaur;
			break;
		case 8:
			return spriteloc.bulbasaur;
			break;
		case 9:
			return spriteloc.bulbasaur;
			break;
		case 10:
			return spriteloc.bulbasaur;
			break;
		case 11:
			return spriteloc.bulbasaur;
			break;
	}
}





// State variables //


// Client variables

var gamestarted = false;
var playernum = -1;
var currentturn = 0;

var selectedunit = [-1,-1];
var selectedtile = [-1,-1];
var selectedaction = -1;	// 0 means movement, 1+ means skill



// Game state variables //

// this is what the unit information should sort of look like
// in order to make your server logic work, feel free to change this however you like, just keep in mind that it needs to be as modular as possible
var units = [];

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
			}
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
		id: 0,	// fighter
		position: [4,2],
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
			}
		],
		
		// this is a cosmetic description, server logic doesn't have to worry about this property
		// however, it does describe the role of each character, so you could use this to help yourself understand the game better
		description: 'A tough unit whose job is to brute force his way into the enemy team and dish out heavy damage.\n\n' +
			'- The Bullet Punch skill does an extremely high amount of damage. Zone the opponent by threatening the tile they plan on landing on.\n' +
			"- Try to get up close to priority targets to take them down quickly, but don't go so far in that you get surrounded and overwhelmed."
	},
	{
		id: 1,	// rogue
		position: [4,0],
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
		position: [4,4],
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
		position: [4,3],
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
		position: [4,1],
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