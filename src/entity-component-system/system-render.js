class SystemRender {
    run(ECS) {
        ECS.ctx.clearRect(0, 0, ECS.ctx.canvas.width, ECS.ctx.canvas.height);

        for (let entityId in ECS.entities) {
            let entity = ECS.entities[entityId];
            if (entity.components.appearance && entity.components.position) {
                this.render(entity, ECS.ctx);
            }
        }
    }

    render(entity, ctx) {
        ctx.save();

        ctx.translate(entity.components.position.pos.x, entity.components.position.pos.y);
        ctx.rotate(entity.components.position.rotation);

        let animationResults = entity.components.appearance.animate(entity) || {};
        let globalSettings = animationResults.globalSettings || entity.components.appearance.globalSettings;
        let objects = animationResults.objects ||  entity.components.appearance.objects;

        for(let setting in globalSettings) {
            ctx[setting] = globalSettings[setting];
        }

        for(let object of objects) {
            ctx.save();

            for(let setting in object.settings) {
                ctx[setting] = object.settings[setting];
            }

            ctx[object.func](...object.args);

            ctx.restore();
        }

        ctx.restore();
    }
}
export { SystemRender as default }