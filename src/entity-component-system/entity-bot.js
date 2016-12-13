import ModuleFactory from './modules/module-factory.js';
import WorldModule from './modules/world-module.js';
import Entity from './entity.js';
import ComponentPosition from './component-position.js';
import ComponentCollision from './component-collision.js';
import ComponentAppearance from './component-appearance.js';
import ComponentUpdate from './component-update.js';
import ComponentWorld from './component-world.js';
import ComponentMovement from './component-movement.js';
import ComponentPhysics from './component-physics.js';
import ComponentHealth from './component-health.js';
import ComponentDestroy from './component-destroy.js';
import ComponentCreate from './component-create.js';
import ComponentPowerup from './component-powerup.js';
import Victor from 'victor';

class EntityBot extends Entity{
    constructor(settings) {
        super();

        this.type = 'bot';
        this.team = settings.team || 'bad';
        this.colour = '#B7429D';

        this.updateFunc = settings.updateFunc || (()=>{return {}});
        this.modules = [];

        for (let i = 0; i < settings.modules.length; i++) {
            this.addModule(settings.modules[i], i);
        }

        this.addComponent(new ComponentCreate(this));
        this.addComponent(new ComponentHealth(50));
        this.addComponent(new ComponentDestroy());
        this.addComponent(new ComponentPhysics(1, 0, 1));
        this.addComponent(new ComponentPosition(settings.px || 0, settings.py || 0, settings.rot || 0));
        this.addComponent(new ComponentMovement());
        this.addComponent(new ComponentCollision('circle', {radius: 25}));
        this.addComponent(new ComponentAppearance([],{}, this.animate.bind(this)));
        this.addComponent(new ComponentUpdate(this.update.bind(this)));
        this.addComponent(new ComponentWorld(this.serializeWRT.bind(this)))
        this.addComponent(new ComponentPowerup());
    }

    animate(entity) {
        if (this.components.create.timeSinceCreation < 3000) {
            let t = this.components.create.timeSinceCreation / 50;
            return {
                objects: [
                    {
                        func: 'strokeCircle',
                        args: [0, 0, (t + 0) % 31],
                    },
                    {
                        func: 'strokeCircle',
                        args: [0, 0, t > 10 ? (t - 10) % 31 : 0],
                    },
                    {
                        func: 'strokeCircle',
                        args: [0, 0, t > 20 ? (t - 20) % 31 : 0],
                    },
                ],
                globalSettings: {
                    strokeStyle: this.colour,
                    shadowColor: this.colour,
                    shadowBlur: 2,
                    lineWidth: 2
                }
            }
        }
        if (this.components.destroy.timeSinceDestroy >= 0) {
            let t = this.components.destroy.timeSinceDestroy / 100;
            let pieces = [];
            for (let i = 0; i < 7; i++) {
                let v = (new Victor(1, 0)).rotate((i * 2 * Math.PI / 7 + (i + 1) * 2 * Math.PI / 7) / 2).multiplyScalar(t);
                pieces.push({
                    func: 'strokeArc',
                    args: [v.x, v.y, 25, i * 2 * Math.PI / 7, (i + 1) * 2 * Math.PI / 7]
                })
            }
            return {
                objects: pieces,
                globalSettings: {
                    strokeStyle: this.colour,
                    shadowColor: this.colour,
                    shadowBlur: 2 + t,
                    lineWidth: 2 - (t / 5),
                }
            }
        }
        return {
            objects: [
                {
                    func: 'strokeCircle',
                    args: [0, 0, 25],
                },
                {
                    func: 'drawLine',
                    args: [0, 0, 25, 0],
                }
            ],
            globalSettings: {
                strokeStyle: this.colour,
                shadowColor: this.colour,
                shadowBlur: 2,
                lineWidth: 2
            },
        }
    }

    addModule(type, position) {
        if (position < 0 || position > this.modules.length) throw 'Module position must be 0 to ' + this.modules.length + '. Position ' + position + 'not allowed';

        this.modules[position] = ModuleFactory.buildModule(type, this.modules, this);
        this.modules = this.modules.slice();
    }

    removeModule(position) {
        if (position < 0 || position > this.modules.length) throw 'Module position must be 0 to ' + this.modules.length + '. Position ' + position + 'not allowed';
        this.modules[position] = ModuleFactory.buildModule('EMPTY', this.modules, this);
    }


    update(ECS, delta) {
        if (this.components.create.timeSinceCreation < 3500) {
            return;
        }

        if (this.components.destroy.timeSinceDestroy > 500) {
            ECS.removeEntity(this);
            return;
        }

        if (this.components.destroy.timeSinceDestroy >= 0) {
            return;
        }

        let world = {bots:[], walls:[], bullets:[], powerups:[]};
        for (let entityId in ECS.entities) {
            if (entityId == this.id) continue;

            let entity = ECS.entities[entityId];
            if (entity.components.world) {
                let s = entity.components.world.serializeWRT(this);
                if (!s) continue;

                switch(entity.type) {
                    case 'bot':
                        world.bots.push(s);
                        break;
                    case 'wall':
                        world.walls.push(s);
                        break;
                    case 'bullet':
                        world.bullets.push(s);
                        break;
                    case 'powerup':
                        world.powerups.push(s);
                        break;
                    default:
                        throw 'Uknown world type: ' + entity.type
                }
            }
        }

        let input = {};
        let outputShell = {};
        for (let module of this.modules) {
            if (module == null) continue;

            if (module.type == 'WORLD') {
                module.bots = world.bots;
                module.walls = world.walls;
                module.bullets = world.bullets;
                module.powerups = world.powerups;
            }

            input[module.name] = module.serialize();
            outputShell[module.name] = {};
        }


        let output = {};
        try {
            output = this.updateFunc(input, outputShell);
        } catch (e) { console.log(e); }

        for (let moduleSettingName in output) {
            let settings = output[moduleSettingName];

            let moduleIndex = this.modules.map((e) => { return e.name; }).indexOf(moduleSettingName);
            if (moduleIndex == -1) continue; //module not found;

            let module = this.modules[moduleIndex];

            if (typeof module.update == 'function')
                module.update(settings, delta, ECS);
        }
    }

    serializeWRT(entity) {
        if (this.team == entity.team) return null;

        let normPos = this.components.position.pos.clone().subtract(entity.components.position.pos).rotate(-entity.components.position.rotation);
        let d = normPos.magnitude();

        let b = -1 * normPos.horizontalAngle();
        if (b > Math.PI || b < -Math.PI) b += Math.sign(b) * 2 * Math.PI;

        let v = this.components.movement.velocity.clone().subtract(this.components.movement.velocity);

        return {
            id: this.id,
            x: normPos.x,
            y: normPos.y,
            distance: d,
            bearing: b,
            vx: v.x,
            vy: v.y,
            shielded: this.components.health.shielded,
            health: this.components.health.health,
            team: this.team,
        };
    }

}
export { EntityBot as default }