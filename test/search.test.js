const assert = require('assert');
const test = require('node:test');
const { bfs, dfs, dijkstra, greedy, astar, iddfs } = require('../search');

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

test('dijkstra finds path identical to bfs', () => {
  const n = 3;
  const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => [false, false]));
  const pathA = bfs({ x: 0, y: 0 }, (n2) => n2.x === n - 1 && n2.y === n - 1, (node) => openNeighbors(grid, node.x, node.y));
  const pathB = dijkstra({ x: 0, y: 0 }, (n2) => n2.x === n - 1 && n2.y === n - 1, (node) => openNeighbors(grid, node.x, node.y));
  assert.deepStrictEqual(pathB, pathA);
});

test('greedy search finds a path using heuristic', () => {
  const n = 4;
  const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => [false, false]));
  const heuristic = (node) => (n - 1 - node.x) + (n - 1 - node.y);
  const path = greedy({ x: 0, y: 0 }, (node) => node.x === n - 1 && node.y === n - 1, (node) => openNeighbors(grid, node.x, node.y), heuristic);
  assert(path, 'greedy should find a path');
  assert.strictEqual(path[0].x, 0);
  assert.strictEqual(path[path.length - 1].x, n - 1);
});

test('astar finds shortest path', () => {
  const n = 3;
  const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => [false, false]));
  const heuristic = (node) => (n - 1 - node.x) + (n - 1 - node.y);
  const path = astar({ x: 0, y: 0 }, (node) => node.x === n - 1 && node.y === n - 1, (node) => openNeighbors(grid, node.x, node.y), heuristic);
  assert(path, 'astar should find a path');
  assert.strictEqual(path.length, 2 * (n - 1) + 1);
});

test('iddfs can locate a goal within depth', () => {
  const n = 3;
  const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => [false, false]));
  const path = iddfs({ x: 0, y: 0 }, (node) => node.x === n - 1 && node.y === n - 1, (node) => openNeighbors(grid, node.x, node.y), 4);
  assert(path, 'iddfs should find a path');
  assert.strictEqual(path[0].x, 0);
  assert.strictEqual(path[path.length - 1].x, n - 1);
});
