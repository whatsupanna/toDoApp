const server = require('socket.io')();
const firstTodos = require('./data');
const Todo = require('./todo');
const PropertyBag = require('./PropertyBag');

// FIXME: DB is reloading on client refresh. It should be persistent on new client
// connections from the last time the server was run...

let nextId = 0;
const DB = new PropertyBag();

function getNewId() { return nextId++; }
//moved this out of server connect so that it doesn't blow the database away every time. 
firstTodos.forEach(t => {
    //auto incrementing integer 
    const thisId = getNewId();
    t.id = thisId;
    t.completed = false;
    DB[thisId] = new Todo(t);
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
        const newId = getNewId();
        newTodo.id = newId;
        // Push this newly created todo to our database
        DB[newId] = newTodo;

        // Send the latest todos to the client
        // FIXME: This sends all todos every time, could this be more efficient? Yes fires event only for new to do. 
        addNewTodo(newTodo);
    });

    // let the user know that a to do is completed
    client.on('completed', ({id}) => {
        const todo = DB[id];        
        if (id != '' && todo){
            todo.completed = true;
            server.emit('completedById', todo);
            // console.info("completed " + id);
        } else {
            console.warn("could not locate todo to complete" + id);
        }
    });

    // let the user know all have been completed
    client.on('completeAll', () => {
        completeAll();
    });

    // let the user know that a to do is deleted
    client.on('deleted', ({id}) => {
        deleteItem(id);
    });

    // let the user know all has been deleted
    client.on('deleteAll', () => {
        deleteAll();
    });

    // Send the DB downstream on connect
    reloadTodos();


    // helper functions
    function deleteItem(id){
        const todo = DB[id];
        if (id != '' && todo != 'undefined') {
            delete DB[id];
            server.emit('deletedById', todo);
        } else {
            console.warn("couldn't find item to delete" + id);
        }
    }

    function completeAll(){
        Object.keys(DB).forEach(key => DB[key].completed = true);
        server.emit('completeAll', DB);
    }

    function deleteAll(){
        Object.keys(DB).forEach(key => delete DB[key]);
        server.emit('deleteAll', DB);
    }
});


console.log('Waiting for clients to connect');
server.listen(3003);
