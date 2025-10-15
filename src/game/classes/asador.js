import { KitchenBox } from "./kitchenBox";

export class Asador extends KitchenBox {
    constructor(scene, x, y, size, frame) {
        const textureKey = "asador";
        const textureCoal = scene.add.sprite(x, y, "brasas", 4); // crea las brasas antes que el asador para que se rendericen atras de este
        textureCoal.setVisible(false);
        super(scene, x, y, textureKey, size, frame);
        this.scene = scene;
        this.textureKey = textureKey;
        this.holdingItem = false;
        this.itemHolded = null;

        this.hasCoal = false;
        this.textureCoal = textureCoal;
        this.timerCoal = 0;
        this.durationCoal = 20000;
        this.actionSound = this.scene.coccionAudio
        this.actionFinish = this.scene.coccionListoAudio
    }

    onInteract(player) {
        if (player.itemHolded && player.itemHolded.dataIngredient.index === 2 && !this.hasCoal) {
            console.log("%cIngresa Carbon al Asador", "color: red")
            this.hasCoal = true;
            this.timerCoal = 0;
            const coalReference = player.itemHolded;
            const indexCoal = this.scene.Interactuables.indexOf(coalReference);
            const indexIngre = this.scene.ingredientesCreadosArray.indexOf(coalReference);
            if (indexCoal !== -1) {
                this.scene.Interactuables.splice(indexCoal, 1);
            }
            if (indexIngre !== -1) {
                this.scene.ingredientesCreadosArray.splice(indexIngre, 1);
            }
            this.textureCoal.setVisible(true);
            this.scene.tweens.killTweensOf(player.itemHolded);
            player.holdingSM.changeState("none", { player: player })

            coalReference.destroy();
            this.startCook();

        } else if (player.holdingItem && !this.holdingItem) { //si el jugador tiene algo y esto no

            this.checkIfItemCompatible(player);

        } else if (!player.holdingItem && this.holdingItem === true) { //si el jugador no tiene nada y esto si

            this.checkIfItemCanGo(player);

        }
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
    }

    startCook() {
        if (this.itemHolded && this.itemHolded.dataIngredient.next && this.itemHolded.dataIngredient.next[this.textureKey]) {
            if (this.hasCoal) {
                console.log("%cSe inicia reloj", "color: aqua")
                this.circleTimer.start()
                if (this.actionSound) {
                    this.actionSound.play();
                }
                this.textureCoal.setVisible(true);
            }
        }
    }


    update(dt) {
        this.circleTimer.update(dt);
        if (this.hasCoal) {
            this.timerCoal += dt;
            if (this.timerCoal > this.durationCoal) {
                this.textureCoal.setVisible(false);
                this.hasCoal = false;
                if (this.circleTimer.active) {
                    this.circleTimer.stop();
                    if (this.actionSound) {
                        this.actionSound.stop();
                    }
                }
            }
        }
    }
}