import EntityBot from './entity-bot.js';
import ComponentAppearance from './component-appearance.js';

class EntityPlayerBot extends EntityBot{
    constructor(settings, code) {
        super(settings);
        this.subtype = 'player';
        this.$canvas = $('canvas')[0];
        this.lastError = null;
        this.team = settings.team || 'good';
        this.output = {};
        this.working = false;
        this.colour = settings.colour || '#B5CF61';
        this.name = settings.name || 'Unnamed';

        // Build a worker from an anonymous function body
        let blobURL = URL.createObjectURL(
            new Blob(['onmessage = function(e) {if (e==null || e.data==null){postMessage([{},null]); return;} var err = null; var input = e.data[0]; var output = e.data[1]; try { ' + code + ' } catch(error) { err = error.message; } postMessage([output,err])}']),
            { type: 'application/javascript' }
        );

        this.worker = new Worker( blobURL );
        this.worker.onmessage = ((e) => {
            if (e.data[1] != null && e.data[1] != this.lastError) {
                this.lastError =  e.data[1];
                let event = new CustomEvent('player-bot-error', { 'detail': this.lastError });
                this.$canvas.dispatchEvent(event);
            }
            this.output = e.data[0];
            this.working = false;
        });

        // Won't be needing this anymore
        URL.revokeObjectURL( blobURL );


        this.updateFunc = this.runWorker;
    }

    runWorker(input, output) {
        if (!this.working) {
            this.working = true;
            this.worker.postMessage([input, output]);
        }

        return this.output;
    }

    teardown() {
        this.worker.terminate();
    }
}
export { EntityPlayerBot as default }