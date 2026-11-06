import { Vector3 } from 'three';

const CHILD_PERMUTATIONS = [
	[ 0, 3, 4, 7, 6, 5, 2, 1 ],
	[ 0, 7, 6, 1, 2, 5, 4, 3 ],
	[ 0, 7, 6, 1, 2, 5, 4, 3 ],
	[ 2, 3, 0, 1, 6, 7, 4, 5 ],
	[ 2, 3, 0, 1, 6, 7, 4, 5 ],
	[ 4, 3, 2, 5, 6, 1, 0, 7 ],
	[ 4, 3, 2, 5, 6, 1, 0, 7 ],
	[ 6, 5, 2, 1, 0, 3, 4, 7 ]
];
const ORIENTATIONS = [ [ 0, 1, 2, 3, 4, 5, 6, 7 ] ];
const ORIENTATION_TRANSITIONS = [];
const ORIENTATION_IDS = new Map( [ [ ORIENTATIONS[ 0 ].join( '' ), 0 ] ] );

for ( let i = 0; i < ORIENTATIONS.length; i ++ ) {
	const orientation = ORIENTATIONS[ i ];
	const transitions = [];

	for ( const permutation of CHILD_PERMUTATIONS ) {
		const childOrientation = permutation.map( index => orientation[ index ] );
		const key = childOrientation.join( '' );
		let id = ORIENTATION_IDS.get( key );

		if ( id === undefined ) {
			id = ORIENTATIONS.length;
			ORIENTATIONS.push( childOrientation );
			ORIENTATION_IDS.set( key, id );
		}

		transitions.push( id );
	}

	ORIENTATION_TRANSITIONS.push( transitions );
}

const BIGINT_CHILD_INDEXES = [ 0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n ];
const ZERO_CENTER = new Vector3( 0, 0, 0 );

/**
 * Generates a portion of the 3D Hilbert curve.
 *
 * @param {Vector3} [center] - Center of Hilbert curve.
 * @param {number} [size=10] - Total width of Hilbert curve.
 * @param {number} [order=1] - Number of subdivisions.
 * @param {number|bigint} [start=0] - Index of the first point to generate.
 * @param {number|bigint} [length] - Number of points to generate.
 * @param {number} [v0=0] - Corner index -X, +Y, -Z.
 * @param {number} [v1=1] - Corner index -X, +Y, +Z.
 * @param {number} [v2=2] - Corner index -X, -Y, +Z.
 * @param {number} [v3=3] - Corner index -X, -Y, -Z.
 * @param {number} [v4=4] - Corner index +X, -Y, -Z.
 * @param {number} [v5=5] - Corner index +X, -Y, +Z.
 * @param {number} [v6=6] - Corner index +X, +Y, +Z.
 * @param {number} [v7=7] - Corner index +X, +Y, -Z.
 * @returns {Array<Vector3>} The requested Hilbert curve points.
 */
export function hilbert3D(
	center = ZERO_CENTER,
	size = 10,
	order = 1,
	start = 0,
	length,
	v0 = 0,
	v1 = 1,
	v2 = 2,
	v3 = 3,
	v4 = 4,
	v5 = 5,
	v6 = 6,
	v7 = 7
) {
	if ( order < 0 ) return [ new Vector3( 0, 0, 0 ) ];
	if ( ! Number.isInteger( order ) ) throw new TypeError( 'Order must be an integer.' );

	const points = [];

	if ( typeof start === 'bigint' || typeof length === 'bigint' ) {
		const first = toBigInt( start );
		const count = 8n ** BigInt( order + 1 );
		const requestedLength = length === undefined ? count : toBigInt( length );
		const rangeStart = first < 0n ? 0n : first;
		const requestedEnd = rangeStart + ( requestedLength > 0n ? requestedLength : 0n );
		const rangeEnd = requestedEnd > count ? count : requestedEnd;

		if ( rangeStart >= rangeEnd ) return points;

		const baseCorners = [ v0, v1, v2, v3, v4, v5, v6, v7 ];
		if ( rangeEnd - rangeStart === 1n ) {
			generateSingleBigInt( points, center.x, center.y, center.z, size, order, rangeStart, BigInt( order * 3 ), 0, baseCorners );
			return points;
		}

		generateBigInt( points, center.x, center.y, center.z, size, order, 0n, count / 8n, 0, rangeStart, rangeEnd, baseCorners );
		return points;
	}

	const pointCount = 8 ** ( order + 1 );
	const rawStart = Math.floor( start );
	const first = Math.max( 0, rawStart );
	const requestedLength = length === undefined ? pointCount : Math.max( 0, Math.floor( length ) );
	const end = Math.min( pointCount, first + requestedLength );

	if ( first >= end ) return points;

	const baseCorners = [ v0, v1, v2, v3, v4, v5, v6, v7 ];
	generateNumber( points, center.x, center.y, center.z, size, order, 0, pointCount / 8, 0, first, end, baseCorners );
	return points;
}

export default hilbert3D;

function generateNumber( points, x, y, z, size, order, offset, chunkSize, orientationId, first, end, baseCorners ) {
	const orientation = ORIENTATIONS[ orientationId ];
	const transitions = ORIENTATION_TRANSITIONS[ orientationId ];
	const half = size / 2;

	for ( let i = 0; i < 8; i ++ ) {
		const childOffset = offset + i * chunkSize;
		const childEnd = childOffset + chunkSize;
		if ( childEnd <= first || childOffset >= end ) continue;

		const actualCorner = baseCorners[ orientation[ i ] ];
		const childX = x + ( actualCorner < 4 ? -half : half );
		const childY = y + ( actualCorner < 2 || actualCorner > 5 ? half : -half );
		const childZ = z + ( actualCorner % 4 === 1 || actualCorner % 4 === 2 ? half : -half );

		if ( order === 0 ) {
			points.push( new Vector3( childX, childY, childZ ) );
		} else {
			generateNumber( points, childX, childY, childZ, half, order - 1, childOffset, chunkSize / 8, transitions[ i ], first, end, baseCorners );
		}
	}
}

function generateBigInt( points, x, y, z, size, order, offset, chunkSize, orientationId, first, end, baseCorners ) {
	const orientation = ORIENTATIONS[ orientationId ];
	const transitions = ORIENTATION_TRANSITIONS[ orientationId ];
	const half = size / 2;
	const childChunkSize = chunkSize / 8n;
	const nodeEnd = offset + chunkSize * 8n;
	const firstChild = first <= offset ? 0 : Number( ( first - offset ) / chunkSize );
	const lastChild = end >= nodeEnd ? 7 : Number( ( end - 1n - offset ) / chunkSize );
	let childOffset = offset + BIGINT_CHILD_INDEXES[ firstChild ] * chunkSize;

	for ( let i = firstChild; i <= lastChild; i ++, childOffset += chunkSize ) {

		const actualCorner = baseCorners[ orientation[ i ] ];
		const childX = x + ( actualCorner < 4 ? -half : half );
		const childY = y + ( actualCorner < 2 || actualCorner > 5 ? half : -half );
		const childZ = z + ( actualCorner % 4 === 1 || actualCorner % 4 === 2 ? half : -half );

		if ( order === 0 ) {
			points.push( new Vector3( childX, childY, childZ ) );
		} else {
			generateBigInt( points, childX, childY, childZ, half, order - 1, childOffset, childChunkSize, transitions[ i ], first, end, baseCorners );
		}
	}
}

function generateSingleBigInt( points, x, y, z, size, order, index, shift, orientationId, baseCorners ) {
	const orientation = ORIENTATIONS[ orientationId ];
	const child = Number( ( index >> shift ) & 7n );
	const actualCorner = baseCorners[ orientation[ child ] ];
	const half = size / 2;
	const childX = x + ( actualCorner < 4 ? -half : half );
	const childY = y + ( actualCorner < 2 || actualCorner > 5 ? half : -half );
	const childZ = z + ( actualCorner % 4 === 1 || actualCorner % 4 === 2 ? half : -half );

	if ( order === 0 ) {
		points.push( new Vector3( childX, childY, childZ ) );
	} else {
		generateSingleBigInt( points, childX, childY, childZ, half, order - 1, index, shift - 3n, ORIENTATION_TRANSITIONS[ orientationId ][ child ], baseCorners );
	}
}

function toBigInt( value ) {
	if ( typeof value === 'bigint' ) return value;
	if ( ! Number.isSafeInteger( value ) ) throw new TypeError( 'BigInt ranges require integer values.' );
	return BigInt( value );
}
