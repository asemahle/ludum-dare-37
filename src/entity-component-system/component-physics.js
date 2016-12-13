class ComponentPhysics {
    constructor(mass, restitution, friction) {
        this.name = 'physics';
        this.mass = mass;
        this.restitution = restitution;
        this.friction = friction;
    }
}
export { ComponentPhysics as default }