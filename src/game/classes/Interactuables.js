export class Interactuables extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey, size = 32, index = null) {
        super(scene, x, y, textureKey, index);

        this.scene = scene;
        this.size = size;
        this.activeBox = false; // seleccionado/activo
        this.activeBox2 = false; // seleccionado/activo
        this.highlighted = false;
        this.closestToPlayer = false;
        this.distToPlayer = Infinity;
        this.distForActivation = 15;

        this.fx = this.preFX.addColorMatrix();
        this.fx2 = this.preFX.addColorMatrix();

        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    // rect del body (AABB)
    _rectOf(body) {
        return {
            left: body.x,
            right: body.x + body.width,
            top: body.y,
            bottom: body.y + body.height
        };
    }

    static distSqAABB(a, b) {
        const dx = Math.max(a.left - b.right, b.left - a.right, 0);
        const dy = Math.max(a.top - b.bottom, b.top - a.bottom, 0);
        return dx * dx + dy * dy;
    }

    getDistSqToPlayer(player) {
        if (!player || !player.body) return Infinity;
        const a = this._rectOf(this.body);
        const b = this._rectOf(player.body);
        return Interactuables.distSqAABB(a, b);
    }

    markAsClosest(closest, dist, playerID) {
        const active = dist < this.distForActivation * this.distForActivation && closest;

        if (playerID === 1) {
            this.activeBox = active;
        } else if (playerID === 2) {
            this.activeBox2 = active;
        }

        // highlight visual: solo si alguno de los dos la tiene activa
        if (this.activeBox || this.activeBox2) {
            if (!this.highlighted) {
                this.fx.brightness(1.1);
                this.highlighted = true;
                if (this.texture.key === "asador") {
                    this.fx2.saturate(1.5);
                }
            }
        } else {
            this.fx.brightness(1);
            this.fx2.saturate(0);
            this.highlighted = false;
        }
    }

    onInteract() { }

    update(dt) { }
}