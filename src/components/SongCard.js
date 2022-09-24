import React from "react";

export default class SongCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
            draggedTo: false,
            editActive: false,     
        }
    }

    handleDoubleClick = (event) => {
        event.stopPropagation();
        this.props.editSongCallback(this.getItemNum()); // Calls function in one level up (playlistcards)
    }


    handleDragStart = (event) => {
        event.dataTransfer.setData("song", event.target.id);
        this.setState(prevState => ({
            isDragging: true,
            draggedTo: prevState.draggedTo
        }));
    }
    handleDragOver = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragEnter = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragLeave = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: false
        }));
    }
    handleDrop = (event) => {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        targetId = targetId.substring(target.id.indexOf("-") + 1);
        let sourceId = event.dataTransfer.getData("song");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        
        this.setState(prevState => ({
            isDragging: false,
            draggedTo: false
        }));

        // ASK THE MODEL TO MOVE THE DATA
        this.props.moveCallback(sourceId, targetId);
    }

    getItemNum = () => {
        return this.props.id.substring("playlist-song-".length);
    }

   handleDeleteSong = (event) => {
        event.stopPropagation();
        this.props.deleteSongCallback(this.getItemNum());
   }

    render() {
        const { song } = this.props;
        let num = this.getItemNum();
        num += ". "
        
        let itemClass = "playlister-song";
        if (this.state.draggedTo) {
            itemClass = "playlister-song-dragged-to";
        }
        
        let link = "https://www.youtube.com/watch?v=" + song.youTubeId
        
        if(this.state.editActive === true){
            
        }

        let divID = "delete-" + num; 

        return (
            <div
                id={'song-' + num}
                className={itemClass}
                onDragStart={this.handleDragStart}
                onDragOver={this.handleDragOver}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                onDoubleClick={this.handleDoubleClick}
                onDrop={this.handleDrop}
                draggable="true"
                
            >
                <span>
               
                    {num}
                

            <a href = {link}>   {song.title} by {song.artist} </a>
            </span>
            <div>
            <input type="button" id={divID} value="&#x2715;" class="song-delete-button" onClick = {this.handleDeleteSong} />
            </div>
            </div>
           
        )
    }
}