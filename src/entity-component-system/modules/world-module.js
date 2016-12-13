import Module from './module';

class WorldModule extends Module {

    constructor(name, modules, entity) {
        super(name, modules, entity);

        this.type = 'WORLD';
        this.delta = null;
        this.bots = [];
        this.walls = [];
        this.bullets = [];
        this.powerups = [];
    }

    serialize(ECS) {
        // { name: string, delta: number, bots: [], walls: [], bullets: [], powerups: [] }
        let s = super.serialize();
        s.delta = this.delta;
        s.bots = this.bots;
        s.walls = this.walls;
        s.bullets = this.bullets;
        s.powerups = this.powerups;
        return s;
    }

    update(settings, delta) {
        this.delta = delta;
    }
}
export { WorldModule as default }