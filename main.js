const {app, BrowserWindow, ipcMain, Menu} = require('electron')
const { autoUpdater } = require("electron-updater")
const log = require("electron-log")
const net = require('net')
const port = 17256
const host = '192.168.1.142'

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
log.info('App starting...')


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
    autoUpdater.checkForUpdatesAndNotify()
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


function sendStatusToWindow(text) {
  log.info(text);
  menuWindow.webContents.send('message', text);
}

autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...')
})
autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.')
})
autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.')
})
autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err)
})
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
    sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded')
});

// app.on('window-all-closed', () => {
//     app.quit()
// })
