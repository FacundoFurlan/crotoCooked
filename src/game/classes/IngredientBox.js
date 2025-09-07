import { StateMachine } from "../state/StateMachine";
import { State } from "../state/State";
import { Boxes } from "./Boxes.js";
import { Ingredientes } from "./Ingredientes.js";

export class IngredientBox extends Boxes {
    constructor(scene, x, y, ingredient = "tomato", color = 0xffffff, size = 32) {
        // generar textura si no existe
        if(!scene.textures.exists(color.toString(16))){
            const g = scene.add.graphics();
            g.fillStyle(color, 1);
            g.fillRect(0, 0, size, size);
            g.generateTexture(color.toString(16), size, size);
            g.destroy();
        }

        super(scene, x, y, color.toString(16), size);

        this.ingredient = ingredient;
        this.color = color;

        // state machine
        this.stateMachine = new StateMachine("idle");
        this.stateMachine.addState("idle", new IdleState());
        this.stateMachine.addState("anim", new AnimationState());
        this.stateMachine.changeState("idle", {box: this});
    }

    update(dt) {
        if (this.stateMachine) this.stateMachine.update(dt);
    }

    onInteract(player){
        if(this.stateMachine.currentStateName != "anim"){
            this.newIngredient = new Ingredientes(this.scene, player.x, player.y, "tomato", this.color)
            player.holdingSM.changeState("ingredient", {player: player, ingredient: this.newIngredient})
            this.stateMachine.changeState("anim", {box: this});
        }
    }
}

class IdleState extends State {
    init(params){
        this.box = params.box;
    }

    update(dt){        

    }
}

class AnimationState extends State {
    init(params){
        this.box = params.box

        this.animTween = this.box.scene.tweens.add({
            targets: this.box,
            angle: [-5, 5],
            duration: 100,
            ease: `Sine.inOut`,
            yoyo: true,
            repeat: -1
        });

        this.elapsed = 0;
        this.duration = 2000;
    }

    update(dt){
        this.elapsed += dt;
        if(this.elapsed >= this.duration){
            this.box.stateMachine.changeState("idle", {box: this.box})
        }
    }

    finish(){
        this.animTween.stop();
        this.box.angle = 0;
        this.animTween.remove();
    }
}