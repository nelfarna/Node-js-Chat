/*
 * Simple Chat Server
 * Execute "node chat.js" to run server
 * Run client from browser with either http://localhost:3000 or http://IPADDRESS:3000
 * Change IPADDRESS to your private ip address to access across a network.
 * public/ folder contains client code
 *
 */

var PORT = 3000;
var IPADDRESS = "0.0.0.0";  // can set this to your private ip address to be used across a network

var express = require("express");
var app = express();
var server = require('http').createServer(app).listen(PORT, IPADDRESS);
var io = require('socket.io').listen(server);

var clientsConnected = {};   // list of connected clients for sharing between all clients

app.use("/public", express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/public/css'));

app.get('/', function(req, res) {
	res.sendfile("public/index.html");  
});

io.sockets.on('connection', function(client) {
	
	// Listen for new client joining the chat and let all clients know that they joined
	 client.on("join", function(name) {   

		client.set('clientName', name);
	 	clientsConnected[client.id] = name;
		io.sockets.emit("update-event", name  +  " has joined the chat.");
		io.sockets.emit("update-clients", clientsConnected);

	 });

    // Listen for when clients submit messages and broadcast that message to all clients
	 client.on("message", function(data) {
	 		io.sockets.emit("update", 
	 			{ 
	 				"name": clientsConnected[client.id], 
	 			    "message": data
	 			});
	 });

    // Listen for when a client leaves the chat (closes browser)
	 client.on("disconnect", function(){
	 	if(client.id != undefined && clientsConnected[client.id] != undefined) {
			io.sockets.emit("update-event", clientsConnected[client.id] + " has left the chat.");
			delete clientsConnected[client.id];
			io.sockets.emit("update-clients", clientsConnected);
		}
		
	 });

});
