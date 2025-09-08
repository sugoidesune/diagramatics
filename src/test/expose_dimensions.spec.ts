import { expect } from 'chai';
import 'mocha';
import { circle, square, arc } from '../index.js';
import { V2 } from '../vector.js';

describe('Expose dimensions', () => {
    it('initial dimensions are exposed', () => {
        const s = square(1);
        expect(s.width).to.equal(1);
        expect(s.height).to.equal(1);

        const c = circle(1);
        expect(c.radius).to.equal(1);
        expect(c.width).to.equal(2);
        expect(c.height).to.equal(2);

        const a = arc(3);
        expect(a.radius).to.equal(3);
    });

    it('uniform scaling updates dimensions', () => {
        const s2 = square(1).scale(2);
        expect(s2.width).to.equal(2);
        expect(s2.height).to.equal(2);

        const c2 = circle(1).scale(2);
        // radius should scale by factor 2, width/height by factor 2 as well (width starts at 2)
        expect(c2.radius).to.equal(2);
        expect(c2.width).to.equal(4);
        expect(c2.height).to.equal(4);
    });

    it('non-uniform scaling updates dimensions appropriately', () => {
        const s3 = square(1).scale(V2(2, 3));
        expect(s3.width).to.equal(2);
        expect(s3.height).to.equal(3);

        const c3 = circle(1).scale(V2(2, 3));
        // radius uses geometric mean: sqrt(2*3) = sqrt(6)
        expect(c3.radius).to.be.closeTo(Math.sqrt(6), 1e-6);
        // width/height scale from initial width=2,height=2
        expect(c3.width).to.equal(4); // 2 * 2
        expect(c3.height).to.equal(6); // 2 * 3
    });

    it('negative scaling keeps dimensions positive (uses absolute scale)', () => {
        const s4 = square(1).scale(V2(-2, -3));
        expect(s4.width).to.equal(2);
        expect(s4.height).to.equal(3);

        const c4 = circle(1).scale(V2(-2, -3));
        expect(c4.radius).to.be.closeTo(Math.sqrt(6), 1e-6);
    });

    it('fractional scaling updates arc radius', () => {
        const a2 = arc(5).scale(0.5);
        expect(a2.radius).to.be.closeTo(2.5, 1e-6);
    });
});

// New tests for transforms and chained operations
describe('Transforms and chained operations', () => {
    it('translate and rotate do not change dimensions', () => {
        const c = circle(1);
        const cTrans = c.translate(V2(10, 5));
        expect(cTrans.radius).to.equal(1);
        expect(cTrans.width).to.equal(2);
        expect(cTrans.height).to.equal(2);

        const cRot = c.rotate(Math.PI / 4);
        expect(cRot.radius).to.equal(1);
        expect(cRot.width).to.equal(2);
        expect(cRot.height).to.equal(2);
    });

    it('transform with non-uniform affine scaling updates dimensions', () => {
        const s = square(1).transform((p) => V2(p.x * 2, p.y * 3));
        expect(s.width).to.equal(2);
        expect(s.height).to.equal(3);

        const c = circle(1).transform((p) => V2(p.x * 2, p.y * 3));
        expect(c.radius).to.be.closeTo(Math.sqrt(6), 1e-6);
        expect(c.width).to.equal(4);
        expect(c.height).to.equal(6);
    });

    it('chained scale then transform yields expected dimensions', () => {
        // scale by 2 then uniform 0.5 transform -> back to original radius
        const c = circle(1).scale(2).transform((p) => V2(p.x * 0.5, p.y * 0.5));
        expect(c.radius).to.be.closeTo(1, 1e-6);
        expect(c.width).to.equal(2);  // 2 (initial width) * 2 (scale) * 0.5 (transform) = 2
        expect(c.height).to.equal(2);
    });

    it('transform then scale composes scales (area/radius scales multiply)', () => {
        // transform scales by (2,3) -> radius *= sqrt(6), width=4,height=6
        // then scale by (2,3) again -> radius *= sqrt(6) => total radius = 6
        const c = circle(1).transform((p) => V2(p.x * 2, p.y * 3)).scale(V2(2, 3));
        expect(c.radius).to.be.closeTo(6, 1e-6);
        expect(c.width).to.equal(8);   // 2 * 2 * 2
        expect(c.height).to.equal(18); // 2 * 3 * 3
    });

    it('chained scales multiply dimensions', () => {
        const c = circle(1).scale(2).scale(3);
        expect(c.radius).to.be.closeTo(6, 1e-6); // 1 * 2 * 3
        expect(c.width).to.equal(12);  // initial width 2 * 2 * 3 = 12
        expect(c.height).to.equal(12);
    });
});