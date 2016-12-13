import Module from './module';
import EntityShield from '../entity-shield.js';

class DefendModule extends Module {

    constructor(name, modules, entity) {
        super(name, modules, entity);

        this.shieldEntity = null;
        this.shieldIsUp = false;
        this.shieldMaxCooldown = 5000;
        this.shieldMaxUptime = 1000;
        this.shieldCooldown = 0;
        this.shieldUptime = 0;
        this.type = 'DEFEND';
    }

    serialize() {
        // { name: string }
        let s = super.serialize();
        s.shieldIsUp = this.shieldIsUp;
        s.shieldCooldown = this.shieldCooldown;
        s.shieldUptime = this.shieldUptime;

        return s;
    }

    update(settings, delta, ECS) {
        // { shield: boolean }
        settings = settings || {};
        settings.shield = settings.shield || false;

        if (!this.shieldIsUp && settings.shield && this.shieldCooldown <= 0) {
            this.shieldIsUp = true;
            this.entity.components.health.shielded = true;
            this.shieldCooldown = this.shieldMaxCooldown;
            this.shieldUptime = 0;
            this.shieldEntity = new EntityShield(this.entity)
            ECS.addEntity(this.shieldEntity);
        }

        if (this.shieldIsUp) {
            this.shieldUptime += delta;
            if (this.shieldUptime > this.shieldMaxUptime) {
                this.shieldIsUp = false;
                this.entity.components.health.shielded = false;

                if (this.shieldEntity != null)
                    this.shieldEntity.components.destroy.destroy(ECS);
            }
        }

        if (this.shieldCooldown > 0) {
            this.shieldCooldown -= delta;
        }
    }
}
export { DefendModule as default }