<template>
    <div>
        <table class="bot-builder-table">
            <tr>
                <td v-for="index in 3">
                    <module :module="modules[index-1]" :module-name="names[index-1]" v-on:show-help="showHelp(index-1, names[index-1])" v-on:module-change="moduleChange(arguments[0], index-1)"></module>
                </td>
                <td rowspan="3">
                    <button class="btn btn-default" type="submit" v-on:click="saveBot">
                        {{isSaved ? 'Save As' : 'Save Bot'}}
                    </button>
                    <button class="btn btn-default" type="submit" v-on:click="updateBot" :disabled="!isSaved">
                        Update Bot
                    </button>
                    <button class="btn btn-default" type="submit" v-on:click="getLink">
                        Get Link
                    </button>
                    <br>
                    <button class="btn btn-danger" type="submit" v-on:click="deleteBot" :disabled="!isSaved" style="width: 80%; margin-top: 80px">
                        Delete Bot
                    </button>
                </td>
            </tr>
            <tr>
                <td>
                    <module :module="modules[3]" :module-name="names[3]"  v-on:show-help="showHelp(3, names[3])" v-on:module-change="moduleChange(arguments[0], 3)"></module>
                </td>
                <td style="height: 200px">
                    <material-picker v-model="colours" @change-color="onChange" style="margin:auto"></material-picker>
                </td>
                <td>
                    <module :module="modules[4]" :module-name="names[4]"  v-on:show-help="showHelp(4, names[4])" v-on:module-change="moduleChange(arguments[0], 4)"></module>
                </td>
            </tr>
            <tr>
                <td v-for="index in 3">
                    <module :module="modules[index+4]" :module-name="names[index+4]"  v-on:show-help="showHelp(index+4, names[index+4])" v-on:module-change="moduleChange(arguments[0], index+4)"></module>
                </td>
            </tr>
        </table>

        <!-- Modal -->
        <div id="botBuildModal" class="modal fade" role="dialog">
            <div class="modal-dialog">

                <!-- Modal content-->
                <div class="modal-content" v-if="selectedType != null">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">{{help[selectedType].header}}</h4>
                    </div>
                    <div class="modal-body">
                        <p>{{help[selectedType].text}}</p>

                        <div v-if="selectedType == 'POWERUP'">
                            <p>The speedboost powerup increases the movementPower.</p>
                            <p>The firepower powerup reduces cooldown.</p>
                            <p>The supershield powerup increases shieldUptime.</p>
                            <br>
                            <strong>Tip: </strong>    <p>Use multiple powerup modules to see effects stack!</p>
                            <strong>Note: </strong>    <p>You will not pickup powerups if all your powerup modules are full!</p>
                        </div>

                        <p>input.{{selectedName}} looks like:</p>
                        <pre>{{JSON.stringify(help[selectedType].input, null, 2)}}</pre>
                        <p>output.{{selectedName}} looks like:</p>
                        <pre>{{JSON.stringify(help[selectedType].output, null, 2)}}</pre>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>

            </div>
    </div>
</template>

<script>
    export default {
        props: ['modules', 'isSaved', 'colour'],
        data: function() {
            return {
                selectedType: null,
                selectedName: null,
                help: {
                    EMPTY:{
                        header: 'The Empty Module',
                        text: 'This module doesn\'t do anything. Try selecting a different module!',
                        input: {},
                        output: {},
                    },
                    ATTACK:{
                        header: 'The Attack Module',
                        text: 'Use this module to shoot bullets! Bullets damage other bots. Your bot shoots in the forward direction',
                        input: { cooldown: 'number  - # of milliseconds until you can shoot again' },
                        output: { shoot: 'boolean  - if true, the module will try to shoot a bullet'}
                    },
                    DEFEND:{
                        header: 'The Defend Module',
                        text: 'Use this module to defend yourself from attacks. Careful! Shields won\'t stay up forever and have a long cooldown.',
                        input: { shieldIsUp: 'boolean  - true is shield is up', shieldCooldown: 'number  - # of milliseconds until a new shield can be made', shieldUptime: 'number  - # of milliseconds the current shield has been up'},
                        output: { shield: 'boolean  - if true, the module will try to create a shield'}
                    },
                    MOVE:{
                        header: 'The Move Module',
                        text: 'Use this module to go places. BE AWARE! Directions are relative to your bot. Moving towards { x: 1, y: 0 } will always go STRAIGHT.',
                        input: {},
                        output: {
                            moveTowards: '{x: number, y: number}  - your bot will try to drive in this direction',
                            movementPower: 'number  - movement power is clamped between 0 and 10. 0 is nothing, 10 is max',
                            rotateTowards: 'number  - your bot will rotate in this direction.',
                            rotationPower: 'number  - rotation power is clamped between 0 and Math.PI/2'
                        }
                    },
                    POWERUP:{
                        header: 'The Powerup Module',
                        text: 'Use this module to collect powerups. Each powerup module can only hold one powerup at a time.',
                        input: { hasPowerup: 'boolean  - true if the module has a powerup', powerup: 'string  - Either \'none\', \'speedboost\', \'firepower\', or \'supershield\'', powerUpIsActive: 'boolean  - true if the module has a powerup and it has been activated' },
                        output: {
                            activate: 'boolean  - if true, the powerup will be activated.'
                        }
                    },
                    WORLD:{
                        header: 'The World Module',
                        text: 'Use this module to find out where other objects are in the world. Remember: everything is relative to you! Note: each input is an array. For example: input.wm0.bots[0].x would access the x coordinate of the first bot.',
                        input: {
                            bots: {
                                DESCRIPTION: 'A list of all the bots. You are exluded.',
                                id: 'string  - unique identifier specific to this bot',
                                x: 'number  - x-coordinate relative to you',
                                y: 'number  - y-coordinate relative to you',
                                distance: 'number  - distance away from you (center to center)',
                                bearing: 'number  - # of radians you need to rotate to face the bot (signed)',
                                vx: 'number  - x-velocity with respect to you',
                                vy: 'number  - y-velocity with respect to you',
                                shielded: 'boolean  - true if shields are up',
                                health: 'number  - amt of health left',
                                team: 'string  - the bot\'s team'
                            },
                            walls: {
                                DESCRIPTION: 'A list of all the walls. There are always 4.',
                                x: 'number  - x-coordinate of the point on the wall closes to you',
                                y: 'number  - y-coordinate of the point on the wall closes to you',
                                distance: 'number  - distance away from you (center to closest point on wall)',
                                bearing: 'number  - # of radians you need to rotate to face the wall (signed)',
                            },
                            bullets: {
                                DESCRIPTION: 'A list of all enemy bullets. Bullets shot by you (or your team) are not included.',
                                x: 'number  - x-coordinate relative to you',
                                y: 'number  - y-coordinate relative to you',
                                distance: 'number  - distance away from you (center to front part of bullet)',
                                bearing: 'number  - # of radians you need to rotate to face the bullet (signed)',
                                vx: 'number  - x-velocity with respect to you',
                                vy: 'number  - y-velocity with respect to you',
                            },
                            powerups: {
                                DESCRIPTION: 'A list of all the uncollected powerups on the screen',
                                type: 'string  - The powerup type. Either \'speedboost\', \'firepower\', or \'supershield\'',
                                x: 'number  - x-coordinate relative to you',
                                y: 'number  - y-coordinate relative to you',
                                distance: 'number  - distance away from you (center to front part of bullet)',
                                bearing: 'number  - # of radians you need to rotate to face the bullet (signed)',
                            }
                        },
                        output: {}
                    },
                    STATE:{
                        header: 'The State Module',
                        text: 'Use this to store values. You can only store numbers, booleans, or strings with length <= 100',
                        input: {
                            state: 'array[5]  - An array with 5 slots. The array contains whatever you put in it last time. All values start as null.'
                        },
                        output: {
                            state: 'array[5]  - Fill with up to 5 values to get next time. Objects will be set to null, and strings with length > 100 will be truncated.'
                        }
                    },
                }
            }
        },
        computed: {
            colours: function() {
                return {hex: this.colour};
            },
            names: function() {
                let names = [];
                for (let module of this.modules) {
                    if (!module) continue;
                    let name = module[0].toLowerCase() + 'm';
                    names.push(name);
                }

                let pos = names.length -1;
                for (let name of names.slice().reverse()) {
                    names[pos] = names[pos] + (names.filter((e) => { return e == name; }).length - 1);
                    pos--;
                }

                return names;
            }
        },
        methods: {
            moduleChange(type, moduleIndex) {
                this.$set(this.modules, moduleIndex, type);
            },
            saveBot(){
                this.$emit('save-bot');
            },
            updateBot(){
                this.$emit('update-bot');
            },
            deleteBot(){
                this.$emit('delete-bot');
            },
            showHelp(index, name){
                this.selectedType = this.modules[index];
                this.selectedName = name;
            },
            onChange(e) {
                this.$emit('cchange', e.hex);
            },
            getLink() {
                this.$emit('get-link');
            }
        }
    }
</script>

<style>
    .bot-builder-table {
        width: 100%;
    }

    .bot-builder-table td {
        text-align: center;
        height: 100px;
        background-color: #A29CAC;
    }
</style>