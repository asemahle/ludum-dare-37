import Victor from 'victor';

class ComponentPosition {
    constructor(x, y, rotation) {
        this.name = 'position';
        this.pos = new Victor(x, y);
        this._rotation = null;
        this.rotation = rotation || 0;
    }

    set rotation(val) {
        this._rotation = Math.atan2(Math.sin(val), Math.cos(val));
        if (isNaN(this._rotation))
            this._rotation = 0;
    }
    get rotation() { return this._rotation; }
}
export { ComponentPosition as default }