import Entity from './entity.js';
import ComponentPosition from './component-position.js';
import ComponentAppearance from './component-appearance.js';

class EntityRoom extends Entity{

    constructor() {
        super();
        this.addComponent(new ComponentPosition(0, 0, 0));
        this.addComponent(new ComponentAppearance(
            [
                {
                    func: 'strokeRoundRect',
                    args: [25, 25, 590, 430, 20],
                    settings: {}
                },
            ],
            {
                strokeStyle: '#B5CF61',
                shadowColor: '#B5CF61',
                shadowBlur: 10,
                lineWidth: 10
            }
        ));
    }
}
export { EntityRoom as default }