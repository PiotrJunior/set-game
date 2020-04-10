const {app, BrowserWindow, ipcMain, Menu, Tray} = require('electron')
const net = require('net')
const client = new net.Socket()
const port = 17256
const host = '192.168.1.142'

app.on('ready', () => {
    serverProcess = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    serverProcess.loadFile('server.html')

    ipcMain.once('serverReady', (eventServer, readyServer) => {
        eventServer.reply('newGame', {})
    })

    tray = new Tray('server/icon.png')
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Set server is runnng'},
        { label: 'New game', click: () => {serverProcess.webContents.send('newGame', {})} },
        { label: 'Turn off', click: () => {app.quit()} }
    ])

    tray.setToolTip('Players connected: 0')
    tray.setContextMenu(contextMenu)
})

const server = net.createServer();
server.listen(port, host)

var sockets = [];

server.on('connection', (sock) => {
    sockets.push(sock);
    tray.setToolTip('Players connected: ' + sockets.length)

    sock.on('data', (data) => {
        data = JSON.parse(data)
        if(data.chanel == 'setFound') {
            serverProcess.webContents.send('setFound', data.arg)
        } else if(data.chanel == 'addCards') {
            serverProcess.webContents.send('addCards', data.arg)
        } else if(data.chanel == 'tableQuery') {
            serverProcess.webContents.send('tableQuery', data.arg)
        }
    })

    sock.on('close', function(data) {
        let index = sockets.findIndex(function(o) {
            return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort
        })
        if (index !== -1) sockets.splice(index, 1)
        tray.setToolTip('Players connected: ' + sockets.length)
    })
})

ipcMain.on('serverUpdate', (event, arg) => {
    sockets.forEach((sock, index, array) => {
        sock.write(JSON.stringify({ chanel:'serverUpdate', arg:arg }))
    })
})
