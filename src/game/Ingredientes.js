import { State } from "./state/State";

export class Ingredientes extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, kind = "tomato", color = 0xffffff, size = 10){
        const g = scene.add.graphics();
        if(!scene.textures.exists(`circle_${color.toString(16)}`)){
            g.fillStyle(color, 1);
            g.fillCircle(size,size,size);
            g.generateTexture(`circle_${color.toString(16)}`, size*2, size*2);
            g.destroy(); // opcional, liberar memoria
        }

        super(scene, x, y, `circle_${color.toString(16)}`);

        this.setVisible(false)
        this.scene = scene;
        this.kind = kind;
        this.size = size;
        this.color = color;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.scene.tweens.add({
            targets: this,
            y: this.y - 8,
            yoyo: true,
            duration: 120,
            repeat: 1
        });
    }

    update(dt){

    }
}

class IdleState extends State {
    init (params){
        this.ingrediente = params.ingrediente;
    }

    update(dt){
    }

    finish(){

    }
}