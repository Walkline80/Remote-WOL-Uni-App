const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const app = express();

app.use(function(req, res) {
	res.send({
		msg: "hello"
	});

});

const server = http.createServer(app);
const wss = new WebSocket.Server({server});
const path = "/control";

function testWebSocketServerApi() {
	wss.on('connection', function connection(ws, req) {
		const location = url.parse(req.url, true);
		const ip = req.connection.remoteAddress;
		const port = req.connection.remotePort;

		console.log(ip + " " + port + path);

		if (location.path === path) {
			ws.send("it's not your device!");
			ws.close();
		}
		
		ws.on('message', function incoming(message) {
			console.log('received: %s', message);
		});

		ws.on('close', function(params) {
			console.log('params: %s', params);
		});

		ws.send('something');
	});

	server.listen(80, function listening() {
		console.log('WebSocket Listening on %d', server.address().port);
	});
}

testWebSocketServerApi();