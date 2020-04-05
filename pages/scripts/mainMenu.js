const {ipcRenderer} = require('electron')

function playSingle() {
    ipcRenderer.send('start', {})
}
