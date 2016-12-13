import generateGuid from '../utils/generateGuid.js'

class Entity {
    constructor() {
        this.id = generateGuid();
        this.type = 'entity';
        this.components = {};
    }

    addComponent(component) {
        this.components[component.name] = component;
    }

    removeComponent(component) {
        if (component.name == null) return;
        if (this.components[component.name] == null) return;

        delete this.components[component.name];
    }
}
export { Entity as default }