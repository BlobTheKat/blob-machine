const { BACKWARD, FORWARD, LEFT, RIGHT, UP, DOWN, sound, BEAT, BREAK, cell, DIRECTIONAL, TICK } = CELLMODDING

// trollge
cell({
  name: 'Troll mover',
  tx: 0, ty: 1,
  push(dir, f) {
    const behind = this.get(dir + 2)
    if (behind) behind.rot(BACKWARD)
    sound(BEAT)
    return -Infinity
  },
  update: TICK,
  tick() {
    this.rot(random() < .5 ? RIGHT : LEFT)
  },
})
