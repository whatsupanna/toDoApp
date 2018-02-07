const server = io.connect('http://localhost:3003/');
const list = document.getElementById('todo-list');
let firstRender = false;

// NOTE: These are all our globally scoped functions for interacting with the server
// This function adds a new todo from the input
function add() {
    console.warn(event);
    const input = document.getElementById('todo-input');

    // Emit the new todo as some data to the server
    if(input.value != ""){
        server.emit('add', {
            title : input.value
        });
    } else{
        alert("Please add something to do");
    }
    // Clear the input
    input.value = '';
}


function deleteAll() {
    // Emit the deleted data to the server
    server.emit('deleteAll', {});
}

function completeAll() {
    // Emit the new info to the server
    server.emit('completeAll', {});
}

function removeAllChildren(el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

function renderEmptyState(){
    const emptyState = document.createTextNode("All done!");
    emptyState.classList.add('emptyState');
    list.append(emptyState);
}

function render(todo) {
    let listItem = findInDom(todo);
    //it's not not. give me a boolean
    const existed =!!listItem;
    if (!existed) {
        listItem = document.createElement('li');
        list.append(listItem);
    } else {
        removeAllChildren(listItem);
    }

    const listItemText = document.createTextNode(todo.title);


    listItem.classList.add('todoItem');
    listItem.appendChild(listItemText);


    listItem.dataset.id = todo.id;
    if (todo.completed) {
        listItem.classList.add('completed');
    }


    const deleteButtonNode = document.createElement('input');

    deleteButtonNode.setAttribute('type','button');
    deleteButtonNode.setAttribute('name','delete');
    deleteButtonNode.setAttribute('value','X');
    deleteButtonNode.classList.add('deleteButton');
    deleteButtonNode.classList.add('button');
    listItem.appendChild(deleteButtonNode);
}

function findInDom(todo) {
    const results = Array.from(document.querySelectorAll(`[data-id]`)).filter(el => el.dataset.id == todo.id);
    return results.length > 0 ? results[0] : null;
}

function renderCompleted(todo){
    render(todo);
}

function renderAllCompleted(todos){
    Object.keys(todos).forEach(id => {
        const i = todos[id];
        render(i);
    });

}

function renderDeleted(todo){
    const el = findInDom(todo);
    el.parentNode.removeChild(el);
}

function renderDeletedAll(todos){
    removeAllChildren(list);
}

//event listeners
document.querySelector('.add').addEventListener('keypress', function (e) {
    var key = e.which || e.keyCode;
    if (key === 13) { 
      add();
    }
});

// on the body because these elements don't exist yet
//completed by id
document.body.addEventListener('click',function(e){
    if(e.target.classList.contains('todoItem')){
        const clickedId = e.target.dataset.id
        //strikeout
        server.emit('completed', {
            id : clickedId
        });
    }
});

//deleted by id
document.body.addEventListener('click',function(e){
    if(e.target.classList.contains('deleteButton')){
        const deleteId = e.target.parentElement.dataset.id;
        server.emit('deleted', {
            id : deleteId
        });
    }
});


// NOTE: These are listeners for events from the server
// This event is for (re)loading the entire list of todos from the server
server.on('load', (todos) => {
    // Delete things that were deleted on the server
    Array.from(document.querySelectorAll(`[data-id]`)).forEach(el => {
    
        const id = el.dataset.id;
        if (!todos[id]) {
            el.parentElement.removeChild(el);
        }
    });

    Object.keys(todos).forEach(id => render(todos[id]));
    firstRender = true;
    setCache();
});

server.on('completedById', (todo) => {
    renderCompleted(todo);
    setCache();
});

server.on('deletedById', (todo) => {
    renderDeleted(todo);
    setCache();
});

server.on('deleteAll', () => {
    renderDeletedAll();
    setCache();
});

server.on('completeAll', (todos) => {
    renderAllCompleted(todos);
    setCache();
});

//get data on this event and then post it
server.on('newTodo', (todo) => {
    render(todo);
    setCache();
});

server.on('reconnect', () => {
    //TODO: Replay writes to the server (if we want to support offline-writes)
});

server.on('connect_error', () => {
    if (!firstRender) {
        const todos = getLocalStorage() || [];
        todos.forEach(todo => render(todo));
        firstRender = true;
    }
})

function setCache(){
  const cache = [];
  document.querySelectorAll(`[data-id]`).forEach(function(el, i){
    cache.push({
        title:el.innerText,
        id:el.dataset.id,
        completed: el.classList.contains("completed")
    });
  });

  setLocalStorage(cache);
}

function setLocalStorage(itemToSet) {
    return localStorage.setItem("todos",JSON.stringify(itemToSet));
}

function getLocalStorage() {
    return JSON.parse(localStorage.getItem("todos"));

}




