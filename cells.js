import { BACKWARD, BEAT, BREAK, cell, DIRECTIONAL, DOWN, FORWARD, LEFT, NORMAL, RIGHT, sound, UP } from './simulation.js'

cell({
	tick(){
		const a = this.look(BACKWARD)
		if(a)this.make(FORWARD, a), sound(BEAT)
	},
	update: DIRECTIONAL,
	tx: 1, ty: 1
})

cell({
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
	update: NORMAL,
	tx: 3, ty: 1
})

cell({
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
	update: NORMAL,
	tx: 0, ty: 2
})

cell({
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
	tx: 1, ty: 2
})

cell({
	push(dir){
		return ((dir ^ this.dir) & 1) ? -Infinity : 0
	},
	tx: 2, ty: 2
})

cell({
	push(dir){
		return -Infinity
	},
	tx: 3, ty: 0
})
const redColors = ['#600', '#700', '#800', '#900', '#a00', '#b00', '#c00', '#d00']
cell({
	push(dir){
		this.explode(redColors)
		sound(BREAK)
		this.pop()
		return Infinity
	},
	tx: 2, ty: 1
})

cell({
	push(dir){
		sound(BREAK)
		return Infinity
	},
	tx: 3, ty: 2
})

const breadColors = ['#cb8', '#ca7', '#c96']
cell({
	push(dir, f){
		if(f < 2)return -Infinity
		this.explode(breadColors)
		sound(BREAK)
		this.pop()
		return Infinity
	},
	tx: 0, ty: 3
})

//Trap enemy
cell({
	push(dir){
		this.summon(dir, this)
		return Infinity
	},
	tx: 2, ty: 1
})