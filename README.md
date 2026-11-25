ThreeJS Hilbert Geometry
==============

[![NPM package][npm-img]][npm-url]
[![Build Size][build-size-img]][build-size-url]
[![NPM Downloads][npm-downloads-img]][npm-downloads-url]

A Three.js geometry for constructing a square-tube Hilbert curve with a recursive 3D path.

<p align="center">
   <a href="https://vasturiano.github.io/three-hilbert-geometry/examples/basic/"><img width="60%" src="https://vasturiano.github.io/three-hilbert-geometry/examples/basic/preview.png"></a>
</p>

See also [three-hilbert](https://github.com/vasturiano/three-hilbert).

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
  * <b>paddingAbsolute</b>: Absolute padding in world units. Default is `0`.
  * <b>simplifyCurves</b>: If `true`, the curve is simplified by reducing the order whenever possible when both `start` and `length` are divisible by 8. Default is `true`.

### Lookup methods

Use the static `getValAtPosition` method to find the Hilbert curve index nearest to a local-space coordinate in the standard `[-1, 1]` cube:

```js
const index = HilbertGeometry.getValAtPosition(order, new THREE.Vector3(x, y, z));
```

Coordinates are mapped to the nearest grid cell at the given order. The result is a `number` when it is a safe integer and a `bigint` otherwise.

Use `getPositionAtVal` for the reverse lookup from a curve index to its local-space coordinate:

```js
const position = HilbertGeometry.getPositionAtVal(order, index);
```

The index must be an integer in the range `[0, 8 ** order)`. It accepts a `number` or `bigint` and returns a `THREE.Vector3`.

[npm-img]: https://img.shields.io/npm/v/three-hilbert-geometry
[npm-url]: https://npmjs.org/package/three-hilbert-geometry
[build-size-img]: https://img.shields.io/bundlephobia/minzip/three-hilbert-geometry
[build-size-url]: https://bundlephobia.com/result?p=three-hilbert-geometry
[npm-downloads-img]: https://img.shields.io/npm/dt/three-hilbert-geometry
[npm-downloads-url]: https://www.npmtrends.com/three-hilbert-geometry
