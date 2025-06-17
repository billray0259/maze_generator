const assert = require('assert');
const test = require('node:test');

function openNeighbors(grid, x, y) {
  const n = grid.length;
  const result = [];
  if (y > 0 && !grid[x][y][0]) result.push({ x, y: y - 1 });
  if (y < n - 1 && !grid[x][y + 1][0]) result.push({ x, y: y + 1 });
  if (x > 0 && !grid[x][y][1]) result.push({ x: x - 1, y });
  if (x < n - 1 && !grid[x + 1][y][1]) result.push({ x: x + 1, y });
  return result;
}

function solveMaze(grid) {
  const n = grid.length;
  const visited = Array.from({ length: n }, () => Array(n).fill(false));
  const parent = Array.from({ length: n }, () => Array(n).fill(null));
  const queue = [{ x: 0, y: 0 }];
  visited[0][0] = true;
  while (queue.length) {
    const cell = queue.shift();
    if (cell.x === n - 1 && cell.y === n - 1) {
      const path = [];
      for (let cur = cell; cur; cur = parent[cur.x][cur.y]) {
        path.push(cur);
      }
      return path.reverse();
    }
    for (const ncell of openNeighbors(grid, cell.x, cell.y)) {
      if (!visited[ncell.x][ncell.y]) {
        visited[ncell.x][ncell.y] = true;
        parent[ncell.x][ncell.y] = cell;
        queue.push(ncell);
      }
    }
  }
  return null;
}

test('finds a path through an open maze', () => {
  const n = 3;
  const grid = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => [false, false])
  );
  const path = solveMaze(grid);
  assert(path, 'should find a path');
  assert.strictEqual(path[0].x, 0);
  assert.strictEqual(path[0].y, 0);
  assert.strictEqual(path[path.length - 1].x, n - 1);
  assert.strictEqual(path[path.length - 1].y, n - 1);
});

test('returns null when no path exists', () => {
  const n = 2;
  const grid = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => [true, true])
  );
  const path = solveMaze(grid);
  assert.strictEqual(path, null);
});
