const {ipcRenderer} = require('electron')

function playSingle() {
    ipcRenderer.send('start', {})
}

function playMulti() {
    ipcRenderer.send('startMulti', {})
}
