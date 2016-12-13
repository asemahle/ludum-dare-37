import EntityPowerup from './entity-powerup.js';

class EntitySupershield extends EntityPowerup{

    constructor(x, y) {
        super(x, y);
        this.subtype = 'supershield';
        this.colour = '#3EAAC8';
        this.pieces = [
            {
                func: 'strokeCircle',
                args: [0, 0, 20],
            }
        ]
    }
}
export { EntitySupershield as default }