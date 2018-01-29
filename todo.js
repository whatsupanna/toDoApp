module.exports = class Todo {
    constructor({title, id, completed, deleted}) {
        this.title = title;
        this.id = id;
        this.completed = completed
        this.deleted = deleted
    }
}
