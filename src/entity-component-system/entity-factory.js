import EntityRoom from './entity-room.js';
import EntityBot from './entity-bot.js';
import EntityPlayerBot from './entity-player-bot.js';
import EntityWall from './entity-wall.js';
import EntitySpeedboost from './entity-speedboost.js';
import EntitySupershield from './entity-supershield.js';
import EntityFirepower from './entity-firepower.js';
import Victor from 'victor';

class EntityFactory {
    static buildEntitiesForLevel(level, bots) {
        bots = bots || [];
        let entities = [new EntityRoom()];
        entities.push(new EntityWall(0,35,640,35)); // up
        entities.push(new EntityWall(605,0,605,480)); // right
        entities.push(new EntityWall(0,445,640,445)); // down
        entities.push(new EntityWall(35,0,35,480)); // left

        let easyFighter = {
            team: 'bad',
            modules: ['MOVE', 'WORLD', 'ATTACK', 'DEFEND', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            updateFunc: function(input, output) {
                output.mm0.moveTowards = input.wm0.bots[0];
                output.mm0.rotateTowards = input.wm0.bots[0];
                output.mm0.movementPower = 10;
                output.mm0.rotationPower = 10;
                output.dm0.shield = true;
                output.am0.shoot = true;
                return output;
            }
        };

        switch (level) {
            case -1:
                break;
            case 1:
                bots.push({
                    modules: ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
                    updateFunc: function(input, output) {
                        return {}
                    }
                });
                break;
            case 2:
                bots.push({
                    modules: ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
                    updateFunc: function(input, output) {
                        return {}
                    }
                });
                bots.push({
                    modules: ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
                    updateFunc: function(input, output) {
                        return {}
                    }
                });
                break;
            case 3:
                bots.push({
                    modules: ['ATTACK', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
                    updateFunc: function(input, output) {
                        output.am0.shoot = true;
                        return output;
                    }
                });
                bots.push(easyFighter);
                break;
            case 4:
                bots.push(easyFighter);
                bots.push(easyFighter);
                bots.push(easyFighter);
                break;
            case 5:
                bots.push(easyFighter);
                bots.push(easyFighter);
                bots.push(easyFighter);
                bots.push(easyFighter);
                bots.push(easyFighter);
                bots.push(easyFighter);
                break;
            default:
                throw 'Level ' + level + ' does not exist'
        }

        for (let i = 0; i < bots.length; i++) {
            let bot = bots[i];

            let r = i * 2*Math.PI/bots.length;
            let p = (new Victor(-1,0)).rotate(r).multiplyScalar(180).add(new Victor(320, 240));
            if (!bot.updateFunc) {
                entities.push(new EntityPlayerBot({
                    px: p.x, py: p.y, rot: r, team: level != -1 ? 'good' : 'team'+i, colour: bot.colour, name: bot.name,
                    modules: bot.modules,
                }, bot.code));
            } else {
                entities.push(new EntityBot({
                    px: p.x, py: p.y, rot: r, team: 'bad', name: bot.name || 'The bad guys',
                    modules: bot.modules,
                    updateFunc: bot.updateFunc
                }))
            }
        }

        return entities;
    }
}
export { EntityFactory as default }