class Module {
    constructor(name, modules, entity) {
        this.name = '';
        this.type = 'BASE';
        this.entity = entity;
        this.setName(name || 'DefaultName', modules);
    }

    setName (name, modules) {
        let original = name;
        let count = 0;
        name = original + count;

        let invalid = true;
        while (invalid) {
            invalid = false;
            for (let module of modules) {
                if (module.name == name&& module != this) {
                    name = original + count;
                    count++;
                    invalid = true;
                }
            }
        }
        this.name = name;
    }

    update() {
        // world is built manually
    }

    serialize() {
        return {
            name: this.name
        }
    }
}
export { Module as default }