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

        this.holdingItem = false;
        this.itemHolded = null;
        this.cookDuration = 3000;

        this.circleTimer = new CircularTimer(scene, x, y, 16, this.cookDuration, () => {this.finishCook()})
    }

    onInteract(player) {
        if(player.holdingItem && !this.holdingItem){
            if(!this.circleTimer.active){
                this.itemHolded = player.itemHolded;
                this.holdingItem = true;
                player.holdingSM.changeState("none", {player: player})
                this.itemHolded.setPosition(this.body.center.x, this.body.center.y);
                this.itemHolded.setVisible(true)
                this.circleTimer.start()
            }
        }
        
        if(!player.holdingItem && !this.circleTimer.active && this.holdingItem === true){
            console.log("player clicked and not holding shit")
            player.holdingSM.changeState("ingredient", {player: player, ingredient: this.itemHolded});
            this.itemHolded = null;
            this.holdingItem = false;
        }
    }

    finishCook(){
        this.itemHolded.setTint(0xff0000);
        this.itemHolded.kind = "cocinado";
    }

    update(dt) {
        this.circleTimer.update(dt)
    }

}