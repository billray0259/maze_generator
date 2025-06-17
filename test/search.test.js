const assert = require('assert');
const test = require('node:test');
const { bfs, dfs } = require('../search');

function openNeighbors(grid, x, y) {
  const n = grid.length;
  const result = [];
  if (y > 0 && !grid[x][y][0]) result.push({ x, y: y - 1 });
  if (y < n - 1 && !grid[x][y + 1][0]) result.push({ x, y: y + 1 });
  if (x > 0 && !grid[x][y][1]) result.push({ x: x - 1, y });
  if (x < n - 1 && !grid[x + 1][y][1]) result.push({ x: x + 1, y });
  return result;
}

test('bfs finds path in open grid', () => {
  const n = 3;
  const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => [false, false]));
  const path = bfs({ x: 0, y: 0 }, (node) => node.x === n - 1 && node.y === n - 1, (node) => openNeighbors(grid, node.x, node.y));
  assert(path, 'should find a path');
  assert.strictEqual(path[0].x, 0);
  assert.strictEqual(path[0].y, 0);
  assert.strictEqual(path[path.length - 1].x, n - 1);
  assert.strictEqual(path[path.length - 1].y, n - 1);
});

test('dfs returns null when no path exists', () => {
  const n = 2;
  const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => [true, true]));
  const path = dfs({ x: 0, y: 0 }, (node) => node.x === n - 1 && node.y === n - 1, (node) => openNeighbors(grid, node.x, node.y));
  assert.strictEqual(path, null);
});
