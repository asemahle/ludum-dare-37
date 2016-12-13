class ComponentAppearance {
    constructor(objects, globalSettings, animateFunc) {
        this.name = 'appearance';

        this.globalSettings = globalSettings || {};
        this.objects = objects;

        this.animateFunc = animateFunc || (() => { });
    }

    animate(entity) {
        return this.animateFunc(entity);
    }
}
export { ComponentAppearance as default }