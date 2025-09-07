import { Boxes } from "./Boxes.js";
import { CircularTimer } from "./CircularTimer.js";

export class KitchenBox extends Boxes {
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

        this.progress = 0;
        this.cookDuration = 3000;

        this.circleTimer = new CircularTimer(scene, x, y, 16, this.cookDuration, () => {this.finishCook()})
    }

    onInteract(player) {
        if(player.holdingItem){
            if(!this.circleTimer.active){
                this.itemHolded = player.itemHolded;
                player.holdingSM.changeState("none", {player: player})
                this.itemHolded.setPosition(this.body.center.x, this.body.center.y);
                this.itemHolded.setVisible(true)
                this.circleTimer.start()
            }
        }
    }

    finishCook(){
        this.itemHolded.setTint(0xff0000)
    }

    update(dt) {
        this.circleTimer.update(dt)
    }

}