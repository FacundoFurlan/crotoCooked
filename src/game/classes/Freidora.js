import { CircularTimer } from "./CircularTimer";
import { KitchenBox } from "./KitchenBox";

export class Freidora extends KitchenBox {
    constructor(scene, x, y, size, frame) {
        const textureKey = "freidora";
        super(scene, x, y, textureKey, size, frame);
        this.scene = scene;
        this.textureKey = textureKey;
        this.holdingItem = false;
        this.itemHolded = null;
        this.numeroDeEtapas = 0;
        this.etapas = {};
        this.etapaActual = null;

        this.actionSound = this.scene.coccionAudio
        this.actionFinish = this.scene.coccionListoAudio

        this.circleTimer = new CircularTimer(scene, x+13, y+13, 6, this.cookDuration, () => { this.finishCook() }, 2)
    }

    onInteract(player) {
        if (player.holdingItem && !this.holdingItem) { //si el jugador tiene algo y esto no
            const isCompatible = this.checkIfItemCompatible(player);
        } else if (!player.holdingItem && this.holdingItem === true) { //si el jugador no tiene nada y esto si
            this.checkIfItemCanGo(player);
        }
    }

    checkIfItemCompatible(player) {
        // Protege contra null
        if (!player.itemHolded) return false;

        // Si el timer está activo, no es compatible
        if (this.circleTimer.active) return false;

        // Si el aparato acepta el item
        if (this.aparatoAccepts[player.itemHolded.textureKey]) {
            console.log("%cEntro por aca", "color: green");
            this.scene.tweens.killTweensOf(player.itemHolded);
            console.log("se intento poner algo: ", player.itemHolded.dataIngredient);

            this.itemHolded = player.itemHolded;
            this.holdingItem = true;
            player.holdingSM.changeState("none", { player: player });
            this.itemHolded.setPosition(this.body.center.x, this.body.center.y);
            this.itemHolded.setVisible(true);

            // si es una mesa y no puede cortar entonces no se cocina
            if (this.textureKey === "mesa" && !this.cortar) return false;
            this.startCook();

            return true; // compatible
        }

        return false; // no compatible
    }

    checkIfItemCanGo(player) {
        if (this.circleTimer.active) {
            this.circleTimer.stop()
            if (this.actionSound) {
                this.actionSound.stop();
            }
        }
        player.holdingSM.changeState("ingredient", { player: player, ingredient: this.itemHolded });
        this.itemHolded = null;
        this.holdingItem = false;
        this.numeroDeEtapas = 0;
        this.etapas = {};
        this.etapaActual = null;
    }

    startCook() {
        if (this.itemHolded && this.itemHolded.dataIngredient.next && this.itemHolded.dataIngredient.next[this.textureKey]) {
            let numeroDeEtapas = 0;

            let data = this.itemHolded.dataIngredient
            console.log("data    ", data)

            while( data.next && data.next[this.textureKey]){
                numeroDeEtapas++;
                
                let nextTexture = data.next[this.textureKey];
                this.etapas[numeroDeEtapas] = nextTexture;
                console.log("next texture:    ", nextTexture)
                
                data = this.scene.ingredientesAtlas[nextTexture];
            }

            this.numeroDeEtapas = numeroDeEtapas;
            console.log("Numero de etapas:    ", numeroDeEtapas)

            console.log("%cSe inicia reloj", "color: aqua")
            this.circleTimer.start((numeroDeEtapas) * 3000)
            if (this.actionSound) {
                this.actionSound.play();
            }
        }
    }

    finishCook() {
        this.itemHolded.cook(this.textureKey);
        this.actionFinish.play()
        console.log("NEW COOKED ITEM: ", this.itemHolded.dataIngredient)
        if (this.actionSound) {
            this.actionSound.stop();
        }
        this.numeroDeEtapas = 0;
        this.etapas = {};
        this.etapaActual = null;
    }


    update(dt) {
        this.circleTimer.update(dt);

        if(this.circleTimer.active){
            const progress = this.circleTimer.progress;
            if(Math.floor(progress/3000) > this.etapaActual){
                this.etapaActual = Math.floor(progress/3000);
                this.itemHolded.cook(this.textureKey)
            }
        }
    }
}