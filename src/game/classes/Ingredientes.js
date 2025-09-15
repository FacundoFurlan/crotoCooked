import { State } from "../state/State";

export class Ingredientes extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey = "carbon_0", size = 10){
        super(scene, x, y, "ingredientesAtlas", scene.ingredientesAtlas[textureKey].index);
        console.log("esto llega a ingredientes: ", textureKey)

        this.setVisible(false)
        this.scene = scene;
        this.size = size;
        this.textureKey = textureKey;
        this.dataIngredient = this.scene.ingredientesAtlas[textureKey]

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

    cook(){
        this.textureKey = this.dataIngredient.next;
        this.dataIngredient = this.scene.ingredientesAtlas[this.textureKey];
        this.setTexture("ingredientesAtlas", this.dataIngredient.index);
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