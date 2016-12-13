<template>
    <div class="bb">
        <select v-model="moduleType" v-select="{minimumResultsForSearch: Infinity}">
            <option :selected="moduleType == 'EMPTY'" value="EMPTY">Empty</option>
            <option :selected="moduleType == 'ATTACK'" value="ATTACK">Attack</option>
            <option :selected="moduleType == 'DEFEND'" value="DEFEND">Defend</option>
            <option :selected="moduleType == 'MOVE'" value="MOVE">Movement</option>
            <option :selected="moduleType == 'POWERUP'" value="POWERUP">Powerup</option>
            <option :selected="moduleType == 'WORLD'" value="WORLD">World</option>
            <option :selected="moduleType == 'STATE'" value="STATE">State</option>
        </select>
        <h4>{{moduleName}}<button type="button" class="btn btn-info" data-toggle="modal" data-target="#botBuildModal" @click="showHelp">?</button></h4>
    </div>
</template>

<script>
    export default {
        props: ['module', 'moduleName'],
        data: function() {
            return {
                moduleType: '',
            }
        },
        watch: {
            module: function() {
                this.moduleType = this.module;
            },
            moduleType: function() {
                this.$emit('module-change', this.moduleType);
            }
        },
        methods: {
            showHelp: function() {
                this.$emit('show-help');
            }
        },
        created: function() {
            this.moduleType = this.module;
        }
    }

</script>