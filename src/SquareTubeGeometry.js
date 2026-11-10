import {
  Box3,
  BufferGeometry,
  Float32BufferAttribute,
  Quaternion,
  Sphere,
  Uint16BufferAttribute,
  Uint32BufferAttribute,
  Vector3
} from 'three';

const SINGLE_CUBE_FACES = [
  [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7],
  [0, 3, 2, 1], [4, 5, 6, 7]
];
const SINGLE_CUBE_CORNERS = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
];
const SINGLE_CUBE_UVS = new Float32Array(24 * 2);
const SINGLE_CUBE_NORMALS = new Float32Array(24 * 3);
const SINGLE_CUBE_INDICES = new Uint16Array(36);
const SINGLE_CUBE_NORMALS_BY_FACE = [
  [0, -1, 0], [1, 0, 0], [0, 1, 0], [-1, 0, 0], [0, 0, -1], [0, 0, 1]
];

for (let faceIndex = 0; faceIndex < SINGLE_CUBE_FACES.length; faceIndex++) {
  const face = SINGLE_CUBE_FACES[faceIndex];
  const normal = SINGLE_CUBE_NORMALS_BY_FACE[faceIndex];

  for (let i = 0; i < 4; i++) {
    const vertex = faceIndex * 4 + i;
    const corner = face[i];
    SINGLE_CUBE_UVS[vertex * 2] = corner % 2;
    SINGLE_CUBE_UVS[vertex * 2 + 1] = Math.floor(corner / 2) % 2;
    SINGLE_CUBE_NORMALS.set(normal, vertex * 3);
  }

  const vertexOffset = faceIndex * 4;
  const indexOffset = faceIndex * 6;
  SINGLE_CUBE_INDICES.set([
    vertexOffset, vertexOffset + 1, vertexOffset + 2,
    vertexOffset, vertexOffset + 2, vertexOffset + 3
  ], indexOffset);
}

export default class SquareTubeGeometry extends BufferGeometry {
  constructor(points = [], width = 1) {
    super();

    if (!Array.isArray(points)) {
      throw new TypeError('points must be an array of Vector3 instances');
    }
    if (!Number.isFinite(width) || width < 0) {
      throw new RangeError('width must be a non-negative finite number');
    }

    this.type = 'SquareTubeGeometry';

    if (points.length <= 1) {
      const point = points[0];
      if (points.length === 1 && (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || !Number.isFinite(point.z))) {
        throw new TypeError('points[0] must have finite x, y, and z coordinates');
      }

      this.parameters = {
        points: point ? [new Vector3(point.x, point.y, point.z)] : [],
        width
      };

      if (!point || width === 0) {
        this.setIndex([]);
        this.setAttribute('position', new Float32BufferAttribute([], 3));
        this.setAttribute('uv', new Float32BufferAttribute([], 2));
        return;
      }

      const halfWidth = width / 2;
      const x = point.x;
      const y = point.y;
      const z = point.z;
      const positions = new Float32Array(24 * 3);
      let positionOffset = 0;

      for (const face of SINGLE_CUBE_FACES) {
        for (const corner of face) {
          const signs = SINGLE_CUBE_CORNERS[corner];
          positions[positionOffset++] = x + signs[0] * halfWidth;
          positions[positionOffset++] = y + signs[1] * halfWidth;
          positions[positionOffset++] = z + signs[2] * halfWidth;
        }
      }

      this.setIndex(new Uint16BufferAttribute(SINGLE_CUBE_INDICES.slice(), 1));
      this.setAttribute('position', new Float32BufferAttribute(positions, 3));
      this.setAttribute('uv', new Float32BufferAttribute(SINGLE_CUBE_UVS.slice(), 2));
      this.setAttribute('normal', new Float32BufferAttribute(SINGLE_CUBE_NORMALS.slice(), 3));
      this.boundingBox = new Box3(
        new Vector3(x - halfWidth, y - halfWidth, z - halfWidth),
        new Vector3(x + halfWidth, y + halfWidth, z + halfWidth)
      );
      this.boundingSphere = new Sphere(
        new Vector3(x, y, z),
        Math.sqrt(3) * halfWidth
      );
      return;
    }

    const turnTolerance = 1e-6;
    const path = [];
    const incoming = new Vector3();
    const outgoing = new Vector3();
    for (let index = 0; index < points.length; index++) {
      const point = points[index];
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || !Number.isFinite(point.z)) {
        throw new TypeError(`points[${index}] must have finite x, y, and z coordinates`);
      }
      const copy = new Vector3(point.x, point.y, point.z);
      if (path.length && copy.distanceToSquared(path[path.length - 1]) === 0) continue;

      while (path.length >= 2) {
        incoming.subVectors(path[path.length - 1], path[path.length - 2]);
        outgoing.subVectors(copy, path[path.length - 1]);
        const dot = incoming.dot(outgoing) / Math.sqrt(incoming.lengthSq() * outgoing.lengthSq());
        if (dot < 1 - turnTolerance) break;
        path.pop();
      }

      path.push(copy);
    }

    this.parameters = { points: path.map(point => point.clone()), width };

    if (path.length === 0 || width === 0) {
      this.setIndex([]);
      this.setAttribute('position', new Float32BufferAttribute([], 3));
      this.setAttribute('uv', new Float32BufferAttribute([], 2));
      return;
    }

    if (path.length === 1) {
      const [x, y, z] = path[0].toArray();
      const halfWidth = width / 2;
      const positions = new Float32Array(24 * 3);
      let positionOffset = 0;
      for (const face of SINGLE_CUBE_FACES) {
        for (const corner of face) {
          const signs = SINGLE_CUBE_CORNERS[corner];
          positions[positionOffset++] = x + signs[0] * halfWidth;
          positions[positionOffset++] = y + signs[1] * halfWidth;
          positions[positionOffset++] = z + signs[2] * halfWidth;
        }
      }

      this.setIndex(new Uint16BufferAttribute(SINGLE_CUBE_INDICES.slice(), 1));
      this.setAttribute('position', new Float32BufferAttribute(positions, 3));
      this.setAttribute('uv', new Float32BufferAttribute(SINGLE_CUBE_UVS.slice(), 2));
      this.setAttribute('normal', new Float32BufferAttribute(SINGLE_CUBE_NORMALS.slice(), 3));
      this.computeBoundingBox();
      this.computeBoundingSphere();
      return;
    }

    const directions = new Array(path.length - 1);
    for (let i = 0; i < directions.length; i++) {
      directions[i] = path[i + 1].clone().sub(path[i]).normalize();
    }
    const isClosed = path.length > 2 && path[0].distanceToSquared(path[path.length - 1]) === 0;
    for (let i = 1; i < directions.length; i++) {
      const dot = directions[i - 1].dot(directions[i]);
      const isRightAngle = Math.abs(dot) <= turnTolerance;
      const continuesStraight = dot >= 1 - turnTolerance;
      if (!isRightAngle && !continuesStraight) {
        throw new RangeError('path turns must be 90 degrees; straight segments are also allowed');
      }
    }
    if (isClosed) {
      const dot = directions[directions.length - 1].dot(directions[0]);
      if (Math.abs(dot) > turnTolerance && dot < 1 - turnTolerance) {
        throw new RangeError('path turns must be 90 degrees; straight segments are also allowed');
      }
    }

    const pathDistances = new Float64Array(path.length);
    for (let i = 1; i < path.length; i++) {
      pathDistances[i] = pathDistances[i - 1] + path[i].distanceTo(path[i - 1]);
    }
    const pathLength = pathDistances[pathDistances.length - 1];

    const halfWidth = width / 2;
    const totalLength = pathLength + (isClosed ? 0 : width);
    const frames = new Array(directions.length);
    const normal = new Vector3();
    const binormal = new Vector3();
    const rotation = new Quaternion();

    for (let i = 0; i < directions.length; i++) {
      if (i === 0) {
        const tangent = directions[i];
        const absX = Math.abs(tangent.x);
        const absY = Math.abs(tangent.y);
        const absZ = Math.abs(tangent.z);
        normal.set(
          absX <= absY && absX <= absZ ? 1 : 0,
          absY < absX && absY <= absZ ? 1 : 0,
          absZ < absX && absZ < absY ? 1 : 0
        );
        normal.addScaledVector(tangent, -normal.dot(tangent)).normalize();
      } else {
        rotation.setFromUnitVectors(directions[i - 1], directions[i]);
        normal.applyQuaternion(rotation);
        normal.addScaledVector(directions[i], -normal.dot(directions[i])).normalize();
      }
      binormal.crossVectors(directions[i], normal).normalize();
      frames[i] = { normal: normal.clone(), binormal: binormal.clone() };
    }

    const sideQuadCount = directions.length * 4;
    const capQuadCount = isClosed ? 0 : 2;
    const quadCount = sideQuadCount + capQuadCount;
    const vertexCount = quadCount * 4;
    const positions = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const use32BitIndices = vertexCount > 65535;
    const IndexAttribute = use32BitIndices ? Uint32BufferAttribute : Uint16BufferAttribute;
    const indices = use32BitIndices ? new Uint32Array(quadCount * 6) : new Uint16Array(quadCount * 6);
    const faceCorners = [0, 1, 2, 3];
    const startRing = Array.from({ length: 4 }, () => new Vector3());
    const endRing = Array.from({ length: 4 }, () => new Vector3());
    const firstRing = Array.from({ length: 4 }, () => new Vector3());
    const edge1 = new Vector3();
    const edge2 = new Vector3();
    const faceNormal = new Vector3();
    const outward = new Vector3();
    const miterNormal = new Vector3();
    const offset = new Vector3();
    const segmentCenter = new Vector3();
    const quadPoints = [null, null, null, null];
    const sideUVs = new Float32Array(8);
    const startCapUVs = new Float32Array([0, 0, 0.75, 0, 0.5, 0, 0.25, 0]);
    const endCapUVs = new Float32Array([0, 1, 0.25, 1, 0.5, 1, 0.75, 1]);
    let positionOffset = 0;
    let uvOffset = 0;
    let vertexOffset = 0;
    let indexOffset = 0;

    function getRing(center, frame, direction, nextDirection, ring, extension = 0) {
      for (let i = 0; i < 4; i++) {
        const normalSign = i === 0 || i === 3 ? 1 : -1;
        const binormalSign = i < 2 ? 1 : -1;
        ring[i].copy(center)
          .addScaledVector(direction, extension * halfWidth)
          .addScaledVector(frame.normal, normalSign * halfWidth)
          .addScaledVector(frame.binormal, binormalSign * halfWidth);
      }

      if (nextDirection) {
        miterNormal.copy(direction).add(nextDirection).normalize();
        const denominator = miterNormal.dot(direction);
        for (const corner of ring) {
          offset.copy(corner).sub(center);
          corner.addScaledVector(direction, -miterNormal.dot(offset) / denominator);
        }
      }
    }

    function addQuad(corner0, corner1, corner2, corner3, outward, customUVs) {
      const hasCustomUVs = customUVs !== undefined;
      edge1.copy(corner1).sub(corner0);
      edge2.copy(corner2).sub(corner0);
      if (faceNormal.crossVectors(edge1, edge2).dot(outward) < 0) {
        const temp = corner1;
        corner1 = corner3;
        corner3 = temp;
        if (hasCustomUVs) {
          const tempU = customUVs[2];
          const tempV = customUVs[3];
          customUVs[2] = customUVs[6];
          customUVs[3] = customUVs[7];
          customUVs[6] = tempU;
          customUVs[7] = tempV;
        }
      }

      quadPoints[0] = corner0;
      quadPoints[1] = corner1;
      quadPoints[2] = corner2;
      quadPoints[3] = corner3;
      for (let i = 0; i < 4; i++) {
        const point = quadPoints[i];
        positions[positionOffset++] = point.x;
        positions[positionOffset++] = point.y;
        positions[positionOffset++] = point.z;
        if (hasCustomUVs) {
          uvs[uvOffset++] = customUVs[i * 2];
          uvs[uvOffset++] = 1 - customUVs[i * 2 + 1];
        } else {
          uvs[uvOffset++] = i === 1 || i === 2 ? 1 : 0;
          uvs[uvOffset++] = i >= 2 ? 0 : 1;
        }
      }
      indices[indexOffset++] = vertexOffset;
      indices[indexOffset++] = vertexOffset + 1;
      indices[indexOffset++] = vertexOffset + 2;
      indices[indexOffset++] = vertexOffset;
      indices[indexOffset++] = vertexOffset + 2;
      indices[indexOffset++] = vertexOffset + 3;
      vertexOffset += 4;
    }

    for (let i = 0; i < directions.length; i++) {
      const direction = directions[i];
      const previousDirection = i > 0
        ? directions[i - 1]
        : isClosed ? directions[directions.length - 1] : undefined;
      const nextDirection = i < directions.length - 1
        ? directions[i + 1]
        : isClosed ? directions[0] : undefined;
      const startTurn = previousDirection &&
        Math.abs(previousDirection.dot(direction)) <= turnTolerance
        ? previousDirection
        : undefined;
      const endTurn = nextDirection &&
        Math.abs(direction.dot(nextDirection)) <= turnTolerance
        ? nextDirection
        : undefined;
      getRing(
        path[i],
        frames[i],
        direction,
        startTurn,
        startRing,
        i === 0 && !isClosed ? -1 : 0
      );
      getRing(
        path[i + 1],
        frames[i],
        direction,
        endTurn,
        endRing,
        i === directions.length - 1 && !isClosed ? 1 : 0
      );
      if (i === 0) {
        for (let corner = 0; corner < 4; corner++) firstRing[corner].copy(startRing[corner]);
      }

      segmentCenter.copy(path[i]).add(path[i + 1]).multiplyScalar(0.5);
      const startV = i === 0 && !isClosed
        ? 0
        : (pathDistances[i] + (isClosed ? 0 : halfWidth)) / totalLength;
      const endV = i === directions.length - 1 && !isClosed
        ? 1
        : (pathDistances[i + 1] + (isClosed ? 0 : halfWidth)) / totalLength;
      for (const a of faceCorners) {
        const b = (a + 1) % 4;
        const startU = 0;
        const endU = 1;
        sideUVs[0] = startU;
        sideUVs[1] = startV;
        sideUVs[2] = endU;
        sideUVs[3] = startV;
        sideUVs[4] = endU;
        sideUVs[5] = endV;
        sideUVs[6] = startU;
        sideUVs[7] = endV;
        outward.copy(startRing[a]).add(startRing[b])
          .add(endRing[a]).add(endRing[b])
          .multiplyScalar(0.25)
          .sub(segmentCenter);
        addQuad(
          startRing[a], startRing[b], endRing[b], endRing[a], outward,
          sideUVs
        );
      }
    }

    if (!isClosed) {
      offset.copy(directions[0]).negate();
      addQuad(firstRing[0], firstRing[3], firstRing[2], firstRing[1], offset, startCapUVs);
      addQuad(
        endRing[0], endRing[1], endRing[2], endRing[3],
        directions[directions.length - 1], endCapUVs
      );
    }

    this.setIndex(new IndexAttribute(indices, 1));
    this.setAttribute('position', new Float32BufferAttribute(positions, 3));
    this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    this.computeVertexNormals();
    this.computeBoundingBox();
    this.computeBoundingSphere();
  }

  copy(source) {
    super.copy(source);
    this.parameters = {
      points: source.parameters.points.map(point => point.clone()),
      width: source.parameters.width
    };
    return this;
  }
}
