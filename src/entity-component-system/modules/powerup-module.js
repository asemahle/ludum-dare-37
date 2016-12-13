import Module from './module';
import ComponentPowerup from '../component-powerup.js';

class PowerupModule extends Module {
    constructor(name, modules, entity) {
        super(name, modules, entity);

        this.type = 'POWERUP';
        this.hasPowerup = false;
        this.powerup = {};
        this.powerupIsActive = false;
    }

    setPowerup(name) {
        this.hasPowerup = true;
        this.powerupIsActive = false;
        this.powerup = ComponentPowerup.powerups[name];
    }

    removePowerup() {
        this.hasPowerup = false;
        this.powerupIsActive = false;
        this.powerup = {};
    }

    serialize() {
        // { name: string, hasPowerup: string, powerup: string, powerupIsActive: boolean }
        let s = super.serialize();
        s.hasPowerup = this.hasPowerup;
        s.powerup = this.powerup.name || 'none';
        s.powerupIsActive = this.powerupIsActive;
        return s;
    }

    update(settings, delta, ECS) {
        // { activate: bool }
        settings = settings || {};
        let activate = settings.activate || false;

        if (this.hasPowerup && !this.powerupIsActive) {
            this.powerupIsActive = true;
            this.entity.components.powerup.addActivePowerUp(this.powerup, this);
        }
    }

    powerUpDone() {
        this.powerup = {};
        this.hasPowerup = false;
        this.powerupIsActive = false;
    }
}
export { PowerupModule as default }