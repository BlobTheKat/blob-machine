import * as TITLE from './title.js'
import * as MAIN from './main.js'
import * as MODDING from './simulation.js'
globalThis.CELLMODDING = MODDING
localStorage.cellpacks = localStorage.cellpacks || './cells.js'

globalThis.scene = 0

const main = VIEW.canvas()
MAIN.init.call(main)
Object.assign(main, MAIN)
VIEW.add(main)
const title = VIEW.canvas()
Object.assign(title, TITLE)
VIEW.add(title)
VIEW.title = 'Blob Machine'
VIEW.icon = './icon.png'
//VIEW.pointer = 'none'
globalThis.mods = 0