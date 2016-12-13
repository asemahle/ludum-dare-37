import Module from './module';
import Victor from 'victor';

class MoveModule extends Module {

    constructor(name, modules, entity) {
        super(name, modules, entity);

        this.type = 'MOVE';
        this.maxMovementPower = 10;
        this.maxRotationPower = Math.PI/2;
    }

    update(settings, delta) {
        // { name: string, moveTowards: {}, rotateTowards: {}, movementPower: number, rotationPower: number }
        settings = settings || {};

        let moveTowards = settings.moveTowards || null;
        let movementPower = settings.movementPower || 0;
        movementPower = Math.min(this.maxMovementPower, Math.max(0, movementPower));

        let rotateTowards = settings.rotateTowards || null;
        let rotationPower = settings.rotationPower || 0;
        rotationPower = Math.min(this.maxRotationPower, Math.max(0, rotationPower));

        if (this.entity.components.movement && this.entity.components.position && this.entity.components.physics) {
            let mass = this.entity.components.physics.mass;

            if (moveTowards != null) {
                let nt_goal = new Victor(moveTowards.x, moveTowards.y);

                let nt_x = new Victor(1, 0).rotate(-this.entity.components.position.rotation);
                let nt_y = new Victor(0, 1).rotate(-this.entity.components.position.rotation);

                let xy_goal = new Victor(nt_goal.dot(nt_x), nt_goal.dot(nt_y));

                let dir = xy_goal.clone().normalize();

                let deltaV = dir.multiplyScalar(movementPower * delta / (1000 * mass));
                this.entity.components.movement.velocity.add(deltaV);
            }

            if (rotateTowards != null) {
                let goal = new Victor(rotateTowards.x, rotateTowards.y);

                let maxRotation = rotationPower * delta / 1000;
                let angle = goal.horizontalAngle();

                if (Math.abs(angle) < maxRotation) {
                    this.entity.components.position.rotation += angle;
                } else {
                    this.entity.components.position.rotation += maxRotation*Math.sign(angle);
                }
            }
        }

        // settings.power = settings.power || 0;
        // settings.rotation = settings.rotation || 0;
        //
        // if (this.entity.components.movement && this.entity.components.position) {
        //     let accel = new Victor(1,0);
        //     accel.rotate(this.entity.components.position.rotation);
        //     accel.multiplyScalar(settings.power * (delta/1000));
        //     this.entity.components.movement.acceleration.add(accel);
        //
        //     this.entity.components.movement.racceleration += settings.rotation * (delta/1000);
        // }
    }
}
export { MoveModule as default }