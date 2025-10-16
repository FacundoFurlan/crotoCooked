import { KitchenBox } from "./kitchenBox";

export class Asador extends KitchenBox {
    constructor(scene, x, y, size, frame) {
        const textureKey = "asador";
        const coalFrame = 0;
        const textureCoal = scene.add.sprite(x, y, "brasas", coalFrame); // crea las brasas antes que el asador para que se rendericen atras de este
        textureCoal.setVisible(false);
        super(scene, x, y, textureKey, size, frame);
        this.scene = scene;
        this.textureKey = textureKey;
        this.holdingItem = false;
        this.itemHolded = null;

        this.hasCoal = false;
        this.iconoCarbon = scene.add.image(x, y - 10, "iconoCarbon");
        this.iconoCarbon.setDepth(10);
        this.iconoCarbon.setVisible(false);
        this.coalFrame = coalFrame;
        this.textureCoal = textureCoal;
        this.timerCoal = 0;
        this.durationCoal = 10000;
        this.actionSound = this.scene.coccionAudio
        this.actionFinish = this.scene.coccionListoAudio
    }

    onInteract(player) {
        if (player.itemHolded && player.itemHolded.dataIngredient.index === 2 && this.coalFrame !== 4) {
            console.log("%cIngresa Carbon al Asador", "color: red")
            this.hasCoal = true;
            this.coalFrame = Math.min(4, this.coalFrame + 2); //esto deberia sumarle 2 al nivel de carbon pero si es mayor de 4 lo pone en 4
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
            this.textureCoal.setFrame(this.coalFrame)
            this.scene.tweens.killTweensOf(player.itemHolded);
            player.holdingSM.changeState("none", { player: player })

            coalReference.destroy();
            this.startCook();
            this.iconoCarbon.setVisible(false);

        } else if (player.holdingItem && !this.holdingItem) { //si el jugador tiene algo y esto no

            const isCompatible = this.checkIfItemCompatible(player);
            console.log(isCompatible)
            if (isCompatible && this.coalFrame === 0) {
                this.iconoCarbon.setVisible(true);
            }

        } else if (!player.holdingItem && this.holdingItem === true) { //si el jugador no tiene nada y esto si
            this.iconoCarbon.setVisible(false);
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

            // Si ha pasado más de un periodo, manejarlo en bucle (por si dt grande)
            while (this.timerCoal >= this.durationCoal) {
                this.timerCoal -= this.durationCoal;

                // decrementa el frame una unidad (no bajar de 0)
                this.coalFrame = Math.max(0, this.coalFrame - 1);
                this.textureCoal.setFrame(this.coalFrame);

                // si se acabaron las frames, quitar carbón y detener lógica relacionada
                if (this.coalFrame === 0) {
                    this.textureCoal.setVisible(false);
                    this.hasCoal = false;
                    if (this.circleTimer.active) {
                        this.circleTimer.stop();
                        if (this.actionSound) this.actionSound.stop();
                    }
                    break;
                }
            }
        }
    }
}