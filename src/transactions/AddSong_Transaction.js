import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * MoveSong_Transaction
 * 
 * This class represents a transaction that works with drag
 * and drop. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author Jake Papaspiridakos
 */
export default class AddSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, index) {
        super();
        this.app = initApp;
        this.index = index;
    }

    doTransaction() {
        this.app.addNewSong(this.index);
    }
    
    undoTransaction() {
        this.app.performDelete(this.index);
    }
}