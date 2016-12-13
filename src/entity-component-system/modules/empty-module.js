import Module from './module';

class EmptyModule extends Module {

    constructor(name, modules, entity) {
        super(name, modules, entity);

        this.type = 'EMPTY';
    }
}
export { EmptyModule as default }