class ComponentCreate {
    constructor(entity) {
        this.name = 'create';

        this.entity = entity;
        this.timeSinceCreation = 0;
    }
}
export { ComponentCreate as default }