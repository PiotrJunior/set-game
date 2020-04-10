const {app, BrowserWindow, ipcMain, Menu} = require('electron')
const net = require('net')
const port = 17256
const host = '192.168.1.142'

app.on('ready', () => {
    // Menu.setApplicationMenu(null)

    menuWindow = new BrowserWindow({
        frame: false,
        resizable: false,
        width: 400,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })
    menuWindow.loadFile('assets/html/mainMenu.html')
})

ipcMain.on('startSingle', (event, arg) => {
    serverProcess = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    gameWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    })


    ipcMain.once('gameReady', (eventGame, readyGame) => {
        ipcMain.once('serverReady', (eventServer, readyServer) => {
            eventServer.reply('newGame', {})
        })

        serverProcess.loadFile('assets/server/server.html')
    })

    gameWindow.loadFile('assets/html/game.html')
    menuWindow.hide()

    gameWindow.once('closed', () => {
        menuWindow.show()
        serverProcess.close()
    })

    ipcMain.on('serverUpdate', (event, arg) => {
        gameWindow.webContents.send('gameUpdate', arg)
    })

    ipcMain.on('setFound', (event, arg) => {
        serverProcess.webContents.send('setFound', arg)
    })

    ipcMain.on('addCards', (event, arg) => {
        serverProcess.webContents.send('addCards', arg)
    })
})

ipcMain.on('startMulti', (event, arg) => {
    gameWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    })

    const client = new net.Socket()
    client.connect(port, host)

    ipcMain.once('gameReady', (eventGame, readyGame) => {
        client.write(JSON.stringify({ chanel:'tableQuery', arg:{} }))
    })

    gameWindow.loadFile('assets/html/game.html')
    menuWindow.hide()

    gameWindow.once('closed', () => {
        menuWindow.show()
    })

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

ipcMain.on('closeApp', () => {
    app.quit()
})

ipcMain.on('minimizeApp', () => {
    menuWindow.minimize()
})

// app.on('window-all-closed', () => {
//     app.quit()
// })
