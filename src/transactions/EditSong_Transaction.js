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
export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, index,oldTitle,oldArtist,oldID) {
        super();
        this.app = initApp;
        this.index = index;
        this.oldTitle = oldTitle;
        this.oldArtist = oldArtist;
        this.oldID = oldID;
    }

    doTransaction() {
        this.app.doEditSong();
    }
    
    undoTransaction() {
        this.app.doSpecificEdit(this.index,this.oldTitle,this.oldArtist,this.oldID);
    }
}