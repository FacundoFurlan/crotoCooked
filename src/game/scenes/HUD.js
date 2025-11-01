export class HUD extends Phaser.Scene {
    constructor() {
        super("HUD");
    }

    create() {
        const { width } = this.scale;

        this.currentMode = this.registry.get("mode");
        if (this.currentMode === 1) {
            if (!this.registry.has("coopPoints")) {
                this.registry.set("coopPoints", 0)
            }
            this.pointsText = this.add.text(width - 100, 20, `Puntos: ${this.registry.get("coopPoints")}`, {
                fontFamily: "MyFont",
                fontSize: "25px",
                color: "#ffffffff",
                strokeThickness: 2,
                stroke: "#000000ff"
            }).setOrigin(.5);
        } else if (this.currentMode === 2) {
            if (!this.registry.has("vsPoints1")) {
                this.registry.set("vsPoints1", 0)
            }
            if (!this.registry.has("vsPoints2")) {
                this.registry.set("vsPoints2", 0)
            }
            this.pointsText1 = this.add.text(width - 100, 20, `Puntos P1: ${this.registry.get("vsPoints1")}`, {
                fontFamily: "MyFont",
                fontSize: "25px",
                color: "#E3C0A1",
                strokeThickness: 2,
                stroke: "#000000ff"
            }).setOrigin(.5);
            this.pointsText2 = this.add.text(width - 100, 40, `Puntos P2: ${this.registry.get("vsPoints2")}`, {
                fontFamily: "MyFont",
                fontSize: "25px",
                color: "#59493F",
                strokeThickness: 2,
                stroke: "#000000ff"
            }).setOrigin(.5);
        }
        this.timeTotal = 240000;
        this.timeLeft = this.timeTotal;
        this.critico = true;

        this.timerText = this.add.text(width / 2, 20, "01:00", {
            fontFamily: "MyFont",
            fontSize: "25px",
            color: "#fff",
            strokeThickness: 2,
            stroke: "#000000ff"
        }).setOrigin(.5);

        this.updateTimer();

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.onSecond,
            callbackScope: this,
            loop: true
        })

        this.pedidosEnCola = 0;

        // this.pedidosText = this.add.text(125, 9, `Pedidos: ${this.pedidosEnCola}`, {
        //     fontSize: "25px",
        //     color: "#fff",
        //     fontFamily: "MyFont",
        //     strokeThickness: 2,
        //     stroke: "#000000ff"
        // });
        this.scene.bringToTop("HUD");
    }

    onSecond() {
        this.timeLeft -= 1000;
        if (this.gameScene === undefined) {
            this.gameScene = this.scene.get("Game");
            this.gameScene.tiempoEmpiezaAudio.play({
                volume: 0.5, // Ajusta el volumen
                rate: 1    // Ajusta el pitch
            });
        }
        if (this.timeLeft < this.timeTotal * 0.2 && this.critico) {
            this.critico = false;
            this.gameScene.tiempoCriticoAudio.play({
                volume: 0.5, // Ajusta el volumen
                rate: 1    // Ajusta el pitch
            });
            this.timerText.setColor("#d42929ff")
        }
        if (this.timeLeft === 1000) {
            this.gameScene.tiempoFinAudio.play({
                volume: 0.5, // Ajusta el volumen
                rate: 1    // Ajusta el pitch
            });
        }
        if (this.timeLeft < 0) {
            this.timeLeft = 0;
            this.timerEvent.remove(false)

            if (this.gameScene) {
                this.gameScene.finishLevel()
            }
        }

        this.updateTimer()
    }

    addPedidosEnCola(amount) {
        this.pedidosEnCola += amount;
        // this.pedidosText.setText(`Pedidos: ${this.pedidosEnCola}`)
    }

    updatePoints() {
        if (this.currentMode === 1) {
            if (this.pointsText) {
                this.pointsText.setText(`Puntos: ${this.registry.get("coopPoints")}`)
            }
        } else if (this.currentMode === 2) {
            if (this.pointsText1 && this.pointsText2) {
                this.pointsText1.setText(`Puntos P1: ${this.registry.get("vsPoints1")}`)
                this.pointsText2.setText(`Puntos P2: ${this.registry.get("vsPoints2")}`)
            }
        }
    }

    subsPedidosEnCola(amount) {
        this.pedidosEnCola -= amount;
        // this.pedidosText.setText(`Pedidos: ${this.pedidosEnCola}`)
    }

    getPedidosEnCola() {
        return this.pedidosEnCola;
    }

    updateTimer() {
        const totalSeconds = Math.floor(this.timeLeft / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        this.timerText.setText(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    }
}
