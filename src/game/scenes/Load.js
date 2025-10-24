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
        
        const sabiasQueText = this.add.text(width / 2, height / 2 - 150, "Sabías qué?", {
            fontFamily: "MyFont",
            fontSize: "20px",
            color: "#ffffff"
        }).setOrigin(0.5);
        
        let arrayWierdPhrases = [
            "El primer gol olímpico de la historia fue argentino",
            "En Mendoza, hace más de 4.000 años cayó una lluvia de meteoritos gigantes",
            "En la Patagonia se halló el Argentinosaurus, uno de los más grandes",
            "El primer vehículo blindado de Latinoamérica fue argentino: el Yacaré",
            "En Buenos Aires hay más psicólogos per cápita que en cualquier otra ciudad del mundo.",
            "En Argentina se realizó la primera transmisión radial pública del mundo",
            "El colectivo (bus urbano) fue inventado en Argentina en 1928",
            "Argentina ganó tres Copas del Mundo en Fútbol (1978, 1986 y 2022)",
            "Argentina fue campeona del primer Mundial de Básquet",
            "El Argentino Favaloro inventó el bypass, salvando millones de vidas",
            "El semaforo peatonal se inventó en Rosario",
            "La birome o bolígrafo fue inventado por un argentino"
        ]
        
        const randomPhrase = arrayWierdPhrases[Math.floor(Math.random() * arrayWierdPhrases.length)];
        
        
        this.add.image(width, height, "hoja").setOrigin(1, 1)

        const randomPhraseText = this.add.text(width / 2, height / 2 - 120, randomPhrase, {
            fontFamily: "MyFont",
            fontSize: "20px",
            color: "#ffffff"
        }).setOrigin(0.5);
        // Tiempo total de la “carga”
        this.totalTime = 5000; // 5 segundos
        this.elapsed = 0;
        this.ready = false;

        const loaderSprite = this.add.sprite(width / 2, (height / 2)+130 , "campana").setScale(2);
        this.tweens.add({
            targets: loaderSprite,
            scale: 3,
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        // Variables de progreso
        this.totalTime = 5000;
        this.elapsed = 0;
        this.ready = false;

        // Input
        this.input.keyboard.on("keydown", () => {
            if (this.ready) this.startNextScene();
        });

        const loadingText = this.add.text(width/2, height/2, "", {
            fontFamily: "MyFont",
            fontSize: "20px",
            color: "#ffffff"
        }).setOrigin(0.5);

        // Guardamos referencias
        this.loadingText = loadingText;
        this.loaderSprite = loaderSprite;
    }

    update(time, delta) {
        if (!this.ready) {
            this.elapsed += delta;
            const progress = Phaser.Math.Clamp(this.elapsed / this.totalTime, 0, 1);


            if (progress >= 1) {
                this.ready = true;
                this.loadingText.setText("Presiona cualquier tecla para continuar");

                // Al finalizar, podés hacer que el sprite “celebre”
                this.tweens.add({
                    targets: this.loaderSprite,
                    scale: 5,
                    duration: 400,
                    yoyo: true,
                    ease: "Back.easeOut"
                });
            }
        }

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