# Play the game [here](https://blob-machine.pages.dev)

## Modding API

Loading custom cells works by loading ES6 modules from the link copied to clipboard

To create a cell pack, you must host your .js file to a permanant URL (like a raw github url)

Example file contents:

```js

const { BACKWARD, FORWARD, LEFT, RIGHT, UP, sound, DOWN, BEAT, BREAK, cell, DIRECTIONAL, NORMAL } = CELLMODDING


// Define a cell
// This one rotates cells around it to point to itself
cell({
	//Cell name
	name: 'Attract cell',

	//NORMAL = updates every tick, DIRECTIONAL = updates every tick but in cell direction order like movers and generators
	update: NORMAL 

	//Location of cell in texture image. (tx: 0, ty: 0) means top left, and each increment after that is 16px right / down
	//Here (tx: 2, ty: 3) means the texture is at x=32, y=48 (size is always 16x16)
	tx: 2, ty: 3

	tick(){
		//Update the cell
		// Get cells around it, and make them face us
		const above = this.get(UP)
		if(above){
			above.face(DOWN)
		}
		const left = this.get(LEFT)
		if(left){
			left.face(RIGHT)
		}
		const right = this.get(RIGHT)
		if(right){
			right.face(LEFT)
		}
		const below = this.get(DOWN)
		if(below){
			below.face(UP)
		}
	},

	// This is called when the cell gets pushed. Return a force to push back.
	push(dir, force){
		if(dir % 2 == this.dir % 2){
			//Direction is aligned
			return 0 //Allow being pushed
		}else{
			//Returning a force of -Infinity will in effect make it impossible to push the cell
			return -Infinity
		}
		//You could also return DELETE to delete the cell that was pushing you (e.g trash cell)
	}
})

```

### Available methods on cells

```js
cell.dir
```
Current cell direction. May be `== UP`, `== DOWN`, `== LEFT` or `== RIGHT`

---
```js
cell.face(dir)
```
Make cell face direction

---
```js
cell.rot(dir)
```
Face direction relative to current facing (e.g RIGHT will make cell rotate once right)

---
```js
cell.get(dir)
```
Get cell in that direction

---
```js
cell.look(dir)
```
Get cell in relative direction (e.g direction FORWARD)

---
```js
cell.move(dir, force?)
```
Move in direction

Returns `false` if failed to move (e.g a wall in the way)

---
```js
cell.go(dir, force?)
```
Move cell in relative direction

Returns `false` if failed to move (e.g a wall in the way)

---
```js
cell.summon(dir, otherCell, force?)
```
Summon a cell in direction

Returns `null` if failed to move (e.g a wall in the way)

Returns the new cell otherwise

---
```js
cell.make(dir, otherCell, force?)
```
Summon a cell in relative direction

Returns `null` if failed to move (e.g a wall in the way)

Returns the new cell otherwise