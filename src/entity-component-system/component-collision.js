class ComponentCollision {
    constructor(type, settings) {
        settings = settings || {};

        this.name = 'collision';
        this.type = type;
        this.x1 = null;
        this.x2 = null;
        this.y1 = null;
        this.y2 = null;
        this.radius = null;

        switch (type) {
            case 'line':
                this.x1 = settings.x1 || 0;
                this.x2 = settings.x2 || 0;
                this.y1 = settings.y1 || 0;
                this.y2 = settings.y2 || 0;
                break;
            case 'circle':
                this.radius = settings.radius || 25;
                break;
            default:
                throw 'Unknown type for collision component [' + type + ']';
        }
    }
}
export { ComponentCollision as default }