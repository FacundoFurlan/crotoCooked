import { State } from "../state/State";
import { Interactuables } from "./Interactuables";

export class Ingredientes extends Interactuables {
    constructor(scene, x, y, textureKey = "carbon_0", size = 10){
        super(scene, x, y, "ingredientesAtlas", 900,scene.ingredientesAtlas[textureKey].index);
        console.log("esto llega a ingredientes: ", textureKey)

        this.setVisible(false)
        this.scene = scene;
        this.size = size;
        this.textureKey = textureKey;
        this.dataIngredient = this.scene.ingredientesAtlas[textureKey]
        this.grabbed = false;

        
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        this.scene.tweens.add({
            targets: this,
            y: this.y - 8,
            yoyo: true,
            duration: 120,
            repeat: 1
        });
        this.scene.Interactuables.push(this)
    }

    update(dt){

    }

    onInteract(player){
        if(!this.grabbed && !player.holdingItem){
            player.holdingSM.changeState("ingredient", {player: player, ingredient: this})
        }
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