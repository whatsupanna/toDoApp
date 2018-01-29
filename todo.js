const PropertyBag = require('./PropertyBag');

module.exports = class Todo extends PropertyBag {
    constructor({title, id, completed}) {
		super();
        this.title = title;
        this.id = id;
        this.completed = completed
    }
}
