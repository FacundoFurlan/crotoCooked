import { Interactuables } from "./Interactuables.js";
import { CircularTimer } from "./CircularTimer.js";
import { Ingredientes } from "./Ingredientes.js";

export class KitchenBox extends Interactuables {
    constructor(scene, x, y, textureKey, size, frame, tabla) {

        super(scene, x, y, textureKey, size, frame);

        this.scene = scene;
        this.textureKey = textureKey;
        this.aparatoAccepts = this.scene.aparatosAtlas[this.textureKey].accepts;
        this.holdingItem = false;
        this.itemHolded = null;
        this.cookDuration = 3000;

        this.body.setCollideWorldBounds(true);
        this.body.setImmovable(true);

        this.cortar = false;
        this.actionSound = null;
        this.actionFinish = null;
        this.textureOn = this.textureKey;
        if (textureKey === "mesa") {
            this.actionSound = this.scene.picarAudio
            this.actionFinish = this.scene.picarListoAudio;
            if (tabla === 1) {
                scene.add.image(x, y, "tablaCortar");
                this.cortar = true;
            }
        } else if (textureKey === "freidora") {
            this.actionSound = this.scene.fritarAudio
            this.actionFinish = this.scene.coccionListoAudio;
            this.textureOn = "freidoraOn"
        }

        this.circleTimer = new CircularTimer(scene, x, y, 16, this.cookDuration, () => { this.finishCook() })
    }

    onInteract(player) {
        if (player.holdingItem && !this.holdingItem) { //si el jugador tiene algo y esto no
            this.checkIfItemCompatible(player);
        } else if (!player.holdingItem && this.holdingItem === true) { //si el jugador no tiene nada y esto si
            this.checkIfItemCanGo(player);
        } else if (this.textureKey === "mesa" && player.holdingItem && this.holdingItem && !this.cortar) {
            console.log("TENEMOS COSAS EN LAS MANOS")
            if (player.itemHolded.dataIngredient.fusion) {
                console.log(player.itemHolded.dataIngredient.fusion)
                if (player.itemHolded.dataIngredient.fusion[this.itemHolded.textureKey]) {
                    console.log(`Se deberia fabricar: ${player.itemHolded.dataIngredient.fusion[this.itemHolded.textureKey]}`)
                    if (this.circleTimer.active) {
                        this.circleTimer.stop()
                        if (this.actionSound) {
                            this.actionSound.stop();
                        }
                        // this.setTexture(this.textureKey)
                    }
                    const nextItemTextureKey = player.itemHolded.dataIngredient.fusion[this.itemHolded.textureKey]
                    const playerItemRef = player.itemHolded;
                    let indexPIR = this.scene.Interactuables.indexOf(playerItemRef)
                    let indexPIR2 = this.scene.ingredientesCreadosArray.indexOf(playerItemRef)
                    if (indexPIR !== -1) {
                        this.scene.Interactuables.splice(indexPIR, 1);
                    }
                    if (indexPIR2 !== -1) {
                        this.scene.ingredientesCreadosArray.splice(indexPIR2, 1);
                    }
                    player.holdingSM.changeState("none", { player: player });
                    playerItemRef.destroy();
                    console.log("HASTA ACA ESTAMOS BIEN")
                    const itemHoldedRef = this.itemHolded;
                    indexPIR = this.scene.Interactuables.indexOf(itemHoldedRef)
                    indexPIR2 = this.scene.ingredientesCreadosArray.indexOf(itemHoldedRef)
                    if (indexPIR !== -1) {
                        this.scene.Interactuables.splice(indexPIR, 1);
                    }
                    if (indexPIR2 !== -1) {
                        this.scene.ingredientesCreadosArray.splice(indexPIR2, 1);
                    }
                    itemHoldedRef.destroy();
                    console.log("HASTA ACA ESTAMOS BIEN 2")
                    if (!this.circleTimer.active) {
                        if (this.aparatoAccepts[nextItemTextureKey]) {
                            console.log(nextItemTextureKey)
                            this.itemHolded = new Ingredientes(this.scene, this.body.center.x, this.body.center.y, nextItemTextureKey);
                            this.holdingItem = true;
                            this.itemHolded.setPosition(this.body.center.x, this.body.center.y);
                            this.itemHolded.setVisible(true)
                            this.startCook()
                        }
                    }
                }
            }
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
            // this.setTexture(this.textureKey)
        }
        player.holdingSM.changeState("ingredient", { player: player, ingredient: this.itemHolded });
        this.itemHolded = null;
        this.holdingItem = false;
    }

    startCook() {
        if (this.itemHolded && this.itemHolded.dataIngredient.next && this.itemHolded.dataIngredient.next[this.textureKey]) {
            console.log("%cSe inicia reloj", "color: aqua")
            this.circleTimer.start()
            if (this.actionSound) {
                this.actionSound.play();
            }
            // this.setTexture(this.textureOn);
        }
    }


    finishCook() {
        this.itemHolded.cook(this.textureKey);
        // this.actionFinish.play()
        console.log("NEW COOKED ITEM: ", this.itemHolded.dataIngredient)
        if (this.itemHolded.dataIngredient.next && this.itemHolded.dataIngredient.next[this.textureKey]) {
            console.log("tiene que arrancar reloj")
            this.circleTimer.start()
        } else {
            if (this.actionSound) {
                this.actionSound.stop();
            }
            // this.needsCoal ? false : this.setTexture(this.textureKey)
        }
    }

    update(dt) {
        this.circleTimer.update(dt)

    }

}