import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction';
// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';
import EditSongModal from './components/EditSongModal';
import DeleteSongModal from './components/DeleteSongModal';
import EditSong_Transaction from './transactions/EditSong_Transaction';

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            currentList : null,
            sessionData : loadedSessionData
        }
        this.dialogueOpen = false;

        
        
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
        this.componentDidMount();
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.disableButton("add-list-button");
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
        
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.enableButton("add-list-button");
        this.disableButton("add-song-button");
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
        
        
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal = () => {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
        this.dialogueOpen = true;
        this.handleFoolProof();
        
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal = () => {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
        this.dialogueOpen = false;
        this.handleFoolProof();
    }

    showDeleteSongModal = () =>{
        let modal = document.getElementById("delete-song-modal");
        modal.classList.add("is-visible");
        this.dialogueOpen = true;
        this.handleFoolProof();
        
    }

    hideDeleteSongModal = () =>{
        let modal = document.getElementById("delete-song-modal");
        modal.classList.remove("is-visible");
        this.dialogueOpen = false;
        this.handleFoolProof();
    }

    showEditSongModal = () => {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.add("is-visible");
        this.dialogueOpen = true;
        this.handleFoolProof();
    }

    hideEditSongModal = () =>{
        let modal = document.getElementById("edit-song-modal");
        modal.classList.remove("is-visible");
        this.dialogueOpen = false;
        this.handleFoolProof();
    }

    disableButton = (id) => {
        let button = document.getElementById(id);
        button.classList.add("disabled");
        button.disabled = true;
    }

    enableButton = (id) => {
        let button = document.getElementById(id);
        button.classList.remove("disabled");
        button.disabled = false;
    }


    handleFoolProof = () =>{
        
        if(this.dialogueOpen || this.state.currentList == null){ 
            this.disableButton("add-song-button");
            this.disableButton("undo-button");
            this.disableButton("redo-button");
            this.disableButton("close-button");
            this.componentWillUnmount();
        } else{
            if(this.state.currentList != null){
                this.enableButton("add-song-button");
                this.enableButton('close-button');

                
            } else{
                this.enableButton("add-song-button");
            }
            
            
            
            if(this.tps.hasTransactionToRedo() && this.state.currentList != null){
                this.enableButton("redo-button");
            } else{
                this.disableButton("redo-button");
            }
            if(this.tps.hasTransactionToUndo() && this.state.currentList != null){
                this.enableButton("undo-button");
            }else{
                this.disableButton("undo-button");
            }
           
        
            this.componentDidMount();

           
        }
        
    

    }

    markSongForDelete = (songID) => {
        let index = songID - 1;
        let song = this.state.currentList.songs[index];
        this.setState(prevState =>({
            currentList: prevState.currentList,
            song: song,
            IDtoDelete: index,
            sessionData:prevState.sessionData
        }), () => { 
            this.showDeleteSongModal();
        })

    }


    deleteSong = () => {
        this.hideDeleteSongModal();
        this.performDelete(this.state.IDtoDelete);
    }

    performDelete = (songID) =>{
        let currList = this.state.currentList;
        let index = songID;
        let songs = currList.songs;

        songs.splice(index,1);

        this.setState(prevState =>{
            return ({
                currentList:currList
            })
        }, () => {
           this.db.mutationUpdateList(currList);
           this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }

    addSpecificSong = (name,artist,youTubeID,index) =>{
        this.setState(prevState =>({
            currentList: prevState.currentList,
            sessionData:prevState.sessionData
        }), () => { 
            let currList = this.state.currentList;
        
        let newSong = {
            title: name,
            artist: artist,
            youTubeId: youTubeID
        };

        currList.songs.splice(index,0,newSong);

        this.setState(prevState =>{
            return ({
                currentList:currList
            })
        }, () => {
           this.db.mutationUpdateList(currList);
           this.db.mutationUpdateSessionData(this.state.sessionData);
        });
        })
    }
 
    addSongTransaction = () => {
        let index = this.state.currentList.songs.length;
        let transaction = new AddSong_Transaction(this,index);
        this.tps.addTransaction(transaction);
    }

    removeSongTransaction = (songID) =>{
        console.log(songID)
        let song = this.state.currentList.songs[songID];
        let name = song.title;
        let artist = song.artist;
        let youTubeID = song.youTubeId;
        let transaction = new DeleteSong_Transaction(this,name,artist,youTubeID,songID);
        this.tps.addTransaction(transaction);
    }

    addNewSong = () => {
        
        this.setState(prevState =>({
            currentList: prevState.currentList,
            sessionData:prevState.sessionData
        }), () => { 
            this.performAddSong();
        })
    }

    performAddSong = () => {
        let currList = this.state.currentList;

        currList.songs.push({
            title: "Untitled",
            artist: "Unknown",
            youTubeId: "dQw4w9WgXcQ"
        });

        this.setState(prevState =>{
            return ({
                currentList:currList
            })
        }, () => {
           this.db.mutationUpdateList(currList);
           this.db.mutationUpdateSessionData(this.state.sessionData);
        });

    }

    doEditSongTransaction = (songID) =>{
        let song = this.state.currentList.songs[this.state.IDtoEdit];
        let transaction = new EditSong_Transaction(this,this.state.IDtoEdit,song.title,song.artist,song.youTubeId);
        this.tps.addTransaction(transaction);
    }

    doSpecificEdit = (index,title,artist,vidId) =>{
        let currList = this.state.currentList;
        this.setState(prevState =>{
            currList.songs[index] = 
            {
                title:title,
                artist:artist,
                youTubeId:vidId
            };
            return ({
                currentList:currList
            })
        }, () => {
           this.db.mutationUpdateList(currList);
           this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }

    markSongForEdit = (songID) => {
        let index = songID - 1;
        let song = this.state.currentList.songs[index];
        
        this.setState(prevState =>({
            currentList: prevState.currentList,
            IDtoEdit: index,
            sessionData:prevState.sessionData
        }), () =>{
            document.getElementById("titleInput").value = song.title;
            document.getElementById("artistInput").value = song.artist;
            document.getElementById("IDInput").value = song.youTubeId;
            this.showEditSongModal();
        });
        
        
    }

    doEditSong = () =>{
        
        this.hideEditSongModal();
        this.performEdit(this.state.IDtoEdit);
    }


    performEdit = (songID) =>{
        let editedTitle = document.getElementById("titleInput").value;
        let editedArtist = document.getElementById("artistInput").value;
        let editedID = document.getElementById("IDInput").value;

        let currList = this.state.currentList;


        this.setState(prevState =>{
            currList.songs[songID] = 
            {
                title:editedTitle,
                artist:editedArtist,
                youTubeId:editedID
            };
            return ({
                currentList:currList
            })
        }, () => {
           this.db.mutationUpdateList(currList);
           this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    



    keyDownFunction = (event) =>{
        event.preventDefault();
        if ((event.metaKey || event.ctrlKey) && event.code === 'KeyZ') {
            if(this.tps.hasTransactionToUndo()){
                this.undo();
            }
            this.handleFoolProof();
        } else if((event.metaKey || event.ctrlKey) && event.code === 'KeyY'){
            if(this.tps.hasTransactionToRedo()){
            this.redo();
        }
        this.handleFoolProof();
      }
    }

      componentDidMount = () =>{
        document.addEventListener("keydown", this.keyDownFunction, false);
      }
      componentWillUnmount = () =>{
        document.removeEventListener("keydown", this.keyDownFunction, false);
      }

      

    render() {
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToRedo();
        let canClose = this.state.currentList !== null;
        try{
            this.handleFoolProof();
        } catch{

        }
        return (
            <div id="root-root">
                
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                    disableEventListener={this.componentWillUnmount}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                    addSongCallback={this.addSongTransaction}
                    
                />
                
                <PlaylistCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction}
                    editSongCallback={this.markSongForEdit}
                    deleteSongCallback={this.markSongForDelete} 
                    />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <DeleteSongModal
                    hideDeleteSongModalCallback = {this.hideDeleteSongModal}
                    deleteSongCallback={this.removeSongTransaction}
                    songID = {this.state.IDtoDelete}
                    song = {this.state.song}
                />
                <EditSongModal
                    hideEditSongModalCallback={this.hideEditSongModal}
                    editSongCallback={this.doEditSongTransaction}
                />

               
                
            </div>
        );
    }
}

export default App;
