import Victor from 'victor';
import EntityBullet from './entity-bullet.js'

class SystemUpdate {
    constructor() {
        this.handledCollisions = {};
    }

    run(ECS, delta) {
        if (ECS.gameOver) return;

        this.handledCollisions = {};
        for (let entityId in ECS.entities) {
            this.handledCollisions[entityId] = [];
        }

        for (let entityId in ECS.entities) {
            let entity = ECS.entities[entityId];
            if (entity.components.update) {
                this.update(entity, ECS, delta);
            }
        }
    }

    update(entity, ECS, delta) {
        // controller updates
        if (typeof entity.components.update.update == 'function') {
            entity.components.update.update(ECS, delta);
        }

        // collisions
        if (entity.type == 'bot' && entity.components.collision && entity.components.physics && entity.components.position && entity.components.movement) {
            for (let entityId in ECS.entities) {
                if (entityId == entity.id) continue;

                let other = ECS.entities[entityId];

                if (other.components.collision && other.components.physics && this.handledCollisions[entity.id].indexOf(other.id) == -1) {
                    let type = entity.components.collision.type + '-' + other.components.collision.type;
                    switch(type) {
                        case 'circle-circle':
                            this.handleCircleCircleCollision(entity, other);
                            break;
                        case 'circle-line':
                            this.handleCircleLineCollision(entity, other);
                            break;
                        case 'line-line':
                        case 'line-circle':
                            break;
                        default:
                            throw 'The update system does not know how to handle a ' + type + ' collision';
                    }

                    this.handledCollisions[entity.id].push(other.id);
                    this.handledCollisions[other.id].push(entity.id);
                }
            }
        }

        // apply movement
        if (entity.components.movement && entity.components.position && entity.components.physics) {
            let m = entity.components.physics.mass;

            //position
            entity.components.movement.velocity.add(entity.components.movement.acceleration.clone().multiplyScalar(delta/(1000 * m)));
            entity.components.position.pos.add(entity.components.movement.velocity.clone().multiplyScalar(delta/(1000 * m)));
        }

        // death XO
        if (entity.components.destroy && entity.components.health && entity.components.health.health <= 0) {
            entity.components.destroy.destroy(ECS);
        }

        // bulletdeath
        if (entity.constructor.name == 'EntityBullet' && (
            entity.components.position.pos.x < -50 ||
            entity.components.position.pos.x > 690 ||
            entity.components.position.pos.y < -50 ||
            entity.components.position.pos.y > 530)
        ) {
            entity.components.destroy.destroy(ECS);
        }

        //create
        if (entity.components.create) {
            entity.components.create.timeSinceCreation += delta;
        }

        //destroy
        if (entity.components.destroy && entity.components.destroy.timeSinceDestroy >=0){
            entity.components.destroy.timeSinceDestroy += delta;
        }

        //powerup
        if (entity.components.powerup) {
            let powerups = entity.components.powerup.activePowerups;
            for (let i = 0; i < powerups.length; i++) {
                entity.components.powerup.powerupUptimes[i] += delta;

                if (entity.components.powerup.powerupUptimes[i] > powerups[i].maxUptime) {
                    powerups[i].off(entity, entity.components.powerup.activePowerupOldSettings[i]);
                    entity.components.powerup.powerupModules[i].removePowerup();

                    powerups.splice(i, 1);
                    entity.components.powerup.activePowerupOldSettings.splice(i, 1);
                    entity.components.powerup.powerupUptimes.splice(i, 1);
                    entity.components.powerup.powerupModules.splice(i, 1);

                    i--;
                }
            }
        }
    }

    handleCircleCircleCollision(c1, c2) {
        let a = c1.components.collision.radius + c2.components.collision.radius;
        let x = c1.components.position.pos.x - c2.components.position.pos.x;
        let y = c1.components.position.pos.y - c2.components.position.pos.y;

        let colliding = (a > Math.sqrt( (x*x) + (y*y) ));

        if (colliding) {
            if (c2.type == 'powerup') {
                for (let module of c1.modules) {
                    if (module.type == 'POWERUP' && module.hasPowerup == false) {
                        module.setPowerup(c2.subtype);
                        c2.components.destroy.destroy();
                    }
                }
            } else {
                let normal = c1.components.position.pos.clone().subtract(c2.components.position.pos).normalize();
                let tangent = new Victor(-normal.y, normal.x);

                this.bounce(normal, tangent, c1, c2);
                // let nt_com = nt_v1.clone().multiplyScalar(m1).add(nt_v2.clone().multiplyScalar(m2)).divideScalar(totalMass); // center of mass velocity
            }
        }
    }

    handleCircleLineCollision(c, l) {
        let lx = l.components.position.pos.x;
        let ly = l.components.position.pos.y;
        let intersections = this.getIntersections(
            [lx + l.components.collision.x1, ly + l.components.collision.y1],
            [lx + l.components.collision.x2, ly + l.components.collision.y2],
            [c.components.position.pos.x, c.components.position.pos.y, c.components.collision.radius]);

        if (intersections.points && (intersections.points.intersection1.onLine || intersections.points.intersection2.onLine)) {
            if (l.constructor == EntityBullet) {
                if (l.components.damage.team != c.team && c.components.health) {
                    c.components.health.damage(l.components.damage.damage);
                    l.components.health.health = 0;
                }

                return;
            }

            let p1 = new Victor(intersections.points.intersection1.coords[0], intersections.points.intersection1.coords[1]);
            let p2 = new Victor(intersections.points.intersection2.coords[0], intersections.points.intersection2.coords[1]);

            let tangent = p1.clone().subtract(p2).normalize();
            let normal = new Victor(-tangent.y, tangent.x);

            this.bounce(normal, tangent, c, l, true);
        }
    }

    bounce(xy_normal, xy_tangent, c1, c2, alwaysCollide) {
        let v1 = c1.components.movement ? c1.components.movement.velocity : new Victor(0, 0);
        let v2 = c2.components.movement ? c2.components.movement.velocity : new Victor(0, 0);

        let nt_x = new Victor(xy_normal.x, xy_tangent.x);
        let nt_y = new Victor(xy_normal.y, xy_tangent.y);

        let nt_v1 = new Victor(v1.dot(xy_normal), v1.dot(xy_tangent));
        let nt_v2 = new Victor(v2.dot(xy_normal), v2.dot(xy_tangent));

        let cr = 1 - Math.sqrt((1 - c1.components.physics.restitution) * (1 - c2.components.physics.restitution));
        let m1 = c1.components.physics.mass;
        let m2 = c2.components.physics.mass;
        let totalMass = m1 + m2;


        if (nt_v1.x - nt_v2.x < 0 || alwaysCollide) { //collision is possible (items are approaching)
            let nt_newV1 = new Victor((m1*nt_v1.x + m2*nt_v2.x + m2*cr*(nt_v2.x - nt_v1.x))/totalMass , nt_v1.y);
            let nt_newV2 = new Victor((m1*nt_v1.x + m2*nt_v2.x + m1*cr*(nt_v1.x - nt_v2.x))/totalMass, nt_v2.y);

            v1 = new Victor(nt_newV1.dot(nt_x), nt_newV1.dot(nt_y));
            v2 = new Victor(nt_newV2.dot(nt_x), nt_newV2.dot(nt_y));

            if (c1.components.movement) {
                c1.components.movement.velocity = v1;
                c1.components.movement.acceleration = new Victor(0, 0);
            }
            if (c2.components.movement) {
                c2.components.movement.velocity = v2;
                c2.components.movement.acceleration = new Victor(0, 0);
            }
        }
    }


    // line circle. a=>startpoint, b=>endpoint, c=>circle
    getIntersections(a, b, c) {
        // Calculate the euclidean distance between a & b
        let eDistAtoB = Math.sqrt( Math.pow(b[0]-a[0], 2) + Math.pow(b[1]-a[1], 2) );

        // compute the direction vector d from a to b
        let d = [ (b[0]-a[0])/eDistAtoB, (b[1]-a[1])/eDistAtoB ];

        // Now the line equation is x = dx*t + ax, y = dy*t + ay with 0 <= t <= 1.

        // compute the value t of the closest point to the circle center (cx, cy)
        let t = (d[0] * (c[0]-a[0])) + (d[1] * (c[1]-a[1]));

        // compute the coordinates of the point e on line and closest to c
        let e = {coords:[], onLine:false};
        e.coords[0] = (t * d[0]) + a[0];
        e.coords[1] = (t * d[1]) + a[1];

        // Calculate the euclidean distance between c & e
        let eDistCtoE = Math.sqrt( Math.pow(e.coords[0]-c[0], 2) + Math.pow(e.coords[1]-c[1], 2) );

        // test if the line intersects the circle
        if( eDistCtoE < c[2] ) {
            // compute distance from t to circle intersection point
            let dt = Math.sqrt( Math.pow(c[2], 2) - Math.pow(eDistCtoE, 2));

            // compute first intersection point
            let f = {coords:[], onLine:false};
            f.coords[0] = ((t-dt) * d[0]) + a[0];
            f.coords[1] = ((t-dt) * d[1]) + a[1];
            // check if f lies on the line
            f.onLine = this.is_on(a,b,f.coords);

            // compute second intersection point
            let g = {coords:[], onLine:false};
            g.coords[0] = ((t+dt) * d[0]) + a[0];
            g.coords[1] = ((t+dt) * d[1]) + a[1];
            // check if g lies on the line
            g.onLine = this.is_on(a,b,g.coords);

            return {points: {intersection1:f, intersection2:g}, pointOnLine: e};

        } else if (parseInt(eDistCtoE) === parseInt(c[2])) {
            // console.log("Only one intersection");
            return {points: false, pointOnLine: e};
        } else {
            // console.log("No intersection");
            return {points: false, pointOnLine: e};
        }
    }
    distance(a,b) {
        return Math.sqrt( Math.pow(a[0]-b[0], 2) + Math.pow(a[1]-b[1], 2) )
    }
    is_on(a, b, c) {
        return this.distance(a,c) + this.distance(c,b) == this.distance(a,b);
    }

    getAngles(a, b, c) {
        // calculate the angle between ab and ac
        let angleAB = Math.atan2( b[1] - a[1], b[0] - a[0] );
        let angleAC = Math.atan2( c[1] - a[1], c[0] - a[0] );
        let angleBC = Math.atan2( b[1] - c[1], b[0] - c[0] );
        let angleA = Math.abs((angleAB - angleAC) * (180/Math.PI));
        let angleB = Math.abs((angleAB - angleBC) * (180/Math.PI));
        return [angleA, angleB];
    }
}
export { SystemUpdate as default }