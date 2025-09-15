export class Boxes extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey, size = 32) {
    super(scene, x, y, textureKey);

    this.scene = scene;
    this.size = size;
    this.activeBox = false; // seleccionado/activo
    this.closestToPlayer = false;
    this.distToPlayer = Infinity;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCollideWorldBounds(true);
    this.body.setImmovable(true);
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
        return Boxes.distSqAABB(a, b);
    }

    markAsClosest(closest, dist) {
        this.closestToPlayer = closest;
        this.distToPlayer = dist;

        if(this.distToPlayer < 25*25 && this.closestToPlayer){
            this.activeBox = true;
            this.setTint(0x3399ff);
        } else {
            this.activeBox = false;
            this.clearTint();
        }
    }

    onInteract(){}

    update(dt) {}
}