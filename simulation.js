export const Cells = []
export const FORWARD = 3, UP = 3, RIGHT = 0, LEFT = 2, BACKWARD = 1, DOWN = 1
export const NONE = 0, TICK = 1, DIRECTIONAL = 2
export const DELETE = Infinity

export const map = new Map()
let ant_x = 0, ant_y = 0, ant_ch
map.set(0, ant_ch = new Array(256).fill(null))
export const at = (x, y) => {
	if(!(((ant_x ^ x) | (ant_y ^ y)) & -16))return ant_ch
	ant_x = x; ant_y = y
	x = (x & 0xfffff0) + (y & 0xfffff0) * 0x1000000
	let ch = map.get(x)
	if(!ch){
		ch = new Array(256).fill(null)
		map.set(x, ch)
	}
	return ant_ch = ch
}
export const particles = new Set
export class Cell{
	constructor(kind, d, x, y, data = 0){
		this.lx = this.x = x
		this.ly = this.y = y
		this.d = (d &= 3) | d << 2 | kind << 8 | 16
		this.data = data
		const ch = at(x, y), k = (x & 15) | (y << 4 & 240)
		const c = ch[k]
		if(c) Cells[c.d >> 8].subtickGroups[c.d & 3].delete(c)
		ch[k] = this
		Cells[kind].subtickGroups[d].add(this)
	}
	get dir(){return this.d & 3}
	face(dir){
		dir &= 3
		const g = Cells[this.d >> 8].subtickGroups
		if(g[this.d & 3] != g[dir]){
			g[this.d & 3].delete(this)
			g[dir].add(this)
		}
		this.d = (this.d & -4) | dir		
	}
	rot(dir){ return this.face(this.d + dir + 1) }
	get(dir){
		dir &= 3
		let {x, y} = this
		switch(dir){
			case 0: x++; break
			case 1: y++; break
			case 2: x--; break
			case 3: y--; break
		}
		let k = (x & 15) | (y << 4 & 240)
		return at(x, y)[k]
	}
	look(dir){ return this.get(this.d + dir + 1) }
	move(dir, force = 0){
		if(force < 0)return false
		dir &= 3
		let {x, y} = this
		const ch = at(x, y)
		const k = (x & 15) | (y << 4 & 240)
		switch(dir){
			case 0: x++; break
			case 1: y++; break
			case 2: x--; break
			case 3: y--; break
		}
		const k2 = (x & 15) | (y << 4 & 240)
		const ch2 = at(x, y)
		let c = ch2[k2]
		if(c){
			const def = Cells[c.d >> 8]
			if(def.subtickGroups[c.d & 3] == G && def.update == DIRECTIONAL)
				c.tick(), c = ch2[k2] // PRETICK
		}
		if(c){
			const f = Cells[c.d >> 8].push.call(c, dir, force)
			if(f == Infinity)return this.pop(), this.x = x, this.y = y, true
			else if(f == f && !c.move(dir, force + f))return false
		}
		ch[k] = null
		ch2[k2] = this
		this.x = x
		this.y = y
		return true
	}
	go(dir, f = 0){return this.move(this.d + dir + 1, f)}
	tick(){
		if(this.d & 16)return
		this.d |= 16
		try{
			Cells[this.d >> 8].tick.call(this)
		}catch(e){
			/* Stack overflow :(
				Reasons this issue is currently being ignored:
				- We care about not setting fire to our users' house
				- This happens when there is one long string of cells that is over a certain length. No one can realistically even scroll fast enough to see the end of it
				- No one has a powerful enough PC to make a large scale machine that would use million-cell-long strings and not run at 0TPS
				- This would be pretty hard to fix and would probably impact performance elsewhere
			*/
		}
	}
	summon(dir, {d, data = 0}, force = 0){
		if(force < 0)return null
		dir &= 3
		let {x, y} = this
		switch(dir){
			case 0: x++; break
			case 1: y++; break
			case 2: x--; break
			case 3: y--; break
		}
		const k2 = (x & 15) | (y << 4 & 240)
		const ch2 = at(x, y)
		let c = ch2[k2]
		if(c){
			const def = Cells[c.d >> 8]
			if(def.subtickGroups[c.d & 3] == G && def.update == DIRECTIONAL)
				c.tick(), c = ch2[k2] // PRETICK
		}
		if(c){
			const f = Cells[c.d >> 8].push.call(c, dir, force)
			if(f == Infinity)return null
			else if(f == f && !c.move(dir, force + f))return null
		}
		const cell = new Cell(d >> 8, d, x, y, data)
		cell.lx = this.x
		cell.ly = this.y
		cell.d = (cell.d & -29) | (d & 28) | (Cells[d >> 8].subtickGroups[d&3] == G) << 4
		return cell
	}
	make(dir, a, f = 0){return this.summon(this.d + dir + 1, a, f)}
	pop(){
		//DELET :(
		let {x, y} = this
		if(!Cells[this.d >> 8].subtickGroups[this.d & 3].delete(this))return //Cell already deleted
		at(x, y)[(x & 15) | (y << 4 & 240)] = null
	}
	explode(colSet){
		for(let i = 0; i < 15; i++){
			new Particle(colSet[i % colSet.length], this.x + .5, this.y + .5)
		}
	}
	is(c){ return this.d >> 8 == c }
}

class Particle{
	constructor(col, x, y, size = random() + 1, dx = random() * 2 - 1, dy = random() * 2 - 1){
		this.x = x; this.y = y
		this.dx = dx; this.dy = dy;
		this.col = col
		this.size = size
		particles.add(this)
	}
	render(c){
		this.x += this.dx
		this.y += this.dy
		this.dx *= 0.9
		this.dy *= 0.9
		if(abs(this.dx) + abs(this.dy) < 0.03)return void particles.delete(this)
		c.fillStyle = this.col
		c.fillRect(this.x * 16 - this.size, this.y * 16 - this.size, this.size * 2, this.size * 2)
	}
}

export const subtickGroups = []
export const noTickGroup = new Set
export let MSPT = 256
export let lastRender = Date.now()
export let subtick = 0, playState = 0
export const play = p => playState = playState == 0 ? (lastRender = Date.now() - MSPT, p) : 0
let G
let originalCells = null

export const faster = () => MSPT = MSPT <= 1/4096 ? 1/4096 : MSPT / 2
export const slower = () => MSPT = MSPT >= 2048 ? 2048 : MSPT * 2

export function reset(o = originalCells){
	if(!o)return
	map.clear()
	ant_x = -1
	at(0, 0)
	for(const g of subtickGroups)
		g.clear()
	noTickGroup.clear()
	for(let i = 0; i < o.length; i+=3)
		new Cell(o[i] >> 8, o[i] & 3, o[i+1], o[i+2])
	o.length = 0
	originalCells = null
	playState = 0
	subtick = 0
	tickNumber = 0
}

export function save(){
	originalCells = []
	for(const g of subtickGroups)
		for(const c of g)
			originalCells.push(c.d | 28, c.x, c.y)
	for(const c of noTickGroup)
		originalCells.push(c.d | 28, c.x, c.y)
}

export let tickNumber = 0
export function tick(){
	let diff = min(5000, Date.now() - lastRender) / MSPT
	if(playState < 2 && diff < 1)return diff
	if(playState == 0)return min(diff, 1)
	do{
		if(!originalCells) save()
		for(const g of subtickGroups)
			for(const c of g)
				c.lx = c.x, c.ly = c.y, c.d = (c.d & -29) | (c.d & 3) << 2
		for(const c of noTickGroup)
			c.lx = c.x, c.ly = c.y, c.d = (c.d & -29) | (c.d & 3) << 2
		if(playState == 1 || playState == 2){
			if(playState == 2)playState = 0
			while(subtick < subtickGroups.length){
				for(const c of G = subtickGroups[subtick++])
					c.tick()
			}
			subtick = 0
			tickNumber++
		}else if(playState == 3){
			playState = 0
			for(const c of G = subtickGroups[subtick++])
				c.tick()
			if(subtick == subtickGroups.length)subtick = 0, tickNumber++
		}
		if(sounds & BEAT)beatSound()
		if(sounds & BREAK)breakSound()
		sounds = 0
		lastRender = Date.now()
		if(tickNumber % 3000/MSPT < 1){ //Every 3s
			L: for(const [k, v] of map){
				for(let c of v)if(c)continue L
				map.delete(k)
			}
		}
		diff--
	}while(diff >= 1)
	return 0
}
let sounds = 0
export const sound = s => sounds |= s
export const BEAT = 1, BREAK = 2

export let gameAssets = new Queue()
export function texturepack(url, cb = Function.prototype){
	cellset = VIEW.loadImage(localStorage.textures = url || './cellset.png', gameAssets)
	gameAssets.callback(() => cb('Textures loaded!'), e => (cb('Error loading textures'), setTimeout(texturepack, 20, '')))
}
export let cellset = VIEW.loadImage(localStorage.textures || './cellset.png', gameAssets)
export const uiset = VIEW.loadImage('./uiset.png', gameAssets)
export const beatSound = VIEW.loadAudio('./beat.mp3', gameAssets)
export const breakSound = VIEW.loadAudio('./break.mp3', gameAssets)

export function cell(def){
	const c = {atlas: cellset, stx: -1, sty: -1, tx: -1, ty: -1, update: NONE, tick(){}, push(dir, f){return 0}, name: 'Unnamed', clicked(){}}
	for(const key in c) if(key in def) c[key] = def[key]
	return Cells.push(c) - 1
}

export function texture(path){
	return VIEW.loadImage(path, gameAssets)
}
