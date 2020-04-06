const {ipcRenderer} = require('electron')
var setOrder = []
var setTable = {'usedCards': 0, 'table': []}


ipcRenderer.on('newGame', (event, arg) => {
    setOrder = newSetOrder()
    setTable = {'usedCards': 0, 'table': []}

    for(; setTable.usedCards < 12; setTable.usedCards++) {
        setTable.table[setTable.usedCards] = setOrder[setTable.usedCards]
    }
    console.log('game started')
    console.log(setTable)
    ipcRenderer.send('serverUpdate', setTable)
})

ipcRenderer.on('tableQuery', (event, arg) => {
    event.reply('serverUpdate', setTable)
})

ipcRenderer.on('setFound', (event, set) => {
    if(isSet(set)) {
        for(let i = 0; i < set.length; i++) {
            if( setTable.table.length <= 12 && setTable.usedCards < 81 ) {
                setTable.table[set[i]] = setOrder[setTable.usedCards]
                setTable.usedCards++
            } else {
                delete setTable.table[set[i]]
            }
        }
        setTable.table = setTable.table.filter( (x) => {return x != null} )
        event.reply('gameUpdate',setTable.table)
    }
})

ipcRenderer.on('addCards', (event, arg) => {
    for(let i = 0; i < 3; i++) {
        setTable.table[setTable.table.length] = setOrder[setTable.usedCards]
        setTable.usedCards++
    }
    event.reply('gameUpdate', setTable.table)
})

function isSet(set) {
    console.log()
    if( new Set( set.map((x) => {return setTable.table[x].number}) ).size == 2 ) return false
    if( new Set( set.map((x) => {return setTable.table[x].color}) ).size == 2 ) return false
    if( new Set( set.map((x) => {return setTable.table[x].shape}) ).size == 2 ) return false
    if( new Set( set.map((x) => {return setTable.table[x].fill}) ).size == 2 ) return false
    return true
}

function newSetOrder() {
    table = []
    for(let number = 0; number < 3; number++) {
        for(let color = 0; color < 3; color++) {
            for(let shape = 0; shape < 3; shape++) {
                for(let fill = 0; fill < 3; fill++) {
                    let card = {"number": number, "color": color, "shape": shape, "fill": fill}
                    table.push(card)
                }
            }
        }
    }
    return shuffle(table)
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        let tmp = a[j]
        a[j] = a[i]
        a[i] = tmp
    }
    return a
}

window.onload = () => {
    ipcRenderer.send('serverReady', true)
}
