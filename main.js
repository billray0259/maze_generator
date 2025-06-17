// Maze generator and solver built using p5.js

const nGrid = 64;
const canvasSize = 768;
const gridSize = canvasSize / nGrid;
const wallThickness = gridSize / 4;

// control variables that can be changed from the UI
let generationSpeed = 1; // steps of maze generation per frame
let solverSpeed = 1; // steps of solver per frame

const drawFast = false; // Draw the grid faster but with some minor errors

// maze representation
// grid[x][y][0] -> top wall
// grid[x][y][1] -> left wall
// grid[x][y][2] -> has been visited during generation
// grid[x][y][3] -> needs redraw (only used when drawFast=true)
const grid = new Array(nGrid)
  .fill(true)
  .map(() => new Array(nGrid).fill(true).map(() => [true, true, false, true]));

const visited = new Stack();
let current = { x: 0, y: 0 };
let mazeGenerated = false;

// solver structures
let solving = false;
let solverQueue = [];
let solverVisited;
let solverParent;
let solverPath = null;

function setup() {
  createCanvas(canvasSize, canvasSize);
  frameRate(60);
  background(255);
  grid[0][0][0] = false;

  // connect UI
  const genSlider = document.getElementById('genSpeed');
  const solveSlider = document.getElementById('solveSpeed');
  document.getElementById('solveButton').addEventListener('click', startSolve);
  generationSpeed = Number(genSlider.value);
  solverSpeed = Number(solveSlider.value);
  genSlider.addEventListener('input', () => {
    generationSpeed = Number(genSlider.value);
    document.getElementById('genValue').innerText = generationSpeed;
  });
  solveSlider.addEventListener('input', () => {
    solverSpeed = Number(solveSlider.value);
    document.getElementById('solveValue').innerText = solverSpeed;
  });
  document.getElementById('genValue').innerText = generationSpeed;
  document.getElementById('solveValue').innerText = solverSpeed;
}

function getNeighbors(x, y) {
  const neighbors = [];
  if (x > 0) neighbors.push({ x: x - 1, y });
  if (x < nGrid - 1) neighbors.push({ x: x + 1, y });
  if (y > 0) neighbors.push({ x, y: y - 1 });
  if (y < nGrid - 1) neighbors.push({ x, y: y + 1 });
  return neighbors.filter((n) => !grid[n.x][n.y][2]);
}

function setRedraw(cell) {
  grid[cell.x][cell.y][3] = true;
  if (cell.y > 0) grid[cell.x][cell.y - 1][3] = true;
  if (cell.y < nGrid - 1) grid[cell.x][cell.y + 1][3] = true;
  if (cell.x > 0) grid[cell.x - 1][cell.y][3] = true;
  if (cell.x < nGrid - 1) grid[cell.x + 1][cell.y][3] = true;
}

function updateEdges(a, b) {
  if (a.y < b.y) {
    grid[b.x][b.y][0] = false;
    setRedraw(b);
  }
  if (b.y < a.y) {
    grid[a.x][a.y][0] = false;
    setRedraw(a);
  }
  if (a.x < b.x) {
    grid[b.x][b.y][1] = false;
    setRedraw(b);
  }
  if (b.x < a.x) {
    grid[a.x][a.y][1] = false;
    setRedraw(a);
  }
}

function generateStep() {
  const r = current.x;
  const c = current.y;
  const neighbors = getNeighbors(r, c);
  let next = null;
  if (grid[r][c][2]) {
    if (neighbors.length === 0) {
      if (visited.size() === 0) {
        mazeGenerated = true;
        return;
      }
      current = visited.pop();
      return;
    }
    next = neighbors[floor(random(neighbors.length))];
  } else {
    grid[r][c][2] = true;
    visited.push(current);
    if (neighbors.length > 0) {
      next = neighbors[floor(random(neighbors.length))];
    } else {
      next = visited.pop();
    }
  }
  if (next) {
    updateEdges(current, next);
    current = next;
  }
}

// solver helpers ------------------------------------------------------------
function startSolve() {
  if (!mazeGenerated || solving) return;
  solving = true;
  solverQueue = [{ x: 0, y: 0 }];
  solverVisited = new Array(nGrid)
    .fill(false)
    .map(() => new Array(nGrid).fill(false));
  solverParent = new Array(nGrid)
    .fill(null)
    .map(() => new Array(nGrid).fill(null));
  solverVisited[0][0] = true;
  solverPath = null;
}

function openNeighbors(x, y) {
  const result = [];
  // up
  if (y > 0 && !grid[x][y][0]) result.push({ x, y: y - 1 });
  // down
  if (y < nGrid - 1 && !grid[x][y + 1][0]) result.push({ x, y: y + 1 });
  // left
  if (x > 0 && !grid[x][y][1]) result.push({ x: x - 1, y });
  // right
  if (x < nGrid - 1 && !grid[x + 1][y][1]) result.push({ x: x + 1, y });
  return result;
}

function solverStep() {
  if (solverPath) return; // path already found
  if (solverQueue.length === 0) {
    solving = false;
    return;
  }
  const cell = solverQueue.shift();
  if (cell.x === nGrid - 1 && cell.y === nGrid - 1) {
    // reconstruct path
    solverPath = [];
    let cur = cell;
    while (cur) {
      solverPath.push(cur);
      cur = solverParent[cur.x][cur.y];
    }
    return;
  }
  for (const n of openNeighbors(cell.x, cell.y)) {
    if (!solverVisited[n.x][n.y]) {
      solverVisited[n.x][n.y] = true;
      solverParent[n.x][n.y] = cell;
      solverQueue.push(n);
    }
  }
}

// drawing ------------------------------------------------------------------
function drawMaze() {
  if (!drawFast) {
    background(255);
  }
  for (let x = 0; x < nGrid; x++) {
    for (let y = 0; y < nGrid; y++) {
      if (drawFast) {
        if (!grid[x][y][3]) continue;
        grid[x][y][3] = false;
        noStroke();
        fill(255);
        rect(x * gridSize, y * gridSize, gridSize, gridSize);
      }
      if (grid[x][y][0]) {
        stroke(0);
        strokeWeight(wallThickness);
        line(x * gridSize, y * gridSize, (x + 1) * gridSize, y * gridSize);
      }
      if (grid[x][y][1]) {
        stroke(0);
        strokeWeight(wallThickness);
        line(x * gridSize, y * gridSize, x * gridSize, (y + 1) * gridSize);
      }
      const top = grid[x][y][0];
      const left = grid[x][y][1];
      const bottom = y < nGrid - 1 ? grid[x][y + 1][0] : true;
      const right = x < nGrid - 1 ? grid[x + 1][y][1] : true;
      if (top && left && bottom && right) {
        fill(0);
        strokeWeight(0);
        rect(x * gridSize, y * gridSize, gridSize, gridSize);
      }
    }
  }
  stroke(0);
  strokeWeight(wallThickness);
  line(0, canvasSize, canvasSize, canvasSize);
  line(canvasSize, 0, canvasSize, canvasSize);
  stroke(255);
  strokeWeight(wallThickness);
  line(canvasSize - gridSize, canvasSize, canvasSize, canvasSize);
}

function drawSolver() {
  noStroke();
  fill(0, 255, 0, 100);
  for (let x = 0; x < nGrid; x++) {
    for (let y = 0; y < nGrid; y++) {
      if (solverVisited && solverVisited[x][y]) {
        rect(x * gridSize, y * gridSize, gridSize, gridSize);
      }
    }
  }
  if (solverPath) {
    fill(255, 0, 255, 150);
    for (const cell of solverPath) {
      rect(cell.x * gridSize, cell.y * gridSize, gridSize, gridSize);
    }
  }
}

function draw() {
  for (let i = 0; i < generationSpeed && !mazeGenerated; i++) {
    generateStep();
  }
  for (let i = 0; i < solverSpeed && solving; i++) {
    solverStep();
  }
  drawMaze();
  if (solving) drawSolver();
}
