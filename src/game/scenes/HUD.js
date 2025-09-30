export class HUD extends Phaser.Scene {
    constructor() {
        super("HUD");
    }

    create() {
        const {width} = this.scale;

        this.currentMode = this.registry.get("mode");
        if(this.currentMode === 1){
            this.registry.set("coopPoints", 0)
            this.pointsText = this.add.text(width-100, 20 , `Puntos: ${this.registry.get("coopPoints")}`, {
                fontFamily: "Arial",
                fontSize: "18px",
                color: "#fff"
            }).setOrigin(.5);
        } else if(this.currentMode === 2){
            this.registry.set("vsPoints1", 0)
            this.registry.set("vsPoints2", 0)
            this.pointsText1 = this.add.text(width-100, 20 , `Puntos P1: ${this.registry.get("vsPoints1")}`, {
                fontFamily: "Arial",
                fontSize: "18px",
                color: "#fff"
            }).setOrigin(.5);
            this.pointsText2 = this.add.text(width-100, 40 , `Puntos P2: ${this.registry.get("vsPoints2")}`, {
                fontFamily: "Arial",
                fontSize: "18px",
                color: "#fff"
            }).setOrigin(.5);
        }
        
        this.timeLeft = 600000;

        this.timerText = this.add.text(width/2, 20 , "01:00", {
            fontFamily: "Arial",
            fontSize: "18px",
            color: "#fff"
        }).setOrigin(.5);

        this.updateTimer();

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.onSecond,
            callbackScope: this,
            loop: true
        })

        this.pedidosEnCola = 0;

        this.pedidosText = this.add.text(20, 20, `Pedidos en cola: ${this.pedidosEnCola}`, { fontSize: "16px", color: "#fff", fontFamily: "Arial" });
        this.scene.bringToTop("HUD");
    }

    onSecond(){
        this.timeLeft -= 1000;

        if(this.timeLeft < 0){
            this.timeLeft = 0;
            this.timerEvent.remove(false)
            
            const gameScene = this.scene.get("Game");
            if(gameScene && gameScene.onPlayerDeath){
                gameScene.onPlayerDeath("Se acabo el tiempo")
            }
        }

        this.updateTimer()
    }

    addPedidosEnCola(amount){
        this.pedidosEnCola += amount;
        this.pedidosText.setText(`Pedidos en cola: ${this.pedidosEnCola}`)
    }

    updatePoints(){
        if(this.currentMode === 1){
            this.pointsText.setText(`Puntos: ${this.registry.get("coopPoints")}`)
        } else if(this.currentMode === 2){
            this.pointsText1.setText(`Puntos P1: ${this.registry.get("vsPoints1")}`)
            this.pointsText2.setText(`Puntos P2: ${this.registry.get("vsPoints2")}`)
        }
    }

    subsPedidosEnCola(amount){
        this.pedidosEnCola -= amount;
        this.pedidosText.setText(`Pedidos en cola: ${this.pedidosEnCola}`)
    }

    getPedidosEnCola(){
        return this.pedidosEnCola;
    }

    updateTimer(){
        const totalSeconds = Math.floor(this.timeLeft / 1000);
        const minutes = Math.floor(totalSeconds/60);
        const seconds = totalSeconds%60;

        this.timerText.setText(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    }
}
