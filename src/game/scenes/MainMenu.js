import InputSystem, { INPUT_ACTIONS } from "../../utils/InputSystem";
export class MainMenu extends Phaser.Scene {
    constructor() {
        super("MainMenu");
    }

    create() {

        this.inputSystem = new InputSystem(this.input);
        this.inputSystem.configureKeyboard({
            [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.W],
            [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.S],
            [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.A],
            [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.D],
            [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.X],
            [INPUT_ACTIONS.EAST]: [Phaser.Input.Keyboard.KeyCodes.C],
            [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.Z]
        }, "player1");
        this.inputSystem.configureKeyboard({
            [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.UP],
            [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.DOWN],
            [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.LEFT],
            [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.RIGHT],
            [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.K],
            [INPUT_ACTIONS.EAST]: [Phaser.Input.Keyboard.KeyCodes.L],
            [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.J]
        }, "player2");

        const { width, height } = this.scale;

        this.registry.set("actualLevel", 1);

        this.titleText = this.add.text(width / 2, height / 4, "POLLOS BIFES Y ACHICORIA: definitive edition", { fontSize: "32px", color: "#fff", fontFamily: "MyFont" }).setOrigin(0.5);
        this.coopText = this.add.text(width / 2, height / 2, "Coop", { fontSize: "32px", color: "#fff", fontFamily: "MyFont" }).setOrigin(0.5);
        this.versusText = this.add.text(width / 2, height / 1.5, "Versus", { fontSize: "32px", color: "#fff", fontFamily: "MyFont" }).setOrigin(0.5);

        this.selector = 1
        this.highlightText()
    }

    update() {

        if (this.inputSystem.isJustPressed(INPUT_ACTIONS.UP, "player1") || this.inputSystem.isJustPressed(INPUT_ACTIONS.UP, "player2")) {
            console.log("PA RRIBA")
            this.selector = Math.min(1, this.selector + 1)
            this.highlightText()
        }
        if (this.inputSystem.isJustPressed(INPUT_ACTIONS.DOWN, "player1") || this.inputSystem.isJustPressed(INPUT_ACTIONS.DOWN, "player2")) {
            console.log("PA BAJO")
            this.selector = Math.max(0, this.selector - 1)
            this.highlightText()

        }
        if (this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player1") || this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player2")) {
            console.log("SI SI SI SI")
            if (this.selector === 1) { // COOP
                this.registry.set("mode", 1);
                this.scene.start("Game");
                this.scene.launch("HUD"); // lanzar HUD encima del Game
            }
            if (this.selector === 0) { // VERSUS
                this.registry.set("mode", 2);
                this.scene.start("Game");
                this.scene.launch("HUD"); // lanzar HUD encima del Game
            }
        }

    }
    highlightText() {
        this.coopText.setColor("#fff");
        this.versusText.setColor("#fff");
        let text = null;
        if (this.selector === 1) text = this.coopText;
        if (this.selector === 0) text = this.versusText;
        text.setColor("#2ed12eff");
    }
}
