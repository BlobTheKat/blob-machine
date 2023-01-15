import * as TITLE from './title.js'
import * as MAIN from './main.js'
import { Cell, Cells, DIRECTIONAL, NORMAL, noTickGroup, subtickGroups } from './simulation.js'
await Promise.all(['./cells.js'].map(a => import(a)))
for(const d of Cells){
	if(d.update == DIRECTIONAL){
		d.subtickGroups = [new Set, new Set, new Set, new Set]
		subtickGroups.push(d.subtickGroups[0], d.subtickGroups[2], d.subtickGroups[3], d.subtickGroups[1])
	}else if(d.update == NORMAL){
		const a = new Set
		d.subtickGroups = [a, a, a, a]
		subtickGroups.push(a)
	}else d.subtickGroups = [noTickGroup, noTickGroup, noTickGroup, noTickGroup]
}

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
for(const mod of (localStorage.mods||'').split('\n'))if(mod)await import(mod),mods++