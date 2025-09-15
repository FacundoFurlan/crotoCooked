import { Boxes } from "./Boxes.js";
import { CircularTimer } from "./CircularTimer.js";

export class KitchenBox extends Boxes {
    constructor(scene, x, y, textureKey, size = 48) {

        super(scene, x, y, textureKey, size);

        this.scene = scene;
        this.textureKey = textureKey;
        this.aparatoAccepts = this.scene.aparatosAtlas[this.textureKey].accepts;
        this.holdingItem = false;
        this.itemHolded = null;
        this.cookDuration = 3000;

        this.actionSound = null;
        this.needsCoal = false;
        this.hasCoal = false;
        this.textureCoal = null;
        this.timerCoal = null;
        this.durationCoal = 10000;
        this.textureOn = this.textureKey;
        if(textureKey === "mesa"){
            this.actionSound = this.scene.picarAudio
        } else if(textureKey === "asador"){
            this.actionSound = this.scene.coccionAudio
            this.textureCoal = "asadorOn"
            this.textureOn = "asadorOn"
            this.needsCoal = true;
        } else if(textureKey === "freidora"){
            this.actionSound = this.scene.fritarAudio
            this.textureOn = "freidoraOn"
        }

        this.circleTimer = new CircularTimer(scene, x, y, 16, this.cookDuration, () => {this.finishCook()})
    }

    onInteract(player) {
        if(player.itemHolded && player.itemHolded.dataIngredient.index === 2 && !this.hasCoal){
            console.log("%cEntro por aca", "color: red")
            this.hasCoal = true;
            this.timerCoal = 0;
            this.setTexture(this.textureCoal);
            player.holdingSM.changeState("none", {player: player})
            this.startCook()
        }else if(player.holdingItem && !this.holdingItem){ //si el jugador tiene algo y esto no
            if(!this.circleTimer.active){
                if(this.aparatoAccepts[player.itemHolded.textureKey]){
                    console.log("%cEntro por aca", "color: green")
                    console.log("se intento poner algo: ", player.itemHolded.dataIngredient.hasNext)
                    this.itemHolded = player.itemHolded;
                    this.holdingItem = true;
                    player.holdingSM.changeState("none", {player: player})
                    this.itemHolded.setPosition(this.body.center.x, this.body.center.y);
                    this.itemHolded.setVisible(true)
                    this.startCook()
                }
            }
        } else if(!player.holdingItem && this.holdingItem === true){ //si el jugador no tiene nada y esto si
            
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
    }
    
    startCook(){
        if(this.itemHolded && this.itemHolded.dataIngredient.hasNext && this.itemHolded.dataIngredient.isWorkedOn[this.textureKey]){
            if(!this.needsCoal || (this.needsCoal && this.hasCoal)){
                console.log("%cSe inicia reloj", "color: aqua")
                this.circleTimer.start()
                if(this.actionSound){
                    this.actionSound.play();
                }
                this.setTexture(this.textureOn);
            }
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
        if(this.hasCoal){
            this.timerCoal += dt;
            if(this.timerCoal > this.durationCoal){
                this.setTexture(this.textureKey);
                this.hasCoal = false;
                if(this.circleTimer.active){
                    this.circleTimer.stop();
                    if(this.actionSound){
                        this.actionSound.stop();
                    }
                }
            }
        }
    }

}