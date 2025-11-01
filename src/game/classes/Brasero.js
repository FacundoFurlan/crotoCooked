import { CircularTimer } from "./CircularTimer";
import { KitchenBox } from "./KitchenBox";

export class Brasero extends KitchenBox {
    constructor(scene, x, y, size) {
        const textureKey = "brasero";
        super(scene, x, y, textureKey, size);
        this.coalFrame = -1;
        this.textureCoal = scene.add.sprite(x, y - 25, "nivelCarbon", this.coalFrame); // crea carbon por encima del brasero
        this.textureCoal.setVisible(false);
        this.scene = scene;
        this.textureKey = textureKey;
        // this.holdingItem = false;
        this.coalLevel = 0;
        this.itemHolded = [];
        this.itemCooked = [];
        this.numeroDeEtapas = 0;
        this.etapas = {};
        this.etapaActual = null;

        this.hasCoal = false;
        this.iconoCarbon = scene.add.image(x, y - 25, "iconoCarbon");
        this.iconoCarbon.setDepth(10);
        this.iconoCarbon.setVisible(true);
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

        this.emitterHumo2 = this.scene.add.particles(x, y - 25, 'particleHumo2', { // humo chico
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


        this.circleTimer = new CircularTimer(scene, x + 13, y + 13, 6, this.cookDuration, () => { this.finishCook() }, 3)
    }

    onInteract(player) {
        if (player.holdingItem && this.coalLevel < 5) { //si el jugador tiene algo y esto tiene menos que el maximo
            this.checkIfItemCompatible(player);
        } else if (!player.holdingItem && this.holdingItem === true) { //si el jugador no tiene nada y esto si
            this.checkIfItemCanGo(player);
        }
    }

    checkIfItemCompatible(player) {
        // Protege contra null
        if (!player.itemHolded) return false;

        // Si el aparato acepta el item
        if (this.aparatoAccepts[player.itemHolded.textureKey]) {
            console.log("%cEntro por aca", "color: green");
            this.scene.tweens.killTweensOf(player.itemHolded);
            console.log("se intento poner algo: ", player.itemHolded.dataIngredient);



            this.itemHolded.unshift(player.itemHolded); // coloca el carbon crudo en la segunda posicion
            this.holdingItem = true;
            this.coalLevel = Math.min(5, this.coalLevel + 1);
            this.coalFrame = Math.min(4, this.coalFrame + 1);
            this.textureCoal.setFrame(this.coalFrame);
            this.textureCoal.setVisible(true);
            this.iconoCarbon.setVisible(false); //saca el icono de necesita carbon
            player.holdingSM.changeState("none", { player: player });
            this.itemHolded[0].setPosition(this.body.center.x + 1, this.body.center.y - 21);
            this.itemHolded[0].setVisible(true);
            this.itemHolded[0].setGrabbed(true);
            console.log("itemHolded array: ", this.itemHolded.length)
            console.log("itemCooked array: ", this.itemCooked.length)

            this.emitterHumo2.frequency = 500 //activa las particulas
            if (!this.circleTimer.active) {
                this.startCook();
            }

            return true; // compatible
        }

        return false; // no compatible
    }
    checkIfItemCanGo(player) {
        const puedeAgarrar = this.itemCooked.some(
            item => item.dataIngredient.index === 12); //si alguno de los items del array esta cocinado continua
        if (!puedeAgarrar) return;

        player.holdingSM.changeState("ingredient", { player: player, ingredient: this.itemCooked[this.itemCooked.length - 1] }); //agarra el utlimo, que deberia estar cocinado
        this.itemCooked.pop();
        console.log("itemHolded array: ", this.itemHolded.length)
        console.log("itemCooked array: ", this.itemCooked.length)

        this.coalLevel = Math.max(0, this.coalLevel - 1);
        this.coalFrame = Math.max(0, this.coalFrame - 1);
        this.textureCoal.setFrame(this.coalFrame);
        console.log(this.coalLevel)
        if (this.coalLevel === 0) {
            console.log("esta vacio ves?")
            this.itemHolded = [];
            this.itemCooked = [];
            this.holdingItem = false;
            this.textureCoal.setVisible(false);
            this.iconoCarbon.setVisible(true);
            this.coalFrame = -1;
            this.emitterHumo2.frequency = -1 //desactiva las particulas
        }

    }

    startCook() {
        const puedeCocinar = this.itemHolded.some(
            item => item.dataIngredient.index != 12); //si alguno de los items del array no esta cocinado continua cocinando
        if (!puedeCocinar) return;

        if (this.itemHolded[0] && this.itemHolded[0].dataIngredient.next && this.itemHolded[0].dataIngredient.next[this.textureKey]) {
            console.log("%cSe inicia reloj", "color: aqua")
            this.circleTimer.start()
            if (this.actionSound) {
                this.actionSound.play();
            }
            // this.setTexture(this.textureOn);
        }
    }


    finishCook() {
        if (this.itemHolded.length > 0) {
            this.itemHolded[0].cook(this.textureKey);
            this.itemCooked.push(this.itemHolded.shift());
            console.log("NEW COOKED ITEM: ", this.itemCooked[0].dataIngredient)
            console.log("itemHolded array: ", this.itemHolded.length)
            console.log("itemCooked array: ", this.itemCooked.length)
        }
        if (this.itemHolded[0] && this.itemHolded[0].dataIngredient.next && this.itemHolded[0].dataIngredient.next[this.textureKey]) {
            console.log("tiene que arrancar reloj")
            this.circleTimer.start()
        } else {
            if (this.actionSound) {
                this.actionSound.stop();
            }
            // this.needsCoal ? false : this.setTexture(this.textureKey)
        }
    }

}