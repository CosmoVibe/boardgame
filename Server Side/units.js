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
				range: [ [0,1],[0,-1],[1,0],[-1,0] ],
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
				range: [ [0,1],[0,-1],[1,0],[-1,0] ],
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
				range: [ [0,1],[0,-1],[1,0],[-1,0] ],
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
						range: [ [0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1] ]
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
				range: [ [0,1],[0,-1],[1,0],[-1,0] ],
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
				range: [ [0,1],[0,-1],[1,0],[-1,0] ],
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
				range: [ [0,1],[0,-1],[1,0],[-1,0] ],
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
				range: [ [0,2],[0,-2],[2,0],[-2,0],[1,1],[-1,1],[1,-1],[-1,-1] ],
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
				range: [ [0,1],[0,-1],[1,0],[-1,0] ],
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
				range: [ [0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1] ],
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
		skills: [
			{
				name: 'Attack',
				cost: 1,
				target: 'enemy unit',
				range: [ [0,1],[0,-1],[1,0],[-1,0] ],
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
				range: [ [0,1],[0,-1],[1,0],[-1,0] ],
				action: [
					{
						type: 'debuff',
						debuff: 'stun',
						duration: 1
					}
				]
			},
		]
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
		skills: [
			{
				name: 'Attack',
				cost: 1,
				target: 'enemy unit',
				range: [ [0,1],[0,-1],[1,0],[-1,0] ],
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
						range: [ [0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1] ]
					}
				]
			},
		]
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
		skills: [
			{
				name: 'Attack',
				cost: 1,
				target: 'enemy unit',
				range: [ [0,1],[0,-1],[1,0],[-1,0] ],
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
				range: [ [0,1],[0,-1],[1,0],[-1,0] ],
				action: [
					{
						type: 'damage',
						ratio: 2.5
					}
				]
			},
		]
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
		skills: [
			{
				name: 'Attack',
				cost: 1,
				target: 'enemy unit',
				range: [ [0,1],[0,-1],[1,0],[-1,0] ],
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
				range: [ [0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1] ],
				action: [
					{
						type: 'heal',
						amount: 20
					}
				]
			},
		]
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
				range: [ [0,1],[0,-1],[1,0],[-1,0] ],
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
				range: [ [0,2],[0,-2],[2,0],[-2,0],[1,1],[-1,1],[1,-1],[-1,-1] ],
				action: [
					{
						type: 'damage',
						ratio: 1.75
					}
				]
			},
		]
	}
];

module.exports.units = units;