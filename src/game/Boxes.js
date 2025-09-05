import { State } from "./state/State";
import { StateMachine } from "./state/StateMachine";

export class Boxes extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, ingredient = "tomato", color = 0xffffff, size = 32){

        if(!scene.textures.exists(color.toString(16))){
            const g = scene.add.graphics();
            g.fillStyle(color, 1);
            g.fillRect(0, 0, size, size);
            g.generateTexture(color.toString(16), size, size);
            g.destroy(); // opcional, liberar memoria
        }

        super(scene, x, y, color.toString(16))
        
        this.scene = scene;
        this.ingredient = ingredient;
        this.size = size;
        this.activeBox = false;
        this.color = color;  //Para pasarselo a los circulos ingredientes temporales
        
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true)
        this.body.setImmovable(true)
        // this.body.moves = false

        this.closestToPlayer = false;
        this.distToPlayer = Infinity;

        this.stateMachine = new StateMachine("idle");
        this.stateMachine.addState("idle", new IdleState());
        this.stateMachine.addState("anim", new AnimationState());
        this.stateMachine.changeState("idle", {box: this});
    }

    update(dt) {
        this.stateMachine.update(dt)
    }

    // devuelve rect del body
    _rectOf(body) {
        return {
        left: body.x,
        right: body.x + body.width,
        top: body.y,
        bottom: body.y + body.height
        };
    }

    // distancia al cuadrado entre dos AABBs (0 si se solapan)
    static distSqAABB(a, b) {
        const dx = Math.max(a.left - b.right, b.left - a.right, 0);
        const dy = Math.max(a.top - b.bottom, b.top - a.bottom, 0);
        return dx * dx + dy * dy;
    }

    // método público para que la escena pregunte la distancia al player
    getDistSqToPlayer(player) {
        if (!player || !player.body) return Infinity;
        const a = this._rectOf(this.body);
        const b = this._rectOf(player.body);
        return Boxes.distSqAABB(a, b);
    }

    markAsClosest(closest, dist){
        this.closestToPlayer = closest;
        this.distToPlayer = dist;

        if(closest){
            console.log("Im the closest at: ", dist);
        }
    }
}

class IdleState extends State {
    init (params){
        this.box = params.box;
    }

    update(dt){
        if(this.box.distToPlayer < 350 && this.box.closestToPlayer){
            this.box.activeBox = true;
            this.box.setTint(0x3399ff)
        } else {
            this.box.activeBox = false;
            this.box.clearTint();
        }
    }

    finish(){

    }
}

class AnimationState extends State {
    init (params){
        this.box = params.box
        this.box.activeBox = false;
        this.box.clearTint();
        this.box.setTint(0xff0000);

        this.elapsed = 0;
        this.duration = 2000;
    }

    update(dt){
        this.elapsed = this.elapsed + dt;
        if(this.elapsed >= this.duration){
            this.box.stateMachine.changeState("idle", {box: this.box})
        }
    }

    finish(){
        if(this.box.distToPlayer < 350 && this.box.closestToPlayer){
            this.box.activeBox = true;
            this.box.setTint(0x3399ff)
        } else {
            this.box.activeBox = false;
            this.box.clearTint();
        }
    }
}