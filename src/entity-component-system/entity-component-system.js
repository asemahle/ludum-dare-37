import SystemRender from './system-render.js';
import SystemUpdate from './system-update.js';
import EntityFactory from './entity-factory.js';

class EntityComponentSystem {
    constructor(ctx) {
        this.winner = {name: '', team: ''};
        this.gameOver = false;
        this.updating = false;
        this.entities = {};
        this.systems = [
            new SystemUpdate(),
            new SystemRender(),
        ];
        this.ctx = ctx;
        this.entityAddBuffer = [];
    }

    addEntity(entity) {
        this.entityAddBuffer.push(entity);
        if (!this.updating) {
            this.clearAddEntityBuffer()
        }
    }

    clearAddEntityBuffer() {
        for (let entity of this.entityAddBuffer) {
            this.entities[entity.id] = entity;
        }
        this.entityAddBuffer = [];
    }

    removeEntity(entity) {
        if (entity.id && this.entities[entity.id]){
            if (typeof entity.teardown == 'function') entity.teardown();
            delete this.entities[entity.id];
        } else {
            console.log('?');
        }
    }

    update(delta) {
        this.updating = true;
        for (let system of this.systems) {
            if (system.constructor.name == 'SystemUpdate' && delta == 0) {
                continue;
            }
            system.run(this, delta);
        }

        let count = 0;
        let lb = null;
        let playerLives = false;
        for(let id in this.entities) {
            let e = this.entities[id];
            if (e.type == 'bot') {
                count ++;
                lb = e;
            }
            if (e.subtype == 'player') {
                playerLives = true;
            }
        }
        if ((count == 1 || !playerLives) && !this.gameOver) {
            this.gameOver = true;
            if (!playerLives) {
                this.winner = {
                    name: lb.name = 'The Bad Bots',
                    team: 'bad',
                }
            }else{
                this.ctx.canvas.dispatchEvent(new CustomEvent('win', { 'detail': this.level }));;
                this.winner = {
                    name: lb.name,
                    team: lb.team
                };
            }
        }
        if (this.gameOver) {
            let ctx = this.ctx;
            ctx.save();


            ctx.shadowBlur = 50;
            ctx.strokeStyle = 'white';
            ctx.shadowColor = 'white';
            ctx.lineWidth = 4;
            ctx.font = "100px Arial";
            if (this.level == -1) {
                ctx.font = "50px Arial";
                ctx.strokeText('Winner: ' + this.winner.name, 50 , 265);
            } else {
                if (this.winner.team == 'good') {
                    ctx.strokeText('You Win!', 50, 290);
                } else {
                    ctx.strokeText('You Lose!', 50, 290);
                }
            }

            ctx.restore();
        }

        this.updating = false;
        this.clearAddEntityBuffer();

    }

    setLevel(level, bots) {
        this.gameOver = false;
        this.entities = [];

        let newEntities = EntityFactory.buildEntitiesForLevel(level, bots);
        for (let entity of newEntities) {
            this.addEntity(entity);
        }
    }
}
export { EntityComponentSystem as default }