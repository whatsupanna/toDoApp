const server = require('socket.io')();
const firstTodos = require('./data');
const Todo = require('./todo');


// FIXME: DB is reloading on client refresh. It should be persistent on new client
// connections from the last time the server was run...

//moved this out of server connect so that it doesn't blow the database away every time. 

const DB = firstTodos
            .map((t,i) => {
                t.id = i
                return t;
            })
            .map((t) => {
                // Form new Todo objects
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
    client.on('add', (t) => {
        // Make a new todo
        const newTodo = new Todo(t);
        const newId = DB.length;
        newTodo.id = newId;
        // Push this newly created todo to our database
        DB.push(newTodo);

        // Send the latest todos to the client
        // FIXME: This sends all todos every time, could this be more efficient? Yes fires event only for new to do. 
        console.log(newTodo);
        addNewTodo(newTodo);
    });

    // let the user know that a to do is completed
    client.on('completed', ({id}) => {
        DB[id].completed = true;
        server.emit('completedById', DB[id]);
    });

    // let the user know all have been completed
    client.on('completeAll', () => {
        //complete all
        completeAll();
    });

    // let the user know that a to do is deleted
    client.on('deleted', ({id}) => {
        //on deleted take it out 
        deleteItem(id);
    });

    // let the user know all has been deleted
    client.on('deleteAll', () => {
        //delete all
        deleteAll();
    });

    // Send the DB downstream on connect
    reloadTodos();



    // helper functions
    function deleteItem(id){
        DB.splice(DB[id].id,1);
        DB[id].deleted = true;
        server.emit('deletedById', DB[id]);
    }

    function completeAll(){
        DB.forEach(function(item){
            item.completed = true;
        });
        server.emit('completeAll', DB);
    }

    function deleteAll(){
        for (let i = DB.length; i > 0; i--) {
            DB.pop();
        }
        server.emit('deleteAll', DB);
    }
});


console.log('Waiting for clients to connect');
server.listen(3003);
