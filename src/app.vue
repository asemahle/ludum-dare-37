<template>
    <div>
        <div style="text-align: center;">
            <h1>Battle Bot Room<button type="button" class="btn btn-info" data-toggle="modal" data-target="#mainModal">?</button></h1>
            <div class="alert alert-info" v-show="!storage && showNoStorageError">
                <strong>Info!</strong>(<a @click="showNoStorageError = false">X</a>)
                <p>Your browser does not have local storage. Saved bots will disappear on page reload.</p>
            </div>
        </div>

        <div style="width: 640px; margin: auto">
            <canvas width="640" height="480" ref="gameCanvas" v-on:player-bot-error="displayError($event.detail)" v-on:win="winlvl"></canvas>
            <div style="display: flex; flex-wrap: wrap; justify-content: space-around;">
                <div style="flex-grow: 2">
                    <h4 class="under-header" style="display: inline-flex">Level: </h4>
                    <select v-model='level'  v-select="options">
                        <optgroup label="Free Play">
                            <option :value="-1"><h3 class="under-header">Free Play (MultiBot Madness!)</h3></option>
                        </optgroup>
                        <optgroup label="Levels">
                            <option :value="1" selected>1 - Sitting Duck</option>
                            <option :value="2">2 - Sitting Ducks</option>
                            <option :value="3">3 - He Shoots</option>
                            <option :value="4">4 - Three Shoots</option>
                            <option :value="5">5 - Six V/s One</option>
                        </optgroup>
                    </select>
                </div>
                <div>
                    <h4 class="under-header" style="display: inline-flex">Load Bot: </h4>
                    <select v-model='selectedBot' v-select>
                        <optgroup label="Use editor">
                            <option :value="-1">None selected</option>
                        </optgroup>
                        <optgroup label="Saved bots">
                            <option v-for="(bot, index) in botlist" :value="index">{{bot.name}}</option>
                        </optgroup>
                    </select>
                </div>
                <div>
                    <button class="btn btn-default" type="submit" v-on:click="onPlay">
                        Play
                    </button>
                </div>
                <div>
                    <button class="btn btn-default" type="submit" v-on:click="onReset">
                        Restart
                    </button>
                </div>

                <div v-if="level == -1">
                    Use this button to add the loaded bot to the fight: <button @click="addFightbot">Add to fight</button>
                    <br>
                    <ul>
                        <li v-for="bot in fightbots">{{bot.name}}</li>
                    </ul>
                    Use this button to clear bots from the fight: <button @click="clearFightbots">Clear bots</button>
                </div>
            </div>

            <codemirror v-model="code" @changed="codeChange" :options="editorOptions" :hint="true" ref="codeEditor"></codemirror>
            <div class="alert alert-danger" v-show="showLastError">
                <strong>Your Bot Threw An Error!</strong>(<a @click="showLastError = false">X</a>)
                <pre>{{JSON.stringify(lastError, null, 2)}}</pre>
            </div>
            <br>
            <bot-builder :colour="colour" :modules="modules" :is-saved="selectedBot != -1" v-on:save-bot="initSave" v-on:update-bot="updateBot" v-on:delete-bot="deleteBot" v-on:cchange="setColor" v-on:get-link="getLink"></bot-builder>
        </div>
        <br> <br> <br> <br> <br> <br> <br>

        <!-- Modal -->
        <div id="mainModal" class="modal fade" role="dialog">
            <div class="modal-dialog">

                <!-- Modal content-->
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">BATTLE BOT ROOM</h4>
                    </div>
                    <div class="modal-body">
                        Use the power of programming to control your bot! Here's some code to get started ;).

                        This code needs the following modules to work:
                        <ul>
                            <li>Attack</li>
                            <li>World</li>
                            <li>Movement</li>
                        </ul>
                        <pre>output.am0.shoot = true;
b = input.wm0.bots[0];
output.mm0.rotateTowards = b;
output.mm0.rotationPower = 3</pre>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
    import EntityComponentSystem from './entity-component-system/entity-component-system.js';
    import EntityPlayerBot from './entity-component-system/entity-player-bot.js';
    import { default as swal } from 'sweetalert2';

    export default {
        name: 'app',
        data () {
            return {
                options: {},
                maxLevel: 1,

                fightbots: [],
                colour: '#B5CF61',

                botlist: [],
                selectedBot: -1,

                storage: true,
                showNoStorageError: false,

                timestep: 33,

                states: ['PAUSED', 'PLAYING'],
                state: 'PAUSED',

                modules: ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],

                showLastError: false,
                lastError: '',

                level: 1,
                code: '',
                editorOptions: {
                    tabSize: 4,
                    styleActiveLine: true,
                    lineNumbers: true,
                    line: true,
                    mode: 'text/javascript',
                    theme: 'solarized light'
                }
            }
        },
        watch: {
            level: function() {
                console.log('saving level');
                if(this.storage) {
                    localStorage.BBOTS_level = JSON.stringify(this.level);
                }
            },
            botlist: function() {
                console.log('saving botlist');
                if(this.storage) {
                    localStorage.BBOTS_botlist = JSON.stringify(this.botlist);
                }
            },
            maxLevel: function(){
                console.log('saving maxLevel');
                if(this.storage) {
                    localStorage.BBOTS_maxLevel = JSON.stringify(this.maxLevel);
                }
            },
            selectedBot: function() {
                if (this.selectedBot == -1) {
                    this.code = '';
                    for (let i = 0; i < this.modules.length; i++) this.modules[i] = 'EMPTY';
                    return;
                }

                let b = this.botlist[this.selectedBot];
                this.colour = b.colour || '#B5CF61';
                this.code = b.code;
                this.modules = b.modules;
            }
        },
        methods: {
            encodeQueryData(data) {
                let ret = [];
                for (let d in data)
                    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
                return ret.join('&');
            },
            getLink: function() {
                let url = window.location.href.split('?')[0];
                let bot = {
                    colour: this.colour,
                    name: name,
                    code: this.code,
                    modules: JSON.stringify(this.modules)
                };
                url += '?' + this.encodeQueryData(bot);
                swal({
                    title: 'Link to bot:',
                    html: '<a target="_blank" href=' + url + '>' + url +'</a>'
                })
            },
            addFightbot:function() {
                let name = 'unnamed';
                if (this.selectedBot > -1) {
                    name = this.botlist[this.selectedBot].name;
                }

                this.fightbots.push({
                    colour: this.colour,
                    name: name,
                    code: this.code,
                    modules: this.modules
                })
            },
            clearFightbots: function() {
                this.fightbots = [];
            },
            codeChange: function(arg) {
                this.code = arg;
                if(this.state = 'PAUSED') {
                }
            },
            onPlay: function() {
                if (this.state == 'PLAYING') return;
                this.onReset();
                this.state = 'PLAYING';
            },
            onReset: function() {
                this.state = 'PAUSED';
                if (this.level != -1){
                    this.ECS.setLevel(this.level, [{colour: this.colour, name: this.name, modules: this.modules, code: this.code}]);
                }else {
                    this.ECS.setLevel(this.level, this.fightbots);
                }
                this.ECS.update(33);
                this.ECS.update(33);
            },
            gameLoop: function(prevTime) {
               setInterval(() => { this.update(this.timestep); }, this.timestep);
            },
            update: function(delta) {
                switch (this.state) {
                    case 'PAUSED':
                        this.ECS.update(0);
                        break;
                    case 'PLAYING':
                        this.ECS.update(delta);
                        break;
                    default:
                        throw 'State does not exist: ' + this.state;
                }
            },
            displayError(err) {
                this.lastError = err;
                this.showLastError = true;
            },
            deleteBot() {
                if (this.botlist[this.selectedBot] == null) console.warn('could not delete bot');

                let name = this.botlist[this.selectedBot].name;
                this.botlist.splice(this.selectedBot, 1);
                this.selectedBot = -1;
                swal({
                    title: name + ' deleted!'
                });

            },
            setColor(c) {
                this.colour = c;
            },
            updateBot() {
                if (this.botlist[this.selectedBot] == null) console.warn('could not update bot');

                let name = this.botlist[this.selectedBot].name;
                this.$set(this.botlist, this.selectedBot, {name: name, code: this.code, modules: this.modules});
                swal({
                    title: name + ' updated!'
                });
            },
            initSave() {
                let _this = this;
                swal({
                    title: 'Bot Name',
                    input: 'text',
                    showCancelButton: true,
                    inputValidator: function (value) {
                        return new Promise(function (resolve, reject) {
                            if (value) {
                                resolve()
                            } else {
                                reject('You need to write a name!')
                            }
                        })
                    }
                }).then(function (result) {
                    let name = _this.save(result);
                    swal({
                        type: 'success',
                        html: 'Bot Saved As: ' + name
                    })
                })
            },
            save(name) {
                let o = name;
                let prefix = 1;
                let valid = false;
                while(!valid) {
                    valid = true;
                    for (let bot of this.botlist) {
                        if (bot.name == name) {
                            prefix++;
                            name = o + '_' + prefix;
                            valid = false;
                            break;
                        }
                    }
                }

                this.botlist.unshift({
                    colour: this.colour,
                    name: name,
                    code: this.code,
                    modules: this.modules
                });
                this.selectedBot = 0;
                return name;
            },
            winlvl() {
                if (this.level == this.maxLevel) {
                    this.maxLevel++;
                    this.options = {};
                }
            },
            getParameterByName(name, url) {
                if (!url) {
                    url = window.location.href;
                }
                name = name.replace(/[\[\]]/g, "\\$&");
                var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                    results = regex.exec(url);
                if (!results) return null;
                if (!results[2]) return '';
                return decodeURIComponent(results[2].replace(/\+/g, " "));
            }
        },
        created: function() {
            if(typeof(Storage) == "undefined") {
                this.storage = false;
                this.showNoStorageError = true;
            } else {
                this.botlist = [];
                this.level = 1;
                this.maxLevel = 1;

                try{ this.botlist = JSON.parse(localStorage.BBOTS_botlist); } catch (e) { console.log('Failed to parse botlist', localStorage.BBOTS_botlist);}
                try{ this.level = JSON.parse(localStorage.BBOTS_level); } catch (e) { console.log('Failed to parse level', localStorage.BBOTS_level );}
                try{ this.maxLevel = JSON.parse(localStorage.BBOTS_maxLevel); } catch (e) { console.log('Failed to parse maxLevel', localStorage.BBOTS_maxLevel);}

                if (!Object.prototype.toString.call( this.botlist ) === '[object Array]') {
                    console.log('Botlist should be an array!', this.botlist, Object.prototype.toString.call( this.botlist ));
                    this.botlist = [];
                }
            }
        },
        mounted: function() {
            this.name = this.getParameterByName('name') || this.name;
            this.code = this.getParameterByName('code') || this.code;
            this.colour = this.getParameterByName('colour') || this.colour;
            this.modules = JSON.parse(this.getParameterByName('modules')) || this.modules;

            let canvas = this.$refs.gameCanvas;
            this.ECS = new EntityComponentSystem(canvas.getContext('2d'));
            this.onReset();

            this.gameLoop();
        }
    }
</script>
