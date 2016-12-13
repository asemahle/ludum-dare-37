import Victor from 'victor';

class ComponentMovement {
    constructor(velocity) {
        this.name = 'movement';
        this.velocity = velocity || new Victor(0, 0);
        this.acceleration = new Victor(0, 0);
    }
}
export { ComponentMovement as default }