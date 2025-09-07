export class HUD extends Phaser.Scene {
    constructor() {
        super("HUD");
    }

    create() {
        const {width} = this.scale;

        this.timeLeft = 60000;

        this.timerText = this.add.text(width/2, 20 , "01:00", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#fff"
        }).setOrigin(.5);

        this.updateTimer();

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.onSecond,
            callbackScope: this,
            loop: true
        })


        this.add.text(20, 20, "HUD: Puntaje 0", { fontSize: "32px", color: "#fff", fontFamily: "Arial" });
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

    updateTimer(){
        const totalSeconds = Math.floor(this.timeLeft / 1000);
        const minutes = Math.floor(totalSeconds/60);
        const seconds = totalSeconds%60;

        this.timerText.setText(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    }
}
