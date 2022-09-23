import React, { Component } from 'react';

export default class EditSongModal extends Component {
    render() {
        const { listKeyPair, editSongCallback, hideEditSongModalCallback } = this.props;
        let name = "";
        if (listKeyPair) {
            name = listKeyPair.name;
        }
        return (
            <div 
                class="modal" 
                id="edit-song-modal" 
                data-animation="slideInOutLeft">
                    <div class="modal-root" id='verify-edit-song-root'>
                        <div class = "modal-north">
                            Edit Song
                        </div>
                        <div class="modal-center">
                            <div class="modal-center-content">
                            <table>
                                <tr>
                                    <td>Name:</td>
                                    <td> <input id = "titleInput" type="text" class="editSongTable"/> </td>
                                </tr>
                                <tr>
                                    <td>Artist</td>
                                    <td> <input id = "artistInput" type="text" class="editSongTable"/> </td>
                                </tr>
                                <tr>
                                    <td>YouTubeID:</td>
                                    <td> <input id = "IDInput" type="text" class="editSongTable"/> </td>
                                </tr>
                            </table>
                            </div>
                        </div>
                        <div class="modal-south">
                            <input type="button" 
                                id="edit-song-confirm-button" 
                                class="modal-button" 
                                onClick={editSongCallback}
                                value='Confirm' />
                            <input type="button" 
                                id="edit-song-cancel-button" 
                                class="modal-button" 
                                onClick={hideEditSongModalCallback}
                                value='Cancel' />
                        </div>
                    </div>
            </div>
        );
    }
}