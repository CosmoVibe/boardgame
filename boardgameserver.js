// socket.io
var io = require('socket.io').listen(8895);
// remove debug msgs
io.set('log level', 1);


// Global variables
var liveSockets = [];
var nextUserID = 1;


// socket connection
io.sockets.on('connection', function(socket) {
	var userID = nextUserID++;
	liveSockets[userID] = socket;
	console.log("New connection of ID " + userID);
    //
	// Server variables
	var p1;
	var p2;
	var currentturn = 0;	// 0 means game is not underway, 1 means it is p1's turn, 2 means it is p2's turn
	
	// Assigns 2 players to play
	socket.on('confirmlogin', function(data) {
		console.log("Socket of ID " + userID + " has logged on.");
		if (!p1)
		{
			//userID = nextUserID++; 
			p1 = userID;
			console.log("First"); 
			console.log("p1: " + p1 + ", p2: " + p2);
			socket.emit('confirmlogin2',{'player': '1'}); 
		}
		else if (!p2)
		{
			userID = nextUserID++; 
			p2 = userID;
			console.log("second"); 
			console.log("p1: " + p1 + ", p2: " + p2);
			socket.emit('confirmlogin2',{'player': '2'});	
		} 
		else socket.emit('playersfull', {});
	});
	
	
	socket.on('disconnect', function(data) {
		console.log("Releasing socket of ID " + userID);
		delete liveSockets[userID];
	});
});