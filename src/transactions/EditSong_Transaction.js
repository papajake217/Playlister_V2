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
    constructor(initApp, index,oldTitle,oldArtist,oldID,newTitle,newArtist,newID) {
        super();
        this.app = initApp;
        this.index = index;
        this.oldTitle = oldTitle;
        this.oldArtist = oldArtist;
        this.oldID = oldID;
        this.newTitle = newTitle;
        this.newArtist = newArtist;
        this.newID = newID;
    }

    doTransaction() {
        this.app.moveSong(this.oldSongIndex, this.newSongIndex);
    }
    
    undoTransaction() {
        this.app.moveSong(this.newSongIndex, this.oldSongIndex);
    }
}