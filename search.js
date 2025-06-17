(function (global) {
  function reconstruct(parent, key, node) {
    const path = [];
    while (node) {
      path.push(node);
      const p = parent.get(key);
      node = p;
      key = p ? JSON.stringify(p) : null;
    }
    return path.reverse();
  }

  function popLowest(queue, getScore) {
    let best = 0;
    let bestScore = getScore(queue[0]);
    for (let i = 1; i < queue.length; i++) {
      const score = getScore(queue[i]);
      if (score < bestScore) {
        best = i;
        bestScore = score;
      }
    }
    return queue.splice(best, 1)[0];
  }

  function bfs(start, isGoal, neighbors) {
    const queue = [start];
    const visited = new Set([JSON.stringify(start)]);
    const parent = new Map();
    while (queue.length) {
      const node = queue.shift();
      if (isGoal(node)) {
        return reconstruct(parent, JSON.stringify(node), node);
      }
      for (const next of neighbors(node)) {
        const key = JSON.stringify(next);
        if (!visited.has(key)) {
          visited.add(key);
          parent.set(key, node);
          queue.push(next);
        }
      }
    }
    return null;
  }

  function dfs(start, isGoal, neighbors) {
    const stack = [start];
    const visited = new Set();
    const parent = new Map();
    while (stack.length) {
      const node = stack.pop();
      const key = JSON.stringify(node);
      if (visited.has(key)) continue;
      visited.add(key);
      if (isGoal(node)) {
        return reconstruct(parent, key, node);
      }
      for (const next of neighbors(node).reverse()) {
        const nKey = JSON.stringify(next);
        if (!visited.has(nKey)) {
          parent.set(nKey, node);
          stack.push(next);
        }
      }
    }
    return null;
  }

  function dijkstra(start, isGoal, neighbors) {
    const open = [start];
    const g = new Map([[JSON.stringify(start), 0]]);
    const parent = new Map();
    const visited = new Set();
    while (open.length) {
      const node = popLowest(open, (n) => g.get(JSON.stringify(n)));
      const key = JSON.stringify(node);
      if (visited.has(key)) continue;
      visited.add(key);
      if (isGoal(node)) {
        return reconstruct(parent, key, node);
      }
      for (const next of neighbors(node)) {
        const nKey = JSON.stringify(next);
        const cost = g.get(key) + 1;
        if (!g.has(nKey) || cost < g.get(nKey)) {
          g.set(nKey, cost);
          parent.set(nKey, node);
          open.push(next);
        }
      }
    }
    return null;
  }

  function greedy(start, isGoal, neighbors, heuristic) {
    heuristic = heuristic || (() => 0);
    const open = [start];
    const parent = new Map();
    const visited = new Set();
    while (open.length) {
      const node = popLowest(open, heuristic);
      const key = JSON.stringify(node);
      if (visited.has(key)) continue;
      visited.add(key);
      if (isGoal(node)) {
        return reconstruct(parent, key, node);
      }
      for (const next of neighbors(node)) {
        const nKey = JSON.stringify(next);
        if (!visited.has(nKey)) {
          parent.set(nKey, node);
          open.push(next);
        }
      }
    }
    return null;
  }

  function astar(start, isGoal, neighbors, heuristic) {
    heuristic = heuristic || (() => 0);
    const open = [start];
    const g = new Map([[JSON.stringify(start), 0]]);
    const parent = new Map();
    const visited = new Set();
    while (open.length) {
      const node = popLowest(open, (n) => g.get(JSON.stringify(n)) + heuristic(n));
      const key = JSON.stringify(node);
      if (visited.has(key)) continue;
      visited.add(key);
      if (isGoal(node)) {
        return reconstruct(parent, key, node);
      }
      for (const next of neighbors(node)) {
        const nKey = JSON.stringify(next);
        const cost = g.get(key) + 1;
        if (!g.has(nKey) || cost < g.get(nKey)) {
          g.set(nKey, cost);
          parent.set(nKey, node);
          open.push(next);
        }
      }
    }
    return null;
  }

  function iddfs(start, isGoal, neighbors, maxDepth) {
    function dls(node, depth, visited) {
      const key = JSON.stringify(node);
      if (depth < 0 || visited.has(key)) return null;
      visited.add(key);
      if (isGoal(node)) return [node];
      if (depth === 0) return null;
      for (const next of neighbors(node)) {
        const res = dls(next, depth - 1, visited);
        if (res) {
          res.unshift(node);
          return res;
        }
      }
      return null;
    }
    for (let limit = 0; limit <= maxDepth; limit++) {
      const visited = new Set();
      const result = dls(start, limit, visited);
      if (result) return result;
    }
    return null;
  }

  const api = { bfs, dfs, dijkstra, greedy, astar, iddfs };
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = api;
  } else {
    global.Search = api;
  }
})(this);
