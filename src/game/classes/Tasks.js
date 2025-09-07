import { Boxes } from "./Boxes.js";
import { CircularTimer } from "./CircularTimer.js";
import { Ingredientes } from "./Ingredientes.js";

export class Task extends Boxes {
    constructor(scene, x, y, color, size = 48) {
        // generar textura si no existe
        if(!scene.textures.exists(color.toString(16))){
            const g = scene.add.graphics();
            g.fillStyle(color, 1);
            g.fillRect(0, 0, size, size);
            g.generateTexture(color.toString(16), size, size);
            g.destroy();
        }

        super(scene, x, y, color.toString(16), size);
        
        this.scene = scene;
        this.itemHolded = new Ingredientes(this.scene, x, y);
        this.itemHolded.setPosition(this.body.center.x, this.body.center.y);
        this.itemHolded.setTint(0xff0000)
        this.itemHolded.setVisible(true)
        this.itemHolded.kind = "cocinado"
        this.taskDuration = 15000;

        this.circleTimer = new CircularTimer(scene, x, y, 16, this.taskDuration, () => {this.failTask()})
        this.circleTimer.start()
    }

    onInteract(player) {
        if(player.holdingItem){
            console.log(`%cItem del player: ${player.itemHolded.kind} e item del pedido: ${this.itemHolded.kind}`, "color: aqua")
            if(player.itemHolded.kind === this.itemHolded.kind){
                this.setTint(0x00ff00)
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