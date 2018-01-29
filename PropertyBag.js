//const newLine = "\r\n";
const newLine = "";
module.exports = class PropertyBag {
    constructor() {    	
        this.toString = this.toString.bind(this);        
    }
    toString() {

        //return "hello world";
        return "{" + newLine + Object.getOwnPropertyNames(this).filter(k => k != "toString").map(k => k + ": " + this[k]).join("," + newLine) + newLine + "}";
        //return this["hello"];
    }
}