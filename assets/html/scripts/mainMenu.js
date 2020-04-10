const {ipcRenderer} = require('electron')
window.$ = window.jQuery = require('jquery')

function playSingle() {
    ipcRenderer.send('start', {})
}

function playMulti() {
    ipcRenderer.send('startMulti', {})
}
window.onload = () => {
    $('#close-button').click( () => {
        ipcRenderer.send('closeApp', {})
    })
    $('#min-button').click( () => {
        ipcRenderer.send('minimizeApp', {})
    })
    $('#play-single').click( () => {
        console.log('single');
        ipcRenderer.send('startSingle', {})
    })
    $('#play-multi').click( () => {
        ipcRenderer.send('startMulti', {})
    })
}
