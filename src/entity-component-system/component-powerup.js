class ComponentPowerup {
    constructor() {
        this.name = 'powerup';

        this.activePowerups = [];
        this.activePowerupOldSettings = [];
        this.powerupUptimes = [];
        this.powerupModules = [];
    }

    addActivePowerUp(powerup, module) {
        this.activePowerups.push(powerup);
        this.activePowerupOldSettings.push(powerup.on(module.entity));
        this.powerupUptimes.push(0);
        this.powerupModules.push(module);
    }

    static get powerups() {
        return {
            'speedboost': {
                name: 'speedboost',
                maxUptime: 10000,
                on: function(entity) {
                    let oldSettings = [];
                    for (let module of entity.modules) {
                        if (module.type == 'MOVE') {
                            oldSettings.push({mm: module.maxMovementPower, mr: module.maxRotationPower});
                            module.maxMovementPower *= 5;
                            module.maxRotationPower *= 5;
                        }
                    }
                    return oldSettings;
                },
                off: function(entity, settings) {
                    for (let module of entity.modules) {
                        if (module.type == 'MOVE') {
                            let s = settings.shift();
                            module.maxMovementPower = s.mm;
                            module.maxRotationPower = s.mr;
                        }
                    }
                }
            },
            'supershield': {
                name: 'supershield',
                maxUptime: 5000,
                on: function(entity) {
                    let oldSettings = [];
                    for (let module of entity.modules) {
                        if (module.type == 'DEFEND') {
                            oldSettings.push({mu: module.shieldMaxUptime});
                            module.shieldUptime = 0;
                            module.shieldCooldown = 0;
                            module.shieldMaxUptime *= 4;
                        }
                    }
                    return oldSettings;
                },
                off: function(entity, settings) {
                    for (let module of entity.modules) {
                        if (module.type == 'DEFEND') {
                            let s = settings.shift();
                            module.shieldMaxUptime = s.mu;
                        }
                    }
                }
            },
            'firepower': {
                name: 'firepower',
                maxUptime: 2000,
                on: function(entity) {
                    let oldSettings = [];
                    for (let module of entity.modules) {
                        if (module.type == 'ATTACK') {
                            oldSettings.push({mc: module.maxCooldown});
                            module.maxCooldown *= 0.5;
                        }
                    }
                    return oldSettings;
                },
                off: function(entity, settings) {
                    for (let module of entity.modules) {
                        if (module.type == 'ATTACK') {
                            let s = settings.shift();
                            module.shieldMaxUptime = s.mc;
                        }
                    }
                }
            }

        }
    }
}
export { ComponentPowerup as default }