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
export default class DeleteSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, name,artist,youTubeID,index) {
        super();
        this.app = initApp;
        this.name = name;
        this.artist = artist;
        this.youTubeID = youTubeID;
        this.index = index;
    }

    doTransaction() {
        this.app.deleteSong(this.index);
    }
    
    undoTransaction() {
        this.app.addSpecificSong(this.name,this.artist,this.youTubeID,this.index);
    }
}