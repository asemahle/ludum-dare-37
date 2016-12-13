import Entity from './entity.js';
import ComponentPosition from './component-position.js';
import ComponentCollision from './component-collision.js';
import ComponentPhysics from './component-physics.js';
import ComponentWorld from './component-world.js';
import Victor from 'victor';
import ComponentAppearance from './component-appearance.js';

class EntityWall extends Entity{

    constructor(x1, y1, x2 ,y2) {
        super();
        this.type = 'wall';
        this.addComponent(new ComponentPosition(0, 0, 0));
        this.addComponent(new ComponentCollision('line', {x1: x1, y1: y1, x2: x2, y2: y2}));
        this.addComponent(new ComponentPhysics(1000, 0.2, 0));
        this.addComponent(new ComponentWorld(this.serializeWRT.bind(this)));

        // this.addComponent(new ComponentAppearance(
        //     [
        //         {
        //             func: 'drawLine',
        //             args: [x1, y1, x2, y2],
        //         }
        //     ],
        //     {
        //         strokeStyle: '#B5CF61',
        //         shadowColor: '#B5CF61',
        //         shadowBlur: 2,
        //         lineWidth: 2
        //     }
        // ))
    }

    serializeWRT(entity) {
        if (entity.type != 'bot') return;

        let bp = entity.components.position.pos;
        let p1 = new Victor(this.components.collision.x1, this.components.collision.y1);
        let p2 = new Victor(this.components.collision.x2, this.components.collision.y2);

        let nt_bp = bp.clone().rotate(-entity.components.position.rotation);
        let nt_p1 = p1.clone().rotate(-entity.components.position.rotation);
        let nt_p2 = p2.clone().rotate(-entity.components.position.rotation);

        let l = nt_p2.clone().subtract(nt_p1).normalize();
        let b = nt_bp.clone().subtract(nt_p1);

        let x = l.clone().multiplyScalar(b.dot(l));
        let v = x.clone().subtract(b);

        return {
            x: v.x,
            y: v.y,
            distance: v.length(),
            bearing: v.horizontalAngle(),
        }
    }
}
export { EntityWall as default }