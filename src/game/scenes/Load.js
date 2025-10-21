import InputSystem, { INPUT_ACTIONS } from "../../utils/InputSystem";
export class Load extends Phaser.Scene {
    constructor() {
        super("Load");
    }

    init(data) {
        // Recibe el nombre de la próxima escena
        this.nextScene = data.nextScene || "MainMenu"; // valor por defecto
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

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fondo barra
        this.add.rectangle(width / 2, height / 2, 320, 50, 0x222222);
        const progressBar = this.add.rectangle(width / 2 - 150, height / 2, 0, 30, 0xffffff).setOrigin(0, 0.5);


        const loadingText = this.add.text(width / 2, height / 2 - 50, "Loading...", {
            fontFamily: "MyFont",
            fontSize: "20px",
            color: "#ffffff"
        }).setOrigin(0.5);

        const percentText = this.add.text(width / 2, height / 2 + 30, "0%", {
            fontFamily: "MyFont",
            fontSize: "18px",
            color: "#ffffff"
        }).setOrigin(0.5);


        this.add.image(width, height, "hoja").setOrigin(1, 1)
        if (this.nextScene === "Caceria") {
            this.westText = this.add.text(width / 2 + 210, height / 2 + 35, "atacar", { fontSize: "24px", color: "#303decff", fontFamily: "MyFont" }).setOrigin(0.5);
            this.westText.angle = 25
            this.southText = this.add.text(width / 2 + 260, height / 2 + 70, "dash", { fontSize: "24px", color: "#303decff", fontFamily: "MyFont" }).setOrigin(0.5);
            this.southText.angle = -10
            this.eastText = this.add.text(width / 2 + 280, height / 2 - 0, "", { fontSize: "24px", color: "#303decff", fontFamily: "MyFont" }).setOrigin(0.5);
            this.eastText.angle = 10
        } else if (this.nextScene === "Game") {
            this.westText = this.add.text(width / 2 + 210, height / 2 + 40, "juntar", { fontSize: "24px", color: "#303decff", fontFamily: "MyFont" }).setOrigin(0.5);
            this.westText.angle = 15
            this.southText = this.add.text(width / 2 + 260, height / 2 + 70, "dash", { fontSize: "24px", color: "#303decff", fontFamily: "MyFont" }).setOrigin(0.5);
            this.southText.angle = -10
            this.eastText = this.add.text(width / 2 + 280, height / 2 - 0, "lanzar", { fontSize: "24px", color: "#303decff", fontFamily: "MyFont" }).setOrigin(0.5);
            this.eastText.angle = 10
        }
        // Tiempo total de la “carga”
        this.totalTime = 5000; // 5 segundos
        this.elapsed = 0;
        this.ready = false;

        // Input de teclado
        this.input.keyboard.on("keydown", () => {
            if (this.ready) {
                this.startNextScene();
            }
        });

        // Guardamos referencias
        this.progressBar = progressBar;
        this.percentText = percentText;
        this.loadingText = loadingText;
    }

    update(time, delta) {
        if (!this.ready) {
            this.elapsed += delta;
            const progress = Phaser.Math.Clamp(this.elapsed / this.totalTime, 0, 1);

            // Actualizar visual
            this.progressBar.width = 300 * progress;
            this.percentText.setText(Math.floor(progress * 100) + "%");

            // Al terminar el tiempo
            if (progress >= 1) {
                this.ready = true;
                this.loadingText.setText("Presiona cualquier tecla para continuar");
            }
        }
        // Si está listo, también aceptar acciones de InputSystem
        if (this.ready) {
            if (
                this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH, "player1") ||
                this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST, "player1") ||
                this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player1") ||
                this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH, "player2") ||
                this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST, "player2") ||
                this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player2")
            ) {
                this.startNextScene();
            }
        }
    }

    startNextScene() {
        this.scene.start(this.nextScene);
    }
}