import Entity from './entity.js';
import ComponentPosition from './component-position.js';
import ComponentAppearance from './component-appearance.js';
import ComponentDamage from './component-damage.js';
import ComponentCollision from './component-collision.js';
import ComponentUpdate from './component-update.js';
import ComponentMovement from './component-movement.js';
import ComponentPhysics from './component-physics.js';
import ComponentDestroy from './component-destroy.js';
import ComponentHealth from './component-health.js';
import ComponentWorld from './component-world.js';
import Victor from 'victor';

class EntityBullet extends Entity{

    constructor(settings) {
        super();
        this.type = 'bullet';
        settings = settings || {};
        this.team = settings.team || 'none';
        this.bulletColour = '#EA5471';
        if (this.team == 'good') this.bulletColour = '#3EAAC8';

        let dir = settings.dir || 0;
        let x = settings.x || 0;
        let y = settings.y || 0;

        this.bulletSpeed = 100;

        this.addComponent(new ComponentWorld(this.serializeWRT.bind(this)));
        this.addComponent(new ComponentHealth(1000));
        this.addComponent(new ComponentDestroy(this));
        this.addComponent(new ComponentPhysics(1, 1, 0));
        this.addComponent(new ComponentMovement((new Victor(1,0)).rotate(dir).multiplyScalar(this.bulletSpeed)));
        this.addComponent(new ComponentUpdate(this.updateFunc.bind(this)));
        this.addComponent(new ComponentCollision('line', {x1: 0, y1: 0, x2: 20, y2: 0}));
        this.addComponent(new ComponentDamage(this.team, 50));
        this.addComponent(new ComponentPosition(x, y, dir));
        this.addComponent(new ComponentAppearance(
            [
                {
                    func: 'drawLine',
                    args: [0, 0, -20, 0],
                },
            ],
            {
                strokeStyle: this.bulletColour,
                shadowColor: this.bulletColour,
                shadowBlur: 10,
                lineWidth: 5
            },
            this.animate.bind(this)
        ));
    }

    animate() {
        if (this.components.destroy.timeSinceDestroy >= 0) {
            let t = this.components.destroy.timeSinceDestroy/10;
            let pieces = [];
            for (let i = 0; i < 5; i++) {
                let p = (new Victor(-1,0)).rotate(-Math.PI/3 + ((i/5)*2*Math.PI/3)).multiplyScalar(t);
                pieces.push({
                    func: 'drawLine',
                    args: [0, 0, p.x, p.y]
                })
            }
            return {
                objects: pieces,
                globalSettings: {
                    strokeStyle: this.bulletColour,
                    shadowColor: this.bulletColour,
                    shadowBlur: Math.max(1, 10 - (t/15)),
                    lineWidth: Math.max(0, 5 - (t/15))
                }
            };
        }
    }

    updateFunc(ECS, delta) {
        if (this.components.destroy.timeSinceDestroy >= 0) {
            this.components.movement.velocity = new Victor(0, 0);
            this.components.damage.damage = 0;
        }
        if (this.components.destroy.timeSinceDestroy >= 500) {
            ECS.removeEntity(this);
        }
    }

    serializeWRT(entity) {
        if (entity.team == this.team) return null;

        let normPos = this.components.position.pos.clone().subtract(entity.components.position.pos).rotate(-entity.components.position.rotation);
        let d = normPos.magnitude();

        let b = -1 * normPos.horizontalAngle();
        if (b > Math.PI || b < -Math.PI) b += Math.sign(b) * 2 * Math.PI;

        let v = this.components.movement.velocity.clone().subtract(this.components.movement.velocity);

        return {
            x: normPos.x,
            y: normPos.y,
            distance: d,
            bearing: b,
            vx: v.x,
            vy: v.y
        };
    }
}
export { EntityBullet as default }