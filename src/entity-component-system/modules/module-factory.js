import Module from './module.js';
import AttackModule from './attack-module.js';
import DefendModule from './defend-module.js';
import MoveModule from './move-module.js';
import WorldModule from './world-module.js';
import StateModule from './state-module.js';
import EmptyModule from './empty-module.js';
import PowerupModule from './powerup-module.js';

class ModuleFactory {
    static buildModule(type, modules, entity) {
        let module = null;
        switch(type) {
            case 'ATTACK':
                module = new AttackModule('am', modules, entity);
                break;
            case 'DEFEND':
                module = new DefendModule('dm', modules, entity);
                break;
            case 'MOVE':
                module = new MoveModule('mm', modules, entity);
                break;
            case 'POWERUP':
                module = new PowerupModule('pm', modules, entity);
                break;
            case 'WORLD':
                module = new WorldModule('wm', modules, entity);
                break;
            case 'STATE':
                module = new StateModule('sm', modules, entity);
                break;
            case 'EMPTY':
                module = new EmptyModule('em', modules, entity);
                break;
            default:
                throw 'Module type ' + type + ' does not exist. Must be in ' + JSON.stringify(Module.types);
        }
        return module;
    }
}
export { ModuleFactory as default }