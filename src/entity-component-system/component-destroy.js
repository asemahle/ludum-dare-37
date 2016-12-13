class ComponentDestroy {
    constructor(entity) {
        this.name = 'destroy';

        this.entity = entity;
        this.isDestroyed = false;
        this.timeSinceDestroy = -1;
    }

    destroy() {
        if(!this.isDestroyed) {
            this.timeSinceDestroy = 0;
        }
        this.isDestroyed = true;
    }
}
export { ComponentDestroy as default }