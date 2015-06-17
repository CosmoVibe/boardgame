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
var ready = 0; 

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
	
	
	socket.on('disconnect', function(data) {
		console.log("Releasing socket of ID " + userID);
		delete liveSockets[userID];
	});
});