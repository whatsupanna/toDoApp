const server = io('http://localhost:3003/');
const list = document.getElementById('todo-list');
app.use(express.static(__dirname + '/ToDoApp'));


// NOTE: These are all our globally scoped functions for interacting with the server
// This function adds a new todo from the input
function add() {
    console.warn(event);
    const input = document.getElementById('todo-input');

    // Emit the new todo as some data to the server
    server.emit('make', {
        title : input.value
    });

    // Clear the input
    input.value = '';
    // TODO: refocus the element
}

function render(todo) {
    console.log(todo);
    const listItem = document.createElement('li');
    const listItemText = document.createTextNode(todo.title);
    listItem.classList.add('todoItem');
    listItem.appendChild(listItemText);
    listItem.dataset.id = todo.id;
    list.append(listItem);
}

function renderCompleted(todo){
    console.log(todo);
    //if completed true strike through with vanila js
    if(todo.completed === true){
        document.querySelectorAll(`[data-id]`).forEach(function(el){
            console.log(el.dataset.id);
            //strict equiv doesn't work or parse int on dataset
            if(el.dataset.id == todo.id){
                el.classList.add('completed');
            }
        });
    }
}


//event listeners
//body because these elements don't exist yet
document.body.addEventListener('click',function(e){
    if(e.target.classList.contains('todoItem')){
        const clickedId = e.target.dataset.id
        //strikeout
        server.emit('completed', {
            id : clickedId
        });
    }
})

// NOTE: These are listeners for events from the server
// This event is for (re)loading the entire list of todos from the server
server.on('load', (todos) => {
    todos.forEach((todo) => render(todo));
});

server.on('completedById', (todo) => {
    renderCompleted(todo);
});

//get data on this event and then post it
server.on('newTodo', (todo) => {
    render(todo);
});


