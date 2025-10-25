import { CircularTimer } from "./CircularTimer";
import { KitchenBox } from "./KitchenBox";

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
        this.numeroDeEtapas = 0;
        this.etapas = {};
        this.etapaActual = null;

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

        this.emitterHumo = this.scene.add.particles(x, y, 'particleHumo', { // humo grande
            frame: [0, 1, 2],
            speedX: { min: -10, max: 10 },
            speedY: { min: -20, max: -40 },
            lifespan: 1500,
            quantity: 1,
            frequency: -1,
            scale: 1,
            // scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            // blendMode: 'DARKEN',
            follow: null,
            depth: 12,
            emitZone: {
                source: new Phaser.Geom.Rectangle(-5, -5, 10, 10), // Área de emisión
                type: "random", // Las partículas se emiten desde posiciones aleatorias dentro del área
            },
        });

        this.emitterHumo2 = this.scene.add.particles(x, y, 'particleHumo2', { // humo chico
            frame: [0, 1, 2, 3],
            speedX: { min: -10, max: 10 },
            speedY: { min: -20, max: -40 },
            lifespan: 1500,
            quantity: 1,
            frequency: -1,
            scale: 1,
            // scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            // blendMode: 'DARKEN',
            follow: null,
            depth: 12,
            emitZone: {
                source: new Phaser.Geom.Rectangle(-12.5, -12.5, 25, 25), // Área de emisión
                type: "random", // Las partículas se emiten desde posiciones aleatorias dentro del área
            },
        });


        this.circleTimer = new CircularTimer(scene, x + 13, y + 13, 6, this.cookDuration, () => { this.finishCook() }, 2)
    }

    onInteract(player) {
        console.log(`Index de dataIngredient:  ${player.itemHolded?.dataIngredient.index}`)
        if (player.itemHolded && player.itemHolded.dataIngredient.index === 2) {
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
            if (!this.circleTimer.active) {
                this.startCook();
            }
            this.iconoCarbon.setVisible(false);

        } else if (player.holdingItem && !this.holdingItem) { //si el jugador tiene algo y esto no

            const isCompatible = this.checkIfItemCompatible(player);
            if (isCompatible && this.coalFrame === 0) {
                this.iconoCarbon.setVisible(true);
            }

        } else if (!player.holdingItem && this.holdingItem === true) { //si el jugador no tiene nada y esto si
            console.log("TERCERA ENTRADAAAAAAAAAAAAAAAAA")
            this.iconoCarbon.setVisible(false);
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
            this.scene.tweens.killTweensOf(player.itemHolded);
            console.log("se intento poner algo: ", player.itemHolded.dataIngredient);

            this.itemHolded = player.itemHolded;
            this.holdingItem = true;
            player.holdingSM.changeState("none", { player: player });
            this.itemHolded.setPosition(this.body.center.x, this.body.center.y);
            this.itemHolded.setVisible(true);
            this.itemHolded.setGrabbed(true);

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
            this.emitterHumo.frequency = -1
        }
        player.holdingSM.changeState("ingredient", { player: player, ingredient: this.itemHolded });
        this.itemHolded = null;
        this.holdingItem = false;
        this.numeroDeEtapas = 0;
        this.etapas = {};
        this.etapaActual = null;
        console.log(`Item holded: ${this.itemHolded}`)
    }

    startCook() {
        if (this.itemHolded && this.itemHolded.dataIngredient.next && this.itemHolded.dataIngredient.next[this.textureKey]) {
            if (this.hasCoal) {
                let numeroDeEtapas = 0;

                let data = this.itemHolded.dataIngredient
                console.log("data    ", data)

                while (data.next && data.next[this.textureKey]) {
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
                this.emitterHumo.frequency = 500 //empieza el humo grande al cocinar comida
                this.textureCoal.setVisible(true);
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
        if (this.hasCoal) {
            this.timerCoal += dt;
            if (this.coalFrame >= 1) {
                this.emitterHumo2.frequency = 500
            }

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
                    this.emitterHumo.frequency = -1 //si se acaba el carbon se paran los 2 humos
                    this.emitterHumo2.frequency = -1
                    if (this.circleTimer.active) {
                        this.circleTimer.stop();
                        if (this.actionSound) this.actionSound.stop();
                    }
                    break;
                }
            }

            if (this.circleTimer.active) {
                const progress = this.circleTimer.progress;
                if (Math.floor(progress / 3000) > this.etapaActual) {
                    this.etapaActual = Math.floor(progress / 3000);
                    this.itemHolded.cook(this.textureKey)
                }
            } else {
                this.emitterHumo.frequency = -1
                // si el circle timer no esta activo
                // entonces la comida o no esta o esta quemada
            }
        }
    }
}