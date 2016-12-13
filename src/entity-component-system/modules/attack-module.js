import Module from './module';
import EntityBullet from '../entity-bullet.js';

class AttackModule extends Module {
    constructor(name, modules, entity) {
        super(name, modules, entity);

        this.type = 'ATTACK';
        this.maxCooldown = 500;
        this.cooldown = 0;
    }

    serialize() {
        // { name: string, cooldown: number }
        let s = super.serialize();
        s.cooldown = this.cooldown;
        return s;
    }

    update(settings, delta, ECS) {
        // { shoot: bool }
        settings = settings || {};
        let shoot = settings.shoot || false;

        if (settings.shoot && this.cooldown <= 0) {
            this.cooldown = this.maxCooldown;
            ECS.addEntity(new EntityBullet({
                team: this.entity.team || null,
                dir: this.entity.components.position.rotation,
                x: this.entity.components.position.pos.x,
                y: this.entity.components.position.pos.y
            }));
        } else if (this.cooldown > 0) {
            this.cooldown -= delta;
        }
    }
}
export { AttackModule as default }
