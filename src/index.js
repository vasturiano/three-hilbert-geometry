import hilbert3D from './hilbert3d.js';
import SquareTubeGeometry from './SquareTubeGeometry.js';

export default class ThreeHilbertGeometry extends SquareTubeGeometry {
  constructor(order, start, length, {
    padding = 0,
    simplifyCurves = true
  } = {}) {
    super(...getSuperParams());

    this.type = 'HilbertGeometry';

    function getSuperParams() {
      typeof start !== 'bigint' && (start = Math.round(start));
      typeof length !== 'bigint' && (length = Math.round(length));

      if (simplifyCurves) {
        // resolution simplification
        const n8 = typeof start === 'bigint' ? 8n : 8;
        while (!(start % n8) && !(length % n8) && order > 0) {
          start /= n8;
          length /= n8;
          order -= 1;
        }
      }

      const points = hilbert3D(undefined, 1, order - 1, start, length);
      const lineWidth = 1 / (2**(order-1)) * (1 - Math.min(1, padding));

      return [points, lineWidth];
    }
  }
}

/*
const geometryCache = (() => {
  const cache = {};
  cache[''] = new SquareTubeGeometry([new Vector3()]);
  for (const nPnts of [2, 4]) {
    for (let start = 0; start < 8; start++) {
      const pnts = hilbert3D(undefined, 1, 0, start, nPnts);
      const key = getCurvePath(pnts);
      cache[key] = new SquareTubeGeometry(pnts);
    }
  }
  return cache;
})();

// console.log(geometryCache);

function genInstancedGeometry(order, start, length, {
  padding = 0,
  simplifyCurves
} = {}) {
  // resolution simplification
  const n8 = typeof start === 'bigint' ? 8n : 8;
  while (!(start % n8) && !(length % n8) && order > 0) {
    start /= n8;
    length /= n8;
    order -= 1;
  }

  const points = hilbert3D(undefined, 1, order - 1, start, length);

  let geometry;
  let position = new Vector3();
  let scale = 1;

  if ([1, 2, 4].some(l => l === points.length)) {
    // Most common simple cases
    const key = getCurvePath(points);
    geometry = geometryCache[key];
  } else {
    // More complex cases, fallback to regular geometry generation
    geometry = new ThreeHilbertGeometry(order, start, length, { padding, simplifyCurves });
  }

  return {
    geometry,
    position,
    scale,
  }
}

function getCurvePath(points) {
  const path = [];
  let prevPnt = points[0];

  for (let i = 1; i < points.length; i++) {
    const pnt = points[i];
    for (const c of ['x', 'y', 'z']) {
      const dist = pnt[c] - prevPnt[c];
      if (dist) {
        path.push(
          c === 'x' ? dist > 0 ? 'R' : 'L'
          : c === 'y' ? dist > 0 ? 'U' : 'D'
          : dist > 0 ? 'B' : 'F'
        );
        break;
      }
    }
    prevPnt = pnt;
  }
  return path.join('');
}

 */