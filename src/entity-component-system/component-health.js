class ComponentHealth {
    constructor(health) {
        this.name = 'health';

        this.health = health;
        this.shielded = false;
    }

    damage(d) {
        if (!this.shielded)
            this.health -= d;
    }
}
export { ComponentHealth as default }