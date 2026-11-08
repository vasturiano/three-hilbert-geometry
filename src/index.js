import hilbert3D from './hilbert3d.js';
import SquareTubeGeometry from './SquareTubeGeometry.js';

export default class ThreeHilbertGeometry extends SquareTubeGeometry {
  constructor(order, start, length, {
    padding = 0,
    simplifyCurves = true
  } = {}) {
    super(...getSuperParams());

    this.type = 'HilbertGeometry';

    const superParams = this.parameters;
    this.parameters = {
      ...superParams,
      order,
      start,
      length,
      padding,
      simplifyCurves
    };

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

  clone() {
    return new this.constructor(0, 1, 0).copy(this);
  }

  copy(source) {
    super.copy(source);
    this.parameters = Object.assign({}, source.parameters, {
      points: source.parameters.points.map(point => point.clone())
    });
    return this;
  }
}