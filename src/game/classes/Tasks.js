import { Interactuables } from "./Interactuables.js";
import { CircularTimer } from "./CircularTimer.js";
import { Ingredientes } from "./Ingredientes.js";

export class Task extends Interactuables {
    constructor(scene, x, y, ingrediente = "carbon_0", size = 48, textureKey = "orden") {

        super(scene, x, y, textureKey, size);
        
        this.scene = scene;
        this.textureKey = textureKey;
        this.ingrediente = ingrediente;
        this.itemHolded = new Ingredientes(this.scene, x, y, this.ingrediente);
        this.itemHolded.setPosition(this.body.center.x, this.body.center.y);
        this.itemHolded.setVisible(true)
        this.taskDuration = 1500000;

        this.body.setCollideWorldBounds(true);
        this.body.setImmovable(true);

        this.circleTimer = new CircularTimer(scene, x, y, 16, this.taskDuration, () => {this.failTask()})
        this.circleTimer.start()
    }

    onInteract(player) {
        if(player.holdingItem){
            console.log(player.itemHolded.textureKey)
            console.log(`%cItem del player: ${player.itemHolded.textureKey} e item del pedido: ${this.itemHolded.textureKey}`, "color: aqua")
            if(player.itemHolded.textureKey === this.itemHolded.textureKey){
                this.scene.finishLevel();
            }
        }
    }

    failTask(){
        this.scene.onPlayerDeath("failed to cook")
    }

    update(dt) {
        this.circleTimer.update(dt)
    }

}