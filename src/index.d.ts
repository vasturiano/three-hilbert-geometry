import { BufferGeometry } from 'three';

declare class HilbertGeometry extends BufferGeometry {
  constructor(
    order: number,
    start: number | bigint,
    length: number | bigint,
    optionalArgs?: {
      padding?: number,
      simplifyCurves?: boolean
    }
  );
}

export default HilbertGeometry;
