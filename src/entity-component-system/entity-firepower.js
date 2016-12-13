import EntityPowerup from './entity-powerup.js';

class EntitySpeedboost extends EntityPowerup{

    constructor(x, y) {
        super(x, y);
        this.subtype = 'speedboost';
        this.colour = '#F75961';
        this.pieces = [
            {
                func: 'rotateRect',
                args: [-20, -20, 40, 40, Math.PI/4],
            }
        ]
    }
}
export { EntitySpeedboost as default }