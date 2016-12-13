import Vue from 'vue';
import App from './app.vue';
import BotBuilder from './bot-builder.vue';
import Module from './module.vue';
import CodeMirror from 'vue-codemirror';
import select2 from 'select2';
import {default as $} from 'jquery';
import { Chrome, Material } from 'vue-color'

// Canvas hacks
CanvasRenderingContext2D.prototype.strokeRoundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y,   x+w, y+h, r);
    this.arcTo(x+w, y+h, x,   y+h, r);
    this.arcTo(x,   y+h, x,   y,   r);
    this.arcTo(x,   y,   x+w, y,   r);
    this.closePath();
    this.stroke();
};
CanvasRenderingContext2D.prototype.drawLine = function (x1, y1, x2, y2) {
    this.beginPath();
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.stroke();
};
CanvasRenderingContext2D.prototype.strokeCircle = function (x, y, r) {
    this.beginPath();
    this.arc(x, y, r, 0, 2*Math.PI);
    this.stroke();
};
CanvasRenderingContext2D.prototype.strokeArc = function (x, y, r, s, e) {
    this.beginPath();
    this.arc(x, y, r, s, e);
    this.stroke();
};
CanvasRenderingContext2D.prototype.rotateRect = function (x, y, w, h, r) {
    this.rotate(r);
    this.strokeRect(x,y,w,h);
    this.rotate(-r);
};
CanvasRenderingContext2D.prototype.multiLine = function (ps, closePath) {
    this.beginPath();
    this.moveTo(ps[0][0], ps[0][1]);
    for (let i = 1; i < ps.length; i++) {
        this.lineTo(ps[i][0],ps[i][1]);
    }
    if (closePath) this.closePath();
    this.stroke();
};

// Directive for select2
function updateFunction (el, binding) {
    // get options from binding value.
    // v-select="THIS-IS-THE-BINDING-VALUE"
    let options = binding.value || {};

    // set up select2
    $(el).select2(options).on("select2:select", (e) => {
        // v-model looks for
        //  - an event named "change"
        //  - a value with property path "$event.target.value"
        el.dispatchEvent(new Event('change', { target: e.target }));
    });
}
Vue.directive('select', {
    inserted: updateFunction ,
    componentUpdated: updateFunction,
});




// the stuff that should be in here...
Vue.use(CodeMirror);
Vue.component('bot-builder', BotBuilder);
Vue.component('module', Module);
Vue.component('chrome-picker', Chrome);
Vue.component('material-picker', Material);

new Vue({
    el: '#app',
    render: h => h(App)
});
