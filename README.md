ThreeJS Hilbert Geometry
==============

[![NPM package][npm-img]][npm-url]
[![Build Size][build-size-img]][build-size-url]
[![NPM Downloads][npm-downloads-img]][npm-downloads-url]

A Three.js geometry for constructing a square-tube Hilbert curve with a recursive 3D path.

<p align="center">
  <b>Generate a compact, self-similar 3D path</b><br>
  <i>Ideal for scientific visualizations, flow maps, space-filling curves, and procedural geometry.</i>
</p>

## Examples

* [Basic Hilbert curve](./example/basic/index.html)

## Quick start

```js
import HilbertGeometry from 'three-hilbert-geometry';
```

or using a script tag:

```html
<script src="//unpkg.com/three-hilbert-geometry"></script>
```

then

```js
const myMesh = new THREE.Mesh(
  new HilbertGeometry(5, 0, 128),
  new THREE.MeshBasicMaterial({ color: 'blue' })
);
```

## Why this geometry?

The Hilbert curve is a space-filling path that preserves locality: adjacent points in the curve stay close in 3D space. This makes it useful for:

* Visualizing recursive structures and fractal ordering
* Building dense, ordered paths in 3D scenes
* Generating procedural line-like geometry with a compact footprint
* Creating animated or data-driven spatial layouts

## API reference

### Constructor

<b>HilbertGeometry</b>(<b>order</b>: <i>Integer</i>, <b>start</b>: <i>Number | BigInt</i>, <b>length</b>: <i>Number | BigInt</i>, <b>options</b>: <i>Object</i>)

Creates a square-tubed Hilbert curve segment. The geometry is built from a recursive 3D Hilbert path and then expanded into a thickened square tube.

* <b>order</b>: Recursion depth of the Hilbert curve. Higher values create finer, more detailed curves.
* <b>start</b>: Index of the first point to generate. Accepts a number or bigint for large ranges.
* <b>length</b>: Number of curve points to include. Also accepts a number or bigint.
* <b>options</b>: Optional settings object.
  * <b>padding</b>: Fractional relative padding between of the tube. Value is in the range `[0, 1)`. Default is `0`.
  * <b>simplifyCurves</b>: If `true`, the curve is simplified by reducing the order whenever possible when both `start` and `length` are divisible by 8. Default is `true`.

[npm-img]: https://img.shields.io/npm/v/three-hilbert-geometry
[npm-url]: https://npmjs.org/package/three-hilbert-geometry
[build-size-img]: https://img.shields.io/bundlephobia/minzip/three-hilbert-geometry
[build-size-url]: https://bundlephobia.com/result?p=three-hilbert-geometry
[npm-downloads-img]: https://img.shields.io/npm/dt/three-hilbert-geometry
[npm-downloads-url]: https://www.npmtrends.com/three-hilbert-geometry
