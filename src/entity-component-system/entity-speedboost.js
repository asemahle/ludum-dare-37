import EntityPowerup from './entity-powerup.js';

class EntitySpeedboost extends EntityPowerup{

    constructor(x, y) {
        super(x, y);
        this.subtype = 'speedboost';
        this.colour = '#B5CF61';
        this.pieces = [
            {
                func: 'multiLine',
                args: [[[-15, -17], [15, 0], [-15, 17]], true],
            },
            {
                func: 'multiLine',
                args: [[[-10, -17], [20, 0], [-10, 17]]],
            },
        ]
    }
}
export { EntitySpeedboost as default }