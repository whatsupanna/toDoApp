const server = io('http://localhost:3003/');
const list = document.getElementById('todo-list');
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
    // TODO: refocus the element
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
    Object.keys(todos).forEach(id => render(todos[id]));
    // should I be loading the cache here instead? 

});

server.on('completedById', (todo) => {
    renderCompleted(todo);
});

server.on('deletedById', (todo) => {
    renderDeleted(todo);
});

server.on('deleteAll', () => {
    renderDeletedAll();
});

server.on('completeAll', (todos) => {
    renderAllCompleted(todos);
});

//get data on this event and then post it
server.on('newTodo', (todo) => {
    render(todo);
});

//listen on a disconnect event, push into local storage
server.on('disconnect', () => {
  // for caching 
  console.log('disconnect');
  const cache = [];
  document.querySelectorAll(`[data-id]`).forEach(function(el, i){
    cache.push({
        text:el.innerText,
        id:el.dataset.id
        });
  });

  setLocalStorage(cache);
});


server.on('reconnect', () => {
    //retrieve
    // on reconnect send them to the server
    //then clear local storage
    console.log('reconnect');

    const todos = getLocalStorage();
    todos.forEach(todo => render(todo));
});

function setLocalStorage(itemToSet) {
    return localStorage.setItem("todos",JSON.stringify(itemToSet));
}

function getLocalStorage() {
    return JSON.parse(localStorage.getItem("todos"));
    //this will work if the cache data is the same as the data from the server. instead, the cached data is old data (when you connect send the same 3). 
    //because the server doesn't actually reflect changes i have made to the todos in a manner that is persistent. 
    //in theory this would work if this was a real server. 
}




