var express = require('express');
var app = express();
var server = require('http').createServer(app);  
// Ajout de socket.io
var io = require('socket.io')(server);
var todolist = [];

//// Connexion à socket.io
io.sockets.on('connection', function (socket) {
	
	/* Retourne la collection d'item (todolist) */
	socket.emit('connectionCallback', JSON.stringify(todolist));
	
	/* dès qu'un item est ajouté, on le stocke et on signale sa création*/
    socket.on('addItem', function (message) {
		var msg = JSON.parse(message);
		var newItem = {id: todolist.length, text: msg.text};
		console.log('New to do item: ' + JSON.stringify(newItem));
		socket.broadcast.emit('addItemEvent', JSON.stringify(newItem));
		socket.emit('addItemEvent', JSON.stringify(newItem));
		todolist.push(newItem);
    }); 

	/* dès qu'un item est supprimé on signale sa suppression */
	socket.on('removeItem', function (message) {
		var itm = JSON.parse(message);
		console.log('Remove to do item: ' + message);
		socket.broadcast.emit('removeItemEvent', message);
		socket.emit('removeItemEvent', message);
		todolist.splice(itm.id, 1);
    }); 
});

app.use(function(req, res, next){
    next();
})

/* On affiche la todolist et le formulaire */
app.get('/todo', function(req, res) { 
    res.render('todo.ejs');
})

/* On redirige vers la todolist si la page demandée n'est pas trouvée */
app.use(function(req, res, next){
    res.redirect('/todo');
})

server.listen(8080); 