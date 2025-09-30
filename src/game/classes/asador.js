import { KitchenBox } from "./kitchenBox";

export class Asador extends KitchenBox {
    constructor(scene, x, y, textureKey, size){
        super(scene, x, y, textureKey, size);
        this.scene = scene;
        this.textureKey = textureKey;
        this.holdingItem = false;
        this.itemHolded = null;

        this.hasCoal = false;
        this.textureCoal = "asadorOn";
        this.timerCoal = 0;
        this.durationCoal = 10000;
        this.actionSound = this.scene.coccionAudio
    }

    onInteract(player){
        if(player.itemHolded && player.itemHolded.dataIngredient.index === 2 && !this.hasCoal){
            console.log("%cIngresa Carbon al Asador", "color: red")
            this.hasCoal = true;
            this.timerCoal = 0;
            const coalReference = player.itemHolded;
            const indexCoal = this.scene.Interactuables.indexOf(coalReference);
            const indexIngre = this.scene.ingredientesCreadosArray.indexOf(coalReference);
            if(indexCoal !== -1){
                this.scene.Interactuables.splice(indexCoal, 1);
            }
            if(indexIngre !== -1){
                this.scene.ingredientesCreadosArray.splice(indexIngre, 1);
            }
            this.setTexture(this.textureCoal);
            this.scene.tweens.killTweensOf(player.itemHolded);
            player.holdingSM.changeState("none", {player: player})

            coalReference.destroy();
            this.startCook();

        } else if(player.holdingItem && !this.holdingItem){ //si el jugador tiene algo y esto no
            
            this.checkIfItemCompatible(player);

        } else if(!player.holdingItem && this.holdingItem === true){ //si el jugador no tiene nada y esto si
            
            this.checkIfItemCanGo(player);

        }
    }

    startCook(){
        if(this.itemHolded && this.itemHolded.dataIngredient.hasNext && this.itemHolded.dataIngredient.isWorkedOn[this.textureKey]){
            if(this.hasCoal){
                console.log("%cSe inicia reloj", "color: aqua")
                this.circleTimer.start()
                if(this.actionSound){
                    this.actionSound.play();
                }
                this.setTexture(this.textureCoal);
            }
        }
    }


    update(dt){
        this.circleTimer.update(dt);
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