import { at, tick, Cells, play, Cell, reset, particles, cellset, beatSound, gameAssets, breakSound, tickNumber, uiset, playState, slower, faster, MSPT, map } from "./simulation.js"

const base64abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
// I was lazy, might implement my own later
function bytesToBase64(bytes, result = '') {
	let i = 2, l = bytes.length;
	for (; i < l; i += 3) {
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
		result += base64abc[bytes[i] & 0x3F];
	}
	if (i === l + 1) { // 1 octet yet to write
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[(bytes[i - 2] & 0x03) << 4];
		result += "==";
	}
	if (i === l) { // 2 octets yet to write
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[(bytes[i - 1] & 0x0F) << 2];
		result += "=";
	}
	return result;
}



let cam = {x: 0, y: 0, z: 1, r: 0}
let pattern
export async function init(){
	await gameAssets.async()
	const img = cellset.resize(0, 0, 16, 16, 16, 16, gameAssets)
	await gameAssets.async()
	pattern = this.createPattern(img, null)
}
let lmx = 0, lmy = 0, lwy = 0
let dx = 0, dy = 0
let spaceBarDown = false, specialKeyDown = false, tabDown = false, qDown = false, eDown = false, backspaceDown = false, shiftDown = false, mouseDown = false
let rot = 0, dir = 0, PEN = 0, PEN2 = -1
const numberKeys = [KEY_0, KEY_1, KEY_2, KEY_3, KEY_4, KEY_5, KEY_6, KEY_7, KEY_8, KEY_9]
let paletteScroll = 0, copyFade = 1
export function render(dt){
	if(scene != 2 || gameAssets.left)return
	this.resize(VIEW.width, VIEW.height, !!+localStorage.smooth)
	if(VIEW.buttons.has(RBUTTON) && !+localStorage.controls){
		cam.x += (lmx - this.mx) * .25 / cam.z / px
		cam.y += (lmy - this.my) * .25 / cam.z / px
	}
	if(shiftDown ^ (shiftDown = VIEW.buttons.has(KEY_SHIFT) ^ VIEW.buttons.has(KEY_CAPSLOCK) ^ (+localStorage.controls && VIEW.buttons.has(RBUTTON))))[PEN, PEN2] = [PEN2, PEN]
	const mouseWasDown = mouseDown
	a: if(mouseDown = VIEW.buttons.has(LBUTTON) || (+localStorage.controls && VIEW.buttons.has(RBUTTON))){
		if((this.height - this.my) / px < 112){
			const p = floor((this.mx / px - 14 + paletteScroll) / 100) - 1
			if(p < Cells.length)PEN = p
		}else if((this.height - this.my) / px < 160 && this.mx / px < 364){
			if(mouseWasDown)break a
			if(this.mx / px < 84)scene = 1
			else if(this.mx / px < 140)play(1)
			else if(this.mx / px < 196)slower()
			else if(this.mx / px < 252)faster()
			else if(this.mx / px < 308)reset()
			else{
				if(copyFade < 0.7)break a
				//SAVE
				const bufs = []
				let e = new Uint8Array(7 * 256)
				for(const [k, ch] of map){
					let i = 0, j = -1, count = 0
					for(const c of ch){
						j++
						if(!c)continue
						count++; e[i++] = j
						e[i++] = (c.data ? 128 : 0) | (c.d >> 6 & 60) | (c.d & 3)
						if(c.d > 4095) e[i-1] |= 64, e[i++] = c.d >> 12
						if(c.data) c.data = floor(c.data) | 0, e[i++] = c.data >> 24, e[i++] = c.data >> 16, e[i++] = c.data >> 8, e[i++] = c.data
					}
					if(!i)continue
					const buf = new Uint8Array(i + 6)
					buf.set(e.subarray(0, i), 6)
					buf[0] = k >> 16
					buf[1] = k >> 8
					buf[2] = k | (count & 15)
					buf[3] = k / 1099511627776
					buf[4] = k / 4294967296
					buf[5] = k >> 24 | count >> 4
					bufs.push(buf)
				}
				const res = new Uint8Array(bufs.reduce((a,b)=>a+b.length,0))
				let i = 0
				for(const buf of bufs){
					res.set(buf, i)
					i += buf.length
				}
				navigator.clipboard.writeText(bytesToBase64(res, 'blob:')).then(() => copyFade = 0)
			}
		}else{
			const x = floor((this.mx - this.width/2) * .25 / cam.z / px + cam.x) >> 4
			const y = floor((this.my - this.height/2) * .25 / cam.z / px + cam.y) >> 4
			const ch = at(x, y), k = (x & 15) | (y << 4 & 240)
			const c = ch[k]
			if(PEN < 0){
				ch[k] = null
				if(c){
					breakSound()
					Cells[c.d >> 8].subtickGroups[c.d & 3].delete(c)
				}
			}else if(c && (c.d & 3) == dir && (c.d >> 8) == PEN){
				if(mouseWasDown)break a
				Cells[PEN].clicked.call(c)
			}else{
				if(!c || (c.d & 3) != dir || c.d >> 8 != PEN)beatSound()
				new Cell(PEN, dir, x, y)
			}
		}
	}
	cam.x += dx / cam.z * 2
	cam.y += dy / cam.z * 2
	dx *= 0.01 ** dt; dy *= 0.01 ** dt
	if(abs(rot) <= 0.1)rot = 0
	rot -= sign(rot) * 0.1
	if(VIEW.buttons.has(KEY_W))dy = -1
	if(VIEW.buttons.has(KEY_A))dx = -1
	if(VIEW.buttons.has(KEY_S))dy = 1
	if(VIEW.buttons.has(KEY_D))dx = 1
	for(let i = 0; i < numberKeys.length; i++)
		if(VIEW.buttons.has(numberKeys[i]) && i <= Cells.length){
			PEN = i - 1
			break
		}
	if(!backspaceDown & (backspaceDown = VIEW.buttons.has(KEY_BACKSPACE)))reset()
	if(!qDown & (qDown = VIEW.buttons.has(KEY_Q)))rot = 1, dir = (dir - 1) & 3
	if(!eDown & (eDown = VIEW.buttons.has(KEY_E)))rot = -1, dir = (dir + 1) & 3
	if((this.height - this.my) / px < 112){
		paletteScroll = max(0, min(paletteScroll - (lwy - (lwy = VIEW.wya)), 164 + Cells.length * 100 - this.width / px))
	}else cam.z *= 1.001 ** (lwy - (lwy = VIEW.wya))
	if(cam.z < 0.005)cam.z = 0.005
	if(cam.z > 2)cam.z = 2
	lmx = this.mx; lmy = this.my
	if(!spaceBarDown & (spaceBarDown = VIEW.buttons.has(KEY_SPACE)))play(1)
	if(!specialKeyDown & (specialKeyDown = VIEW.buttons.has(KEY_SYMBOL)))play(3)
	if(!tabDown & (tabDown = VIEW.buttons.has(KEY_TAB)))play(2)
	this.camTransform(cam.x, cam.y, .25 / cam.z, cam.r)
	this.fillStyle = pattern
	this.fillRect(cam.x - this.xs, cam.y - this.ys, this.xs * 2, this.ys * 2)

	const diff = tick()//(0.0009765625**tick() - 1) * -1.0009775171065494
	let x0 = floor(cam.x - this.xs >> 8), x1 = floor(cam.x + this.xs >> 8) + 1, y0 = floor(cam.y - this.ys >> 8), y1 = floor(cam.y + this.ys >> 8) + 1
	this.font = '8px Mono'
	this.textAlign = 'center'
	this.textBaseline = 'middle'
	this.fillStyle = '#fff'
	this.strokeStyle = '#0008'
	for(let x = x0; x < x1; x++){
		for(let y = y0; y < y1; y++){
			let ch = at(x<<4, y<<4)
			for(const c of ch){
				if(!c)continue
				const def = Cells[c.d >> 8]
				const rot = (((c.d & 3) - (c.d >> 2 & 3) << 30 >> 30) * diff + (c.d >> 2 & 3)) * PI / 2
				this.save()
				this.translate((c.x<<4) * diff + (c.lx<<4) * (1 - diff) + 8, (c.y<<4) * diff + (c.ly<<4) * (1-diff) + 8)
				if(def.stx >= 0 && def.sty >= 0)
					this.drawImage(def.atlas, def.stx<<4, def.sty<<4, 16, 16, -8, -8, 16, 16)
				this.rotate(rot)
				if(def.tx >= 0 && def.ty >= 0)
					this.drawImage(def.atlas, def.tx<<4, def.ty<<4, 16, 16, -8, -8, 16, 16)
				if(c.data > 0){
					this.strokeText(c.data, 0, 0, 16)
					this.fillText(c.data, 0, 0, 16)
				}
				this.restore()
			}
		}
	}
	for(const particle of particles)particle.render(this)
	let i = 0
	const y = this.height / px - 64
	for(const cell of Cells){
		this.setTransform(px * (i == PEN ? 1 : .8), 0, 0, px * (i == PEN ? 1 : .8), (164 - paletteScroll + 100*i) * px, y * px)
		this.globalAlpha = i == PEN ? 1 : .5
		if(cell.stx >= 0 && cell.sty >= 0)
			this.drawImage(cell.atlas, cell.stx<<4, cell.sty<<4, 16, 16, -32, -32, 64, 64)
		this.rotate((dir + rot) * PI / 2)
		if(cell.tx >= 0 && cell.ty >= 0)
			this.drawImage(cell.atlas, cell.tx<<4, cell.ty<<4, 16, 16, -32, -32, 64, 64)
		i++
	}
	this.globalAlpha = 1
	this.setTransform(px * (PEN == -1 ? 1 : .8), 0, 0, px * (PEN == -1 ? 1 : .8), (64 - paletteScroll) * px, y * px)
	this.fillStyle = PEN == -1 ? '#0008' : '#0004'
	this.fillRect(-32, -32, 64, 64)
	this.globalAlpha = 1
	this.setTransform(px, 0, 0, px, 0, this.height)
	this.drawImage(uiset, 0, 0, 7, 7, 38, -150, 36, 36)
	this.drawImage(uiset, playState == 0 ? 7 : 14, 0, 7, 7, 94, -150, 36, 36)
	this.globalAlpha = MSPT >= 2048 ? .5 : 1
	this.drawImage(uiset, 21, 0, 7, 7, 150, -150, 36, 36)
	this.globalAlpha = MSPT <= 1 ? .5 : 1
	this.drawImage(uiset, 28, 0, 7, 7, 206, -150, 36, 36)
	this.globalAlpha = 1
	this.drawImage(uiset, 35, 0, 7, 7, 262, -150, 36, 36)
	this.globalAlpha = copyFade
	if(copyFade >= 0.99)copyFade = 1
	else copyFade += 0.01
	this.drawImage(uiset, 42, 0, 7, 7, 318, -150, 36, 36)
	this.globalAlpha = 1
	this.textBaselign = 'alphabetic'
	this.font = '20px Mono'
	this.fillStyle = '#fff5'
	this.textAlign = 'left'
	this.fillText('space = play,  tab = step,  backspace = restart,  shift = break.  Tick: '+tickNumber, 38, -11)
	this.fillStyle = '#fffa'
	this.fillText(PEN == -1 ? '' : Cells[PEN].name, 390, -120)
}