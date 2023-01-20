let mx, my, W, H

export function renderui(ctx, nodes, dt) {
	mx = ctx.mx / px
	my = ctx.my / px
	W = ctx.width / px
	H = ctx.height / px
	ctx.scale(px, px)
	for (const node of nodes) node.render(ctx, dt)
}
// EXTEND CONSTRUCTORS!!!!!
export class Node {
	x = 0; y = 0
	w = 0; h = 0
	fx = 0; fy = 0
	fw = 0; fh = 0
	render(c, dt) { }
	frame() {
		return {
			x: this.fx * W + this.x,
			y: this.fy * H + this.y,
			w: this.fw * W + this.w,
			h: this.fh * H + this.h,
		}
	}
	sub(fx, x, fy, y, fw, w, fh, h) {
		x += this.x + fx * this.w; fx = fx * this.fw + this.fx
		y += this.y + fy * this.h; fy = fy * this.fh + this.fy
		w += fw * this.w; fw *= this.fw
		h += fh * this.h; fh *= this.fh
		// todo do something with numbers
	}
}
export class Button extends Node {
	text = ''
	cb = Function.prototype
	down = false
	render(c, dt) {
		const { x, y, w, h } = this.frame()
		c.strokeStyle = '#fff'
		c.fillStyle = '#fff'
		c.lineWidth = 5
		c.font = '25px Mono, Consolas, Menlo, monospace'
		if (mx >= x && mx < x + w && my >= y && my < y + h) {
			VIEW.pointer = 'pointer'
			c.strokeStyle = '#aaf'
			const has0 = VIEW.buttons.has(0)
			if (has0 && !this.down) { this.down = true }
			else if (this.down && !has0) {
				this.down = false
				this.cb()
			}
		} else if (this.down && !VIEW.buttons.has(0)) {
			this.down = false
		}
		if (this.down) c.strokeStyle = '#88f'
		c.strokeRect(x, y, w, h)
		c.fillText(this.text, x + w / 2 + 5, y + h / 2 + 10)
	}
}
