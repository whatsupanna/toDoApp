const server = require('socket.io')();
const firstTodos = require('./data');
const Todo = require('./todo');

//listen on a disconnect event, push into local storage
// on reconnect send them to the server
//then clear local storage


// FIXME: DB is reloading on client refresh. It should be persistent on new client
// connections from the last time the server was run...

const DB = firstTodos
            .map((t,i) => {
                t.id = i
                return t;
            })
            .map((t) => {
                // Form new Todo objects
                console.log(t);
                return new Todo(t);
            });


const addNewTodo = (todo) => {
    server.emit('newTodo', todo);
}

server.on('connection', (client) => {
    // This is going to be our fake 'database' for this application
    // Parse all default Todo's from db
    // Sends a message to the client to reload all todos
    const reloadTodos = () => {
        server.emit('load', DB);
    }

    // Accepts when a client makes a new todo
    client.on('make', (t) => {
        // Make a new todo
        const newTodo = new Todo(t);
        const newId = DB.length;
        newTodo.id = newId;
        // Push this newly created todo to our database
        DB.push(newTodo);

        // Send the latest todos to the client
        // FIXME: This sends all todos every time, could this be more efficient?
        // reloadTodos();
        console.log(newTodo);
        addNewTodo(newTodo);
    });

    // let the user know that it is completed
    client.on('completed', ({id}) => {
        DB[id].completed = true;
        server.emit('completedById', DB[id]);
    });

    // Send the DB downstream on connect
    reloadTodos();
});

console.log('Waiting for clients to connect');
server.listen(3003);
