const {app, BrowserWindow, ipcMain} = require('electron')


app.on('ready', () => {
    gameWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    })
    gameWindow.maximize()
    gameWindow.loadFile('pages/mainMenu.html')
})

ipcMain.on('start', (event, arg) => {
    server = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    ipcMain.once('gameReady', (eventGame, readyGame) => {
        ipcMain.once('serverReady', (eventServer, readyServer) => {
            eventServer.reply('newGame', {})
        })

        server.loadFile('server/server.html')
    })

    gameWindow.loadFile('pages/game.html')
})

ipcMain.on('serverUpdate', (event, arg) => {
    gameWindow.webContents.send('gameUpdate', arg)
})
