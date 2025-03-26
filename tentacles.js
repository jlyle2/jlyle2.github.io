const TENTACLE_COUNT = 200
const TENTACLES_PER_ROW = 20
const PIXELS_PER_TENTACLE = 10
const TENTACLE_LENGTH = 20
const FRAME_RATE = 60

const NATURE_SPEED = 7
const NATURE_ANGLE_CHANGE = 0.0005
const MOUSE_WAVE_RADIUS = 50
const MOUSE_WAVE_STRENGTH = 0.15
const MOUSE_WAVE_MAX_RADIUS = 650
const NATURE_WAVE_RADIUS = 100
const NATURE_WAVE_STRENGTH = 0.03
const NATURE_WAVE_MAX_RADIUS = 1000

let tentacles = []
let mouseWaves = []

let previousMouseX = 0
let previousMouseY = 0

let natureX = 60
let natureY = 60
let natureAngle

let diameter = 40
let natureSpeed = 7

function setup() {
  frameRate(FRAME_RATE)
  diameter = getDiameter(windowWidth)
  natureSpeed = getNatureSpeed(windowWidth)
  const headerHeight = document.querySelector("header").offsetHeight
  const canvas = createCanvas(windowWidth, headerHeight)
  canvas.parent('p5-container')
  canvas.style('display', 'block')

  natureAngle = PI / 4
  initializeTentacles()
}

function windowResized() {
  diameter = getDiameter(windowWidth)
  natureSpeed = getNatureSpeed(windowWidth)
  const headerHeight = document.querySelector("header").offsetHeight
  resizeCanvas(windowWidth, headerHeight)
  initializeTentacles()
}

function draw() {
  cursor(HAND)
  background(70, 70, 150)

  trackMouseMovement()
  trackNatureMovement()
  updateTentaclesWithWaves()
  restrictTentacleMovement()
  drawTentacles()
}

function initializeTentacles() {
  tentacles = []
  const dividerW = windowWidth / TENTACLES_PER_ROW
  const dividerH = height / (TENTACLE_COUNT / TENTACLES_PER_ROW)

  for (let i = 0; i < TENTACLE_COUNT; i++) {
    const row = floor(i / TENTACLES_PER_ROW)
    const col = i % TENTACLES_PER_ROW

    const baseX = dividerW * col + random(-20, 20)
    const baseY = dividerH * row + random(-20, 20) + 20

    const tentacle = []
    for (let j = 0; j < TENTACLE_LENGTH; j++) {
      tentacle.push([baseX - j, baseY - j])
    }

    tentacles.push(tentacle)
  }
}

function trackMouseMovement() {
  if (mouseX !== previousMouseX || mouseY !== previousMouseY) {
    mouseWaves.push({
      x: mouseX,
      y: mouseY,
      radius: MOUSE_WAVE_RADIUS,
      strength: MOUSE_WAVE_STRENGTH,
      maxRadius: MOUSE_WAVE_MAX_RADIUS
    })
    previousMouseX = mouseX
    previousMouseY = mouseY
  }
}

function trackNatureMovement() {
  const cosAngle = cos(natureAngle)
  const sinAngle = sin(natureAngle)

  natureX += NATURE_SPEED * cosAngle
  natureY += NATURE_SPEED * sinAngle

  if (natureX <= 0 || natureX >= width) {
    natureAngle = PI - natureAngle
  }
  if (natureY <= 0 || natureY >= height) {
    natureAngle = -natureAngle
  }

  natureX = constrain(natureX, 0, width)
  natureY = constrain(natureY, 0, height)
  natureAngle += NATURE_ANGLE_CHANGE

  mouseWaves.push({
    x: natureX,
    y: natureY,
    radius: NATURE_WAVE_RADIUS,
    strength: NATURE_WAVE_STRENGTH,
    maxRadius: NATURE_WAVE_MAX_RADIUS
  })
}

function updateTentaclesWithWaves() {
  for (const wave of mouseWaves) {
    wave.radius += 10
    const waveRadiusSq = wave.radius * wave.radius

    for (let i = 0; i < TENTACLE_COUNT; i++) {
      for (let j = 1; j < TENTACLE_LENGTH; j++) {
        const [x, y] = tentacles[i][j]
        const dx = x - wave.x
        const dy = y - wave.y
        const distSq = dx * dx + dy * dy

        if (distSq < waveRadiusSq) {
          const distance = sqrt(distSq)
          const strength = wave.strength * (j / TENTACLE_LENGTH)
          tentacles[i][j][0] += (dx / distance) * strength
          tentacles[i][j][1] += (dy / distance) * strength
        }
      }
    }
  }
  mouseWaves = mouseWaves.filter(wave => wave.radius < wave.maxRadius)
}

function restrictTentacleMovement() {
  const maxDist = diameter / 50

  for (let j = 1; j < TENTACLE_LENGTH; j++) {
    for (let i = 0; i < TENTACLE_COUNT; i++) {
      const prev = tentacles[i][j - 1]
      const curr = tentacles[i][j]
      const dx = prev[0] - curr[0]
      const dy = prev[1] - curr[1]
      const distBetween = sqrt(dx * dx + dy * dy)

      if (distBetween > maxDist) {
        const angle = atan2(dy, dx)
        const force = map(distBetween, maxDist, maxDist * 1.3, 0.01, 0.2)
        tentacles[i][j][0] += cos(angle) * force
        tentacles[i][j][1] += sin(angle) * force
      }
    }
  }
}

function drawTentacles() {
  noStroke()
  for (let i = 0; i < TENTACLE_LENGTH; i++) {
    const fraction = i / TENTACLE_LENGTH
    const r = lerp(209, 250, fraction)
    const g = lerp(29, 150, fraction)
    const b = lerp(100, 130, fraction)
    fill(r, g, b)

    for (let j = 0; j < TENTACLE_COUNT; j++) {
      const [x, y] = tentacles[j][i]
      circle(x, y, diameter)
    }
  }
}

function getDiameter(windowWidth) {
  return max(35, min(60, windowWidth / 25))
}

function getNatureSpeed(windowWidth) {
  return max(2, min(7, windowWidth / 100))
}
