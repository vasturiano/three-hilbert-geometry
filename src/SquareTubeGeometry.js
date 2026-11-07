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

    const path = points.map((point, index) => {
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || !Number.isFinite(point.z)) {
        throw new TypeError(`points[${index}] must have finite x, y, and z coordinates`);
      }
      return new Vector3(point.x, point.y, point.z);
    }).filter((point, index, list) => index === 0 || point.distanceToSquared(list[index - 1]) > 0);

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

    const directions = path.slice(1).map((point, index) =>
      point.clone().sub(path[index]).normalize()
    );
    const turnTolerance = 1e-6;
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

    const halfWidth = width / 2;
    const frames = [];
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
      frames.push({ normal: normal.clone(), binormal: binormal.clone() });
    }

    const positions = [];
    const uvs = [];
    const indices = [];
    const faceCorners = [[0, 1], [1, 2], [2, 3], [3, 0]];

    function getRing(center, frame, direction, nextDirection, extension = 0) {
      if (extension) center = center.clone().addScaledVector(direction, extension * halfWidth);
      const corners = [
        center.clone().addScaledVector(frame.normal, halfWidth).addScaledVector(frame.binormal, halfWidth),
        center.clone().addScaledVector(frame.normal, -halfWidth).addScaledVector(frame.binormal, halfWidth),
        center.clone().addScaledVector(frame.normal, -halfWidth).addScaledVector(frame.binormal, -halfWidth),
        center.clone().addScaledVector(frame.normal, halfWidth).addScaledVector(frame.binormal, -halfWidth)
      ];

      if (nextDirection) {
        const miterNormal = direction.clone().add(nextDirection).normalize();
        const denominator = miterNormal.dot(direction);
        for (const corner of corners) {
          const offset = corner.clone().sub(center);
          corner.addScaledVector(direction, -miterNormal.dot(offset) / denominator);
        }
      }
      return corners;
    }

    function addQuad(corners, outward) {
      const edge1 = corners[1].clone().sub(corners[0]);
      const edge2 = corners[2].clone().sub(corners[0]);
      if (edge1.cross(edge2).dot(outward) < 0) {
        corners = [corners[0], corners[3], corners[2], corners[1]];
      }

      const offset = positions.length / 3;
      for (let i = 0; i < 4; i++) {
        const point = corners[i];
        positions.push(point.x, point.y, point.z);
        uvs.push(i === 1 || i === 2 ? 1 : 0, i >= 2 ? 1 : 0);
      }
      indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
    }

    let firstRing;
    let lastRing;
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
      const startRing = getRing(
        path[i],
        frames[i],
        direction,
        startTurn,
        i === 0 && !isClosed ? -1 : 0
      );
      const endRing = getRing(
        path[i + 1],
        frames[i],
        direction,
        endTurn,
        i === directions.length - 1 && !isClosed ? 1 : 0
      );
      if (i === 0) firstRing = startRing;
      if (i === directions.length - 1) lastRing = endRing;

      for (const [a, b] of faceCorners) {
        const outward = startRing[a].clone().add(startRing[b])
          .add(endRing[a]).add(endRing[b])
          .multiplyScalar(0.25)
          .sub(path[i].clone().add(path[i + 1]).multiplyScalar(0.5));
        addQuad([startRing[a], startRing[b], endRing[b], endRing[a]], outward);
      }
    }

    if (!isClosed) {
      addQuad([firstRing[0], firstRing[3], firstRing[2], firstRing[1]], directions[0].clone().negate());
      addQuad(lastRing, directions[directions.length - 1]);
    }

    const use32BitIndices = positions.length / 3 > 65535;
    const IndexAttribute = use32BitIndices ? Uint32BufferAttribute : Uint16BufferAttribute;
    const IndexArray = use32BitIndices ? Uint32Array : Uint16Array;
    this.setIndex(new IndexAttribute(new IndexArray(indices), 1));
    this.setAttribute('position', new Float32BufferAttribute(new Float32Array(positions), 3));
    this.setAttribute('uv', new Float32BufferAttribute(new Float32Array(uvs), 2));
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
