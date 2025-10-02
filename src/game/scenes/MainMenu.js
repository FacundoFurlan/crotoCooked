export class MainMenu extends Phaser.Scene {
    constructor() {
        super("MainMenu");
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width/2, height/2, "Press A for coop, B for vs", { fontSize: "32px", color: "#fff", fontFamily: "MyFont" }).setOrigin(0.5);
        
        this.coopKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.vsKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    }
    
    update(){
        if(Phaser.Input.Keyboard.JustDown(this.coopKey)){
            this.registry.set("mode", 1);
            this.scene.start("Game"); 
            this.scene.launch("HUD"); // lanzar HUD encima del Game
        }
        if(Phaser.Input.Keyboard.JustDown(this.vsKey)){
            this.registry.set("mode", 2);
            this.scene.start("Game"); 
            this.scene.launch("HUD"); // lanzar HUD encima del Game
        }
    }
}
