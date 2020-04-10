const {ipcRenderer} = require('electron')
const fs = require('fs');
window.$ = window.jQuery = require('jquery')

cards = JSON.parse(fs.readFileSync(__dirname +'/scripts/cards.json'))
set = new Set()

ipcRenderer.on('gameUpdate', (event, arg) => {
    console.log(arg)
    table = arg.table
    $('#table').empty()
    for(let i = 0; i < table.length; i++) {
        $('#table').append('<div class="card" onclick="addToSet()">' + render(table[i]) + '</div>')
    }
})

function addToSet() {
    elem = event.srcElement
    while(!elem.matches('.card')) {
        elem = elem.parentNode
        if(elem === document) {
            return null
        }
    }
    if(elem.classList.contains('active')) {
        elem.classList.remove('active')
        set.delete($('.card').index(elem))
    } else {
        elem.classList.add('active')
        set.add($('.card').index(elem))
    }

    if(set.size == 3) {
        ipcRenderer.send('setFound', Array.from(set))
        for(let item of set) {
            $('.card')[item].classList.remove('active')
        }
        set = new Set()
    }
}

function render(card) {
    svg = '<svg height="200" width="100" style="color:'+cards.colors[card.color]+';">'
    svg += cards.patterns[card.color];
    svg += cards.shapes[card.shape]
    svg += cards.fills[card.fill] + ( card.fill == 2 ? card.color + ')' : '' )
    svg += "'/></svg>"
    svg = svg.repeat(card.number+1)
    return svg
}

window.onload = function() {
    ipcRenderer.send('gameReady', true)
}
