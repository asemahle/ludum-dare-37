import Entity from './entity.js';
import ComponentPosition from './component-position.js';
import ComponentAppearance from './component-appearance.js';
import ComponentCollision from './component-collision.js';
import ComponentUpdate from './component-update.js';
import ComponentDestroy from './component-destroy.js';
import ComponentWorld from './component-world.js';
import ComponentMovement from './component-movement.js';
import ComponentPhysics from './component-physics.js';
import ComponentCreate from './component-create.js';
import Victor from 'victor';

class EntityPowerup extends Entity{

    constructor(x,y) {
        super();
        this.type = 'powerup';

        this.pieces = [];
        this.colour = '#fff';

        this.addComponent(new ComponentCreate(this));
        this.addComponent(new ComponentPhysics(1, 1, 0));
        this.addComponent(new ComponentMovement());
        this.addComponent(new ComponentWorld(this.serializeWRT.bind(this)));
        this.addComponent(new ComponentDestroy(this));
        this.addComponent(new ComponentUpdate(this.updateFunc.bind(this)));
        this.addComponent(new ComponentCollision('circle', {radius: 20}));
        this.addComponent(new ComponentPosition(x, y, 0));
        this.addComponent(new ComponentAppearance([], {}, this.animate.bind(this)));
    }

    animate() {
        if (this.components.create.timeSinceCreation < 500) {
            let t = this.components.create.timeSinceCreation/100;
            return {
                objects: this.pieces,
                globalSettings: {
                    strokeStyle: this.colour,
                    shadowColor: this.colour,
                    shadowBlur: Math.min(10, t),
                    lineWidth: Math.min(5, t)
                }
            };
        }
        if (this.components.destroy.timeSinceDestroy >= 0) {
            let t = this.components.destroy.timeSinceDestroy/100;
            return {
                objects: this.pieces,
                globalSettings: {
                    strokeStyle: this.colour,
                    shadowColor: this.colour,
                    shadowBlur: Math.max(0, 10 - (t)),
                    lineWidth: Math.max(0, 5 - (t))
                }
            };
        }
        return {
            objects: this.pieces,
            globalSettings: {
                strokeStyle: this.colour,
                shadowColor: this.colour,
                shadowBlur: 10,
                lineWidth: 5
            }
        }
    }

    updateFunc(ECS, delta) {
        if (this.components.destroy.timeSinceDestroy >= 0) {
            this.removeComponent('collision');
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

        return {
            type: this.subtype,
            x: normPos.x,
            y: normPos.y,
            distance: d,
            bearing: b,
        };
    }
}
export { EntityPowerup as default }