import { Interactuables } from "./Interactuables.js";
import { CircularTimer } from "./CircularTimer.js";

export class KitchenBox extends Interactuables {
    constructor(scene, x, y, textureKey, size = 48) {

        super(scene, x, y, textureKey, size);

        this.scene = scene;
        this.textureKey = textureKey;
        this.aparatoAccepts = this.scene.aparatosAtlas[this.textureKey].accepts;
        this.holdingItem = false;
        this.itemHolded = null;
        this.cookDuration = 3000;

        this.body.setCollideWorldBounds(true);
        this.body.setImmovable(true);

        this.actionSound = null;
        this.textureOn = this.textureKey;
        if(textureKey === "mesa"){
            this.actionSound = this.scene.picarAudio
        } else if(textureKey === "freidora"){
            this.actionSound = this.scene.fritarAudio
            this.textureOn = "freidoraOn"
        }

        this.circleTimer = new CircularTimer(scene, x, y, 16, this.cookDuration, () => {this.finishCook()})
    }

    onInteract(player) {
         if(player.holdingItem && !this.holdingItem){ //si el jugador tiene algo y esto no
            this.checkIfItemCompatible(player);
        } else if(!player.holdingItem && this.holdingItem === true){ //si el jugador no tiene nada y esto si
            this.checkIfItemCanGo(player);
        }
    }
    
    checkIfItemCompatible(player){
        if(!this.circleTimer.active){
            if(this.aparatoAccepts[player.itemHolded.textureKey]){
                console.log("%cEntro por aca", "color: green")
                this.scene.tweens.killTweensOf(player.itemHolded);
                console.log("se intento poner algo: ", player.itemHolded.dataIngredient.hasNext)
                this.itemHolded = player.itemHolded;
                this.holdingItem = true;
                player.holdingSM.changeState("none", {player: player})
                this.itemHolded.setPosition(this.body.center.x, this.body.center.y);
                this.itemHolded.setVisible(true)
                this.startCook()
            }
        }
    }

    checkIfItemCanGo(player){
        if(this.circleTimer.active){
            this.circleTimer.stop()
            if(this.actionSound){
                this.actionSound.stop();
            }
            this.setTexture(this.textureKey)
        }
        player.holdingSM.changeState("ingredient", {player: player, ingredient: this.itemHolded});
        this.itemHolded = null;
        this.holdingItem = false;
    }

    startCook(){
        if(this.itemHolded && this.itemHolded.dataIngredient.hasNext && this.itemHolded.dataIngredient.isWorkedOn[this.textureKey]){
            console.log("%cSe inicia reloj", "color: aqua")
            this.circleTimer.start()
            if(this.actionSound){
                this.actionSound.play();
            }
            this.setTexture(this.textureOn);
        }
    }


    finishCook(){
        this.itemHolded.cook();
        console.log("NEW COOKED ITEM: ", this.itemHolded.dataIngredient)
        if(this.itemHolded.dataIngredient.hasNext && this.itemHolded.dataIngredient.isWorkedOn[this.textureKey]){
            console.log("tiene que arrancar reloj")
            this.circleTimer.start()
        } else{
            if(this.actionSound){
                this.actionSound.stop();
            }
            this.needsCoal? false : this.setTexture(this.textureKey)
        }
    }

    update(dt) {
        this.circleTimer.update(dt)

    }

}