import { BufferGeometry, Vector3 } from 'three';

declare class HilbertGeometry extends BufferGeometry {
  constructor(
    order: number,
    start: number | bigint,
    length: number | bigint,
    optionalArgs?: {
      padding?: number,
      paddingAbsolute?: number,
      simplifyCurves?: boolean
    }
  );

  static getValAtPosition(order: number, point: Vector3): number | bigint;
  static getPositionAtVal(order: number, val: number | bigint): Vector3;
}

export default HilbertGeometry;
