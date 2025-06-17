(function (global) {
  function bfs(start, isGoal, neighbors) {
    const queue = [start];
    const visited = new Set([JSON.stringify(start)]);
    const parent = new Map();
    while (queue.length) {
      const node = queue.shift();
      if (isGoal(node)) {
        const path = [];
        let curKey = JSON.stringify(node);
        let cur = node;
        while (cur) {
          path.push(cur);
          const parentNode = parent.get(curKey);
          cur = parentNode;
          curKey = parentNode ? JSON.stringify(parentNode) : null;
        }
        return path.reverse();
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
        const path = [];
        let curKey = key;
        let cur = node;
        while (cur) {
          path.push(cur);
          const parentNode = parent.get(curKey);
          cur = parentNode;
          curKey = parentNode ? JSON.stringify(parentNode) : null;
        }
        return path.reverse();
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

  const api = { bfs, dfs };
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = api;
  } else {
    global.Search = api;
  }
})(this);
