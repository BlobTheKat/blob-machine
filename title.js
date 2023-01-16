import { Button, Node, renderui } from "./components.js"
import { Cell, Cells, cellset, DIRECTIONAL, map, NORMAL, noTickGroup, reset, subtickGroups, texturepack } from "./simulation.js"

const titleAssets = new Queue()
const icon = VIEW.loadImage('./icon.png', titleAssets)
const titleScreen = VIEW.loadVideo('./titlescreen.mp4', titleAssets)
titleScreen.muted = true
const proglet = VIEW.loadAudio('./proglet.mp3', titleAssets)
const titleMusicStart = VIEW.loadAudio('./start.mp3', titleAssets)
const titleMusicLoop = VIEW.loadAudio('./loop.mp3', titleAssets)
titleMusicLoop.loop = true

VIEW.loadFont('Mono', 'Monocraft.ttf')
await titleAssets.async()
let err = ''

const vNode = VIEW.audio.createGain()
vNode.volume = 0.16
vNode.to(VIEW.audio)
let music = null
function title(){
	if(music)music.end()
	scene = 1
	splash = splashes[Math.floor(Math.random() * splashes.length)]
	music = Math.random() < (!!+localStorage.proglet ? .9 : .1) ? proglet(true) : titleMusicStart().then(titleMusicLoop, true, 0)
	music.to(vNode)
	if(err){
		titleNodes.push(new class extends Node{
			w = 400; h = 200; fx = .5; fy = .5; x = -200; y = -100
			text = err
			render(c, dt){
				const {x, y, w, h} = this.frame()
				c.lineWidth = 5
				c.fillStyle = '#000c'
				c.fillRect(x, y, w, h)
				c.strokeStyle = '#fffc'
				c.strokeRect(x - 2.5, y - 2.5, w + 5, h + 5)
				c.textAlign = 'center'
				c.fillStyle = '#fff'
				c.font = '20px Mono, Consolas, Menlo, monospace'
				c.fillText(this.text, x + w / 2, y + h / 3, w)
			}
		}, new class extends Button{
			fx = .5; w = 200; x = -100; h = 50; fy = .5; y = 10; text = 'Ok'; cb = () => (titleNodes.pop(), titleNodes.pop(), err = '')
		})
	}
}

class MenuButton extends Button{ x = 15; fy = .5; w = 270; h = 50; constructor(text, y, cb = Function.prototype){super(); this.text = text; this.y = y; this.cb = cb} }

let splash
export const splashes = `
NOW WITH SPLASH TEXTS!!
NOT MINCERAFT!!
new class extends!
CMMM+MMMM (MMMM) + MMM
[inappropriate word blocked]
Thank you TheTrashCell!!
UNL3SS...
NOTFORLONG
blebket
undefined
its a lorax reference!!
kat the blob
MillionNachos
Phace reveal!!1!
proglet
proglet
proglet
The earth is NOT flat
i forgor :skull:
i havent asked
Also try Pyll Machine!
Contains magnesium!
Impossibru
Objection!
blob cell wen ¯\\_(ツ)_/¯
`.trim().split('\n')
class Checkbox extends Node{
	fx = 1; fy = 1; x = -10; y = -10
	key = ''
	name = ''
	get activated(){return !!+localStorage[this.key]}
	set activated(a){localStorage[this.key] = +!!a}
	clicked = false
	render(c){
		const {x, y} = this.frame()
		c.fillStyle = '#0008'
		c.strokeStyle = '#fff'
		c.fillRect(x - 20, y - 20, 20, 20)
		c.strokeRect(x - 20, y - 20, 20, 20)
		if(this.activated){
			c.fillStyle = '#25E'
			c.fillRect(x - 16, y - 16, 12, 12)
		}
		c.font = '15px Mono, Consolas, Menlo, monospace'
		c.textAlign = 'right'
		c.fillStyle = '#fff'
		c.fillText(this.name, x - 25, y - 4)
		const clicking = c.mx / px < x && c.my / px < y && c.mx / px >= x - 20 && c.my / px >= y - 20 && VIEW.buttons.has(LBUTTON)
		if(clicking && !this.clicked){
			this.activated = !this.activated
			title()
		}
		this.clicked = clicking
	}
}

const titleNodes = [
	new class extends Checkbox{
		key = 'proglet'
		name = 'Proglet'
	},
	new class extends Checkbox{
		y = -40
		key = 'controls'
		name = 'Vanilla controls'
	},
	new class extends Checkbox{
		y = -70
		key = 'smooth'
		name = 'Anti-aliasing'
	},
	new class extends Node{
		x = 150; fx = .5
		y = 80; fy = 0
		s = 0
		sub = 'v1.1'
		render(c, dt){
			const {x, y} = this.frame()
			c.font = '60px Mono, Consolas, Menlo, monospace'
			c.lineWidth = 10
			c.strokeStyle = '#000'
			c.textAlign = 'right'
			c.strokeText('Blob ', x - 40, y)
			c.fillStyle = '#E92'
			c.fillText('Blob ', x - 40, y)
			c.strokeStyle = '#000'
			c.textAlign = 'left'
			c.strokeText('Machine', x - 40, y)
			c.fillStyle = '#fff'
			c.fillText('Machine', x - 40, y)
			c.font = '40px Mono, Consolas, Menlo, monospace'
			c.textAlign = 'center'
			c.strokeStyle = '#000'
			c.strokeText(this.sub, x, y + 50)
			c.fillStyle = '#29E'
			c.fillText(this.sub, x, y + 50)
			c.save()
			c.translate(x + 70 * px, y + 60 * px)
			c.rotate(-0.3)
			c.scale(Math.sin(T * 6) / 10 + 1, Math.sin(T * 6) / 10 + 1)
			c.font = '20px Mono, Consolas, Menlo, monospace'
			c.fillStyle = '#ff0'
			c.fillText(splash, 0, 0)
			c.restore()
		}
	},
	new class extends Node{
		w = 300; fh = 1
		render(c, dt){
			const {x, y, w, h} = this.frame()
			c.lineWidth = 5
			c.fillStyle = '#0008'
			c.fillRect(x, y, w, h)
			c.strokeStyle = '#fff8'
			c.strokeRect(x - 2.5, y - 2.5, w + 5, h + 5)
		}
	},
	new MenuButton('Play', -210, () => {
		if(err)return
		scene = 2
	}),
	new MenuButton('From Clipboard', -140, () => {
		if(err)return
		navigator.clipboard.readText().then(txt => {
			txt = atob(txt)
			let x, y, l = 0
			reset([])
			for(let i = 0; i < txt.length;){
				if(!l){
					x = ((txt.charCodeAt(i++) << 16) | (txt.charCodeAt(i++) << 8) | txt.charCodeAt(i++)) << 8 >> 8
					y = ((txt.charCodeAt(i++) << 16) | (txt.charCodeAt(i++) << 8) | txt.charCodeAt(i++)) << 8 >> 8
					l = (x & 15) | (y & 15) << 4
					x &= -16; y &= -16
				}
				l--
				const k = txt.charCodeAt(i++), d = txt.charCodeAt(i++)
				new Cell(d >> 2, d & 3, x | (k & 15), y | (k >> 4))
			}
			scene = 2
		}).catch(e => {console.warn(e); err = 'Couldn\'t read clipboard'; title()})
	}),
	new MenuButton('Load cell pack', -70, () => {
		if(err)return
		navigator.clipboard.readText().then(txt => {
			if(!/(\.\/.+(\n|$)|(https?:)?\/\/.+(\n|$))+/yi.test(txt))throw 'Invalid cell packs'
			localStorage.cellpacks += '\n' + txt
			location += ''
		}).catch(e => {err = 'Couldn\'t read clipboard'; title()})
	}),
	new MenuButton('Load txtr pack', 0, () => {
		if(err)return
		navigator.clipboard.readText().then(txt => {
			txt = txt.trim()
			if(!txt){
				err = 'Empty clipboard!'
				title()
				return
			}
			texturepack(txt, e => { err = e; title() })
		}).catch(e => {err = 'Couldn\'t read clipboard'; console.warn(e); title()})
	}),
	//new MenuButton('Options', 70),
]
let ld = false
localStorage.cellpacks = localStorage.cellpacks || './cells.js'
const packs = localStorage.cellpacks.split('\n')
export function render(dt){
	this.resize(VIEW.width, VIEW.height, !!+localStorage.smooth)
	VIEW.pointer = ''
	if(!scene){
		this.fillRect(0, 0, this.width, this.height)
		this.font = 30 * px + 'px Mono, Consolas, Menlo, monospace'
		this.textAlign = 'center'
		this.fillStyle = '#fff'
		this.drawImage(icon, 0, 0, icon.width, icon.height, this.width / 2 - 150 * px, this.height / 2 - 300 * px, 300 * px, 300 * px)
		this.fillText('Click to start', this.width / 2, this.height / 2 + 50 * px, this.width)
		this.font = 20 * px + 'px Mono, Consolas, Menlo, monospace'
		this.globalAlpha = 0.4
		this.fillText(packs.length+' cell packs loaded', this.width / 2, this.height / 2 + 90 * px, this.width)
		this.fillText('Blob machine v1.1', this.width / 2, this.height / 2 + 120 * px, this.width)
		this.font = 12 * px + 'px Mono, Consolas, Menlo, monospace'
		this.fillText('clear all modifications', this.width / 2, this.height - 20 * px, this.width)
		this.font = 15 * px + 'px Mono, Consolas, Menlo, monospace'
		this.fillText('© 2023 blob.kat@hotmail.com', this.width / 2, this.height - 50 * px, this.width)
		if(VIEW.buttons.has(0) && !ld){
			if(this.my > this.height - 30 * px){
				localStorage.cellpacks = './cells.js'
				localStorage.textures = ''
				location += ''
				return
			}
			ld = true
			Promise.all(packs.map(a => import(a))).then(a => {
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
				title()
			})
		}
		return
	}
	if(scene == 1){
		this.fillStyle = '#3a3a3a'
		this.fillRect(0, 0, this.width, this.height)
		if(titleScreen.paused)titleScreen.play()
		if(!titleScreen.currentTime)titleScreen.currentTime = 0.1
		const w = titleScreen.videoWidth * this.height / titleScreen.videoHeight
		const x = (this.width - w) / 2
		this.drawImage(titleScreen, 0, 0, titleScreen.videoWidth, titleScreen.videoHeight, x, 0, w, this.height)
		renderui(this, titleNodes, dt)
	}else if(scene == 2){

	}
}