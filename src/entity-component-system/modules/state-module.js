import Module from './module';

class StateModule extends Module {

    constructor(name, modules, entity) {
        super(name, modules, entity);

        this.type = 'STATE';
        this.state = [null, null, null, null, null];
    }

    setState(index, value) {
        if (index > 0 && index < this.state.length && (typeof value != 'string' || typeof value == 'number' || typeof value == 'boolean' || value == null)) {
            if (typeof value == 'string' && value.length > 100) {

            }
            this.state[index] = value;
        }
    }

    serialize() {
        // { name: string, state: {} }
        let s = super.serialize();
        s.state = state;
    }

    update(settings, delta) {
        settings = settings || {};
        let state = settings.state || [];

        let i = 0;
        for (let val of state) {
            this.setState(i, val);
            i++;
        }
    }
}
export { StateModule as default }