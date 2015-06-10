var windowWidth = 800,
	windowHeight = 600;
var stage = new Kinetic.Stage({
	container: 'container',
	width: windowWidth,
	height: windowHeight
});

var layer = new Kinetic.Layer();

var rect = new Kinetic.Rect({
	x: 0,
	y: 0,
	width: 32,
	height: 32,
	stroke: 'black',
	strokeWidth: 2,
	fill: '#FFFF00'
});

layer.add(rect);
stage.add(layer);

socket.emit('talk', {'string': "HI SHELLEY!"});
socket.on('confirmation', function(data) {
    console.log(data.msg);
});