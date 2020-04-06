const {app, BrowserWindow, ipcMain} = require('electron')
const net = require('net')
const port = 17256
const host = '192.168.1.142'

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
        //show: false,
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


    ipcMain.on('serverUpdate', (event, arg) => {
        gameWindow.webContents.send('gameUpdate', arg)
    })

    ipcMain.on('setFound', (event, arg) => {
        server.webContents.send('setFound', arg)
    })

    ipcMain.on('addCards', (event, arg) => {
        server.webContents.send('addCards', arg)
    })
})

ipcMain.on('startMulti', (event, arg) => {
    const client = new net.Socket()
    client.connect(port, host)

    ipcMain.once('gameReady', (eventGame, readyGame) => {
        client.write(JSON.stringify({ chanel:'tableQuery', arg:{} }))
    })

    gameWindow.loadFile('pages/game.html')


    client.on('data', (data) => {
        data = JSON.parse(data)
        if(data.chanel == 'serverUpdate') {
            gameWindow.webContents.send('gameUpdate', data.arg)
        }
    })

    ipcMain.on('setFound', (event, arg) => {
        client.write(JSON.stringify({ chanel:'setFound', arg:arg }))
    })

    ipcMain.on('addCards', (event, arg) => {
        client.write(JSON.stringify({ chanel:'addCards', arg:arg }))
    })
})

app.on('window-all-closed', () => {
  app.quit()
})
