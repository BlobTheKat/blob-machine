import { BACKWARD, BEAT, BREAK, cell, DIRECTIONAL, DOWN, FORWARD, LEFT, TICK, RIGHT, sound, UP, texture } from './simulation.js'


const redColors = ['#600', '#700', '#800', '#900', '#a00', '#b00', '#c00', '#d00']
const breadColors = ['#cb8', '#ca7', '#c96']

cell({
	name: 'Generator',
	tick(){
		const a = this.look(BACKWARD)
		if(a && !a.is(voidcell))this.make(FORWARD, a), sound(BEAT)
	},
	update: DIRECTIONAL,
	tx: 1, ty: 1
})
cell({
	name: 'CW Rotator',
	tick(){
		let a = this.get(UP)
		if(a) a.rot(RIGHT)
		a = this.get(RIGHT)
		if(a) a.rot(RIGHT)
		a = this.get(LEFT)
		if(a) a.rot(RIGHT)
		a = this.get(DOWN)
		if(a) a.rot(RIGHT)
	},
	update: TICK,
	tx: 3, ty: 1
})
cell({
	name: 'CCWRotator',
	tick(){
		let a = this.get(UP)
		if(a) a.rot(LEFT)
		a = this.get(RIGHT)
		if(a) a.rot(LEFT)
		a = this.get(LEFT)
		if(a) a.rot(LEFT)
		a = this.get(DOWN)
		if(a) a.rot(LEFT)
	},
	update: TICK,
	tx: 0, ty: 2
})
cell({
	name: 'Mover',
	tick(){
		this.go(FORWARD)
	},
	push(dir){
		return dir == this.dir ? 1 : (dir ^ 2) == this.dir ? -1 : 0
	},
	update: DIRECTIONAL,
	tx: 0, ty: 1
})
cell({
	name: 'Push',
	tx: 1, ty: 2
})
cell({
	name: 'Slide',
	push(dir){
		return ((dir ^ this.dir) & 1) ? -Infinity : 0
	},
	tx: 2, ty: 2
})
const wall = cell({
	name: 'Immovable',
	push(dir){
		return -Infinity
	},
	stx: 3, sty: 0
})
cell({
	name: 'Enemy',
	clicked(){ this.data++ },
	push(dir){
		if(this.data--)return Infinity
		this.explode(redColors)
		sound(BREAK)
		this.pop()
		return Infinity
	},
	tx: 2, ty: 1
})
const trash = cell({
	name: 'Trash',
	push(dir){
		sound(BREAK)
		return Infinity
	},
	tx: 3, ty: 2
})
cell({
	name: 'Bread',
	clicked(){
		if(this.data)this.data++
		else this.data = 2
	},
	push(dir, f){
		if(f < (this.data || 3) - 1)return -Infinity
		this.explode(breadColors)
		sound(BREAK)
		this.pop()
		return Infinity
	},
	tx: 0, ty: 3
})
cell({
	name: 'Trapenemy',
	push(dir){
		this.summon(dir, this)
		return Infinity
	},
	tx: 2, ty: 1
})
const sticky = cell({
	name: 'Sticky',
	push(dir, f){
		if(v2.has(this))return 0
		vstack++
		let a
		try{ a = stick(this, dir, f) }catch(e){}
		if(!--vstack)visited.clear(), v2.clear()
		return a ? NaN : -Infinity
	},
	tx: 1, ty: 3
})
const visited = new Set, v2 = new Set
let vstack = 0
function stick(me, dir, f, l = 3){
	if(visited.has(me))return false
	visited.add(me)
	if(me.is(wall))return false
	if(!me.is(sticky))return me.move(dir, f)
	const a = l & 1 ? me.get(dir + 1) : null, b = l & 2 ? me.get(dir - 1) : null, c = l & 4 ? me.get(dir + 2) : null
	if(!me.move(dir, f))return false
	if(a)stick(a, dir, f, 5)
	if(b)stick(b, dir, f, 6)
	if(c)return v2.add(this), stick(c, dir, f, 7)
	return true
}
const diamondColors = ['#E52', '#F64', '#F75']
cell({
	name: 'Diamond',
	push(dir, f){
		let a = this.get(dir)
		if(a && (a.is(trash) || a.is(counterTrash)))return -Infinity
		return -2
	},
	tx: 2, ty: 3
})


const extensionAtlas = texture('./extension.png')

cell({
	name: 'Crab',
	atlas: extensionAtlas,
	stx: 2, sty: 0,
	tx: 3, ty: 0,
	update: DIRECTIONAL,
	tick(){
		if(this.dir & 1)return
		this.go(FORWARD)
	},
	push(dir){
		return dir == this.dir ? 1 : (dir ^ 2) == this.dir ? -1 : 0
	},
})

/**
 * Credit to Calion#0501 for these cells
 */

const fireworkCols = ['#B3312C','#EB8844','#DECF2A','#41CD34','#6689D3','#253192','#7B2FBE','#D88198']

cell({
	name: 'Firework',
	tx: 1, ty: 0,
	update: TICK,
	atlas: extensionAtlas,
	
	clicked() {
		this.data++
	},
	tick() {
		this.face(UP)
		this.go(UP)
		if(!this.data)this.data = 6
		if (--this.data == 0) {
			this.explode([fireworkCols[random()*fireworkCols.length|0],fireworkCols[random()*fireworkCols.length|0]])
			sound(BREAK)
			this.pop()
		}
	}
})

cell({
	name: 'Increment',
	tx: 0, ty: 0,
	update: TICK,
	atlas: extensionAtlas,

	tick() {
		const cell = this.get(this.dir)
		if(!cell)return
		if(cell.data < -1)cell.data = -1
		cell.data++
	}
})
cell({
	name: 'Decrement',
	tx: 0, ty: 1,
	update: TICK,
	atlas: extensionAtlas,

	tick() {
		const cell = this.get(this.dir)
		if(!cell || cell.data < 1)return
		cell.data--
	}
})

const voidcell = cell({
	name: 'Void',
	stx: 2, sty: 0,
	push(dir, f){return -Infinity}
})

const counterTrash = cell({
	name: 'Counter Trash',
	push(dir){
		sound(BREAK)
		this.data++
		return Infinity
	},
	atlas: extensionAtlas,
	tx: 2, ty: 1
})

const trashMover = cell({
	name: 'Trash Mover',
	tick(){
		let a = this.look(FORWARD)
		if(a && !a.is(voidcell))a.pop(), sound(BREAK)
		this.go(FORWARD)
	},
	atlas: extensionAtlas,
	update: DIRECTIONAL,
	tx: 1, ty: 1
})