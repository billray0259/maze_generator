

const nGrid = 64;
const canvasSize = 768;
const gridSize = canvasSize / nGrid;
const wallThickness = gridSize/4;

const drawFast = false; // Draw the grid faster but with some minor errors
const framesBetweenDraws = 1; // How many upates to perform between draws

// a boolean grid of shape (64, 64, 3)
const grid = new Array(nGrid).fill(true).map(() => new Array(nGrid).fill(true).map(() => [true, true, false, true]));
const visited = new Stack();
let current = {x: 0, y: 0};
grid[0][0][0] = false;

// grid[r][c][0] is the top edge of the square
// grid[r][c][1] is the left edge of the square
// grid[r][c][2] is if the cell has been visited
// grid[r][c][3] is if the cell needs to be re-drawn

function setup() {
    createCanvas(canvasSize, canvasSize);
    background(255);

    // frameRate(0.5);
    frameRate(framesBetweenDraws*30);
}

function getNeighbors(x, y) {
    const neighbors = [];
    if (x > 0) {
        neighbors.push({x: x - 1, y: y});
    }
    if (x < nGrid-1) {
        neighbors.push({x: x + 1, y: y});
    }
    if (y > 0) {
        neighbors.push({x: x, y: y - 1});
    }
    if (y < nGrid-1) {
        neighbors.push({x: x, y: y + 1});
    }
    // remove neighbors that have been visited
    return neighbors.filter(neighbor => !grid[neighbor.x][neighbor.y][2]);
}

function setRedraw(cell) {
    grid[cell.x][cell.y][3] = true;
    // also redraw the cell above and below
    if (cell.y > 0) {
        grid[cell.x][cell.y - 1][3] = true;
    }
    if (cell.y < nGrid - 1) {
        grid[cell.x][cell.y + 1][3] = true;
    }
    // also redraw the cell to the left and right
    if (cell.x > 0) {
        grid[cell.x - 1][cell.y][3] = true;
    }
    if (cell.x < nGrid - 1) {
        grid[cell.x + 1][cell.y][3] = true;
    }
}

function updateEdges(current, neighbor) {
    // removes the edge between current and neighbor
    // if current is above neighbor remove the top edge of neighbor
    if (current.y < neighbor.y) {
        grid[neighbor.x][neighbor.y][0] = false;
        setRedraw(neighbor);
    }
    // if neighbor is above current remove the top edge of current
    if (neighbor.y < current.y) {
        grid[current.x][current.y][0] = false;
        setRedraw(current);
    }
    // if current is to the left of neighbor remove the left edge of neighbor
    if (current.x < neighbor.x) {
        grid[neighbor.x][neighbor.y][1] = false;
        setRedraw(neighbor);
    }
    // if neighbor is to the left of current remove the left edge of current
    if (neighbor.x < current.x) {
        grid[current.x][current.y][1] = false;
        setRedraw(current);
    }
}

function draw() {
    if (frameCount % framesBetweenDraws === 0) {
        if (!drawFast) {
            background(255);
        }
        for (let x = 0; x < nGrid; x++) {
            for (let y = 0; y < nGrid; y++) {
                if (drawFast) {
                    if (!grid[x][y][3]) {
                        continue;
                    } 
                    
                    grid[x][y][3] = false;
                    // draw a white square
                    noStroke();
                    fill(255);
                    rect(x * gridSize, y * gridSize, gridSize, gridSize);
                }

                
                // if the cell has a top edge draw it
                if (grid[x][y][0]) {
                    // draw the top edge of a square
                    stroke(0);
                    strokeWeight(wallThickness);
                    line(x * gridSize, y * gridSize, (x + 1) * gridSize, y * gridSize);
                }
                
                // if the cell has a left edge draw it
                if (grid[x][y][1]) {
                    // draw the left edge of a square
                    stroke(0);
                    strokeWeight(wallThickness);
                    line(x * gridSize, y * gridSize, x * gridSize, (y + 1) * gridSize);
                }

                // if the cell has all four both edges fill it in
                const topEdge = grid[x][y][0];
                const leftEdge = grid[x][y][1];
                // bottom edge depends on the top edge of the cell below check if it exists
                const bottomEdge = y < nGrid - 1 ? grid[x][y+1][0] : true;
                // right edge depends on the left edge of the cell to the right check if it exists
                const rightEdge = x < nGrid - 1 ? grid[x+1][y][1] : true;

                if (topEdge && leftEdge && bottomEdge && rightEdge) {
                    // draw a black square
                    fill(0);
                    strokeWeight(0);
                    rect(x * gridSize, y * gridSize, gridSize, gridSize);
                }
            }
        }
        // draw line on the bottom of the canvas
        stroke(0);
        strokeWeight(wallThickness);
        line(0, canvasSize, canvasSize, canvasSize);
        // draw line on the right of the canvas
        line(canvasSize, 0, canvasSize, canvasSize);
        // draw a white line over the bottom edge of the bottom right cell
        stroke(255);
        strokeWeight(wallThickness);
        line(canvasSize - gridSize, canvasSize, canvasSize, canvasSize);
    }

    const r = current.x;
    const c = current.y;
    const neighbors = getNeighbors(r, c);
    let next = null;
    if (grid[r][c][2]) {
        // if there are no neighbors to visit, backtrack
        if (neighbors.length === 0) {
            if (visited.size() === 0) {
                return;
            }
            current = visited.pop();
        } else {
            // choose a random neighbor to be the next current
            next = neighbors[floor(random(neighbors.length))];
        }
    } else {
        // mark the current cell as visited
        grid[r][c][2] = true;
        visited.push(current);
        // if there are neighbors to visit, visit them
        if (neighbors.length > 0) {
            // set current to a random neighbor
            next = neighbors[floor(random(neighbors.length))];
        } else {
            // if there are no neighbors to visit, backtrack
            next = visited.pop();
        }
    }

    // draw the current cell in red
    fill(255, 0, 0, 100);
    strokeWeight(0);
    // rect(current.x * gridSize, current.y * gridSize, gridSize, gridSize);

    if (next) {
        // draw the next cell in blue
        fill(0, 0, 255, 100);
        strokeWeight(0);
        // rect(next.x * gridSize, next.y * gridSize, gridSize, gridSize);

        // update the edges between the current and next cell
        updateEdges(current, next);
        current = next;
    }

}
