import {expect,it} from 'vitest';
import {HAND_PIVOT,HAND_POLYGON} from './handWave';
it('defines a left-hand region in the uploaded portrait',()=>{
 expect(HAND_POLYGON.length).toBeGreaterThan(8);
 expect(HAND_POLYGON.every(([x,y])=>x>=0&&x<=364&&y>=0&&y<=521)).toBe(true);
});
it('anchors rotation at the wrist rather than the body',()=>{
 expect(HAND_PIVOT.x).toBeGreaterThan(10);
 expect(HAND_PIVOT.x).toBeLessThan(25);
 expect(HAND_PIVOT.y).toBeGreaterThan(45);
 expect(HAND_PIVOT.y).toBeLessThan(60);
});
