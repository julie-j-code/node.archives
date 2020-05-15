var express = require('express');

var app = express();
var server = require('http').createServer(app);
var ent   = require('ent');
var io = require('socket.io').listen(server);

var todolist = []; // Créer le tableau todolist pour stocker les tâches sur le serveur
var index;

app.use(express.static('public')) // Gestion des fichiers statiques

    .get('/todolist', function(request, response)
    {
        response.sendFile(__dirname + '/views/todo.html');
    })

    // On redirige vers la todolist si la page demandée n'est pas trouvée
    .use(function(request, response, next)
    {
        response.redirect('/todolist');
    });


// L'événement
io.on('connection', function(socket){

    /**
     * Log de connexion des utilisateurs
     */
    console.log('a user connected');

    /**
     * Déconnexion d'un utilisateur
     */
    socket.on('disconnect', function () {
            console.log('user disconnected : ');

    });

    // Envoyer l'événement  updateTask à tous les utilisateurs e
    socket.emit('updateTask', todolist);


    /**
     * Réception de l'événement 'addTask' et réémission vers tous les utilisateurs
     */
    socket.on('addTask', function(task)
    {
        task = ent.encode(task);
        todolist.push(task); // Ajouter une tâche au tableau todolist du serveur

        // Envoyer une tâche à tous les utilisateurs en temps réel
        socket.broadcast.emit('updateTask', todolist);
        console.log(todolist); // Debug
    });


    // Delete tasks
    socket.on('deleteTask', function(index)
    {
        // Supprime une tâche du tableau todolist du serveur
        todolist.splice(index, 1);

        //Mises à jour todolist de tous les utilisateurs en temps réel - rafraîchir l'index
        io.emit('updateTask', todolist);
    });


});


// On lance le serveur en écoutant les connexions arrivant sur le port 8000
server.listen(8080, function(){
    console.log('Server is listening on *:8080');
});