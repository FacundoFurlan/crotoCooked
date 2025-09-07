export class MainMenu extends Phaser.Scene {
    constructor() {
        super("MainMenu");
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width/2, height/2, "MAIN MENU", { fontSize: "32px", color: "#fff", fontFamily: "Arial" }).setOrigin(0.5);

        // al hacer click -> ir a Game
        this.input.once("pointerdown", () => {
            this.scene.start("Game"); 
            this.scene.launch("HUD"); // lanzar HUD encima del Game
        });
    }
}
