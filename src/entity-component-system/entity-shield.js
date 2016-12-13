import Entity from './entity.js';
import ComponentPosition from './component-position.js';
import ComponentAppearance from './component-appearance.js';
import ComponentUpdate from './component-update.js';
import ComponentDestroy from './component-destroy.js';

class EntityShield extends Entity{

    constructor(owner) {
        super();

        this.owner = owner;
        this.bulletSpeed = 100;

        this.addComponent(new ComponentDestroy(this));

        this.addComponent(new ComponentPosition());
        this.components.position.pos = this.owner.components.position.pos;

        this.addComponent(new ComponentUpdate((ECS, delta) => {
            this.components.position.pos = this.owner.components.position.pos;
            if (this.owner.components.destroy.timeSinceDestroy >=0 || this.components.destroy.timeSinceDestroy >= 0) {
                ECS.removeEntity(this);
            }
        }));
        this.addComponent(new ComponentAppearance(
            [
                {
                    func: 'strokeCircle',
                    args: [0, 0, 29],
                }
            ],
            {
                strokeStyle: '#3EAAC8',
                shadowColor: '#3EAAC8',
                shadowBlur: 2,
                lineWidth: 2
            }
        ));
    }
}
export { EntityShield as default }