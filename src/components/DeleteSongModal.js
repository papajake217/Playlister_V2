import React, { Component } from 'react';

export default class DeleteSongModal extends Component {
    handleDeleteSong = (event) => {
        event.preventDefault();
        this.props.deleteSongCallback(this.props.songID, this.props.song);
    }

    render() {
        const { song, deleteSongCallback, hideDeleteSongModalCallback, songID } = this.props;
        let name = "";
        if (song) {
            name = song.title;
        }
        return (
            <div 
                class="modal" 
                id="delete-song-modal" 
                data-animation="slideInOutLeft">
                    <div class="modal-root" id='verify-delete-song-root'>
                        <div class="modal-north">
                            Delete Song?
                        </div>
                        <div class="modal-center">
                            <div class="modal-center-content">
                                Are you sure you wish to permanently delete {name}?
                            </div>
                        </div>
                        <div class="modal-south">
                            <input type="button" 
                                id="delete-song-confirm-button" 
                                class="modal-button" 
                                onClick={this.handleDeleteSong}
                                value='Confirm' />
                            <input type="button" 
                                id="delete-song-cancel-button" 
                                class="modal-button" 
                                onClick={hideDeleteSongModalCallback}
                                value='Cancel' />
                        </div>
                    </div>
            </div>
        );
    }
}