import InputSystem, { INPUT_ACTIONS } from "../../utils/InputSystem";
import { DE, EN, ES, PT } from "../../utils/enums/languages";
import { FETCHED, FETCHING, READY, TODO } from "../../utils/enums/status";
import { getTranslations, getPhrase } from "../../utils/Translations";
import keys from "../../utils/enums/keys";
export class MainMenu extends Phaser.Scene {
    #textSpanish;
    #textGerman;
    #textEnglish;
    #textPortuguese;

    #updatedTextInScene;
    #updatedString = "Siguiente";
    #wasChangedLanguage = TODO;
    constructor() {
        super("MainMenu");
        const { next, hello, howAreU, language } = keys.sceneInitialMenu;
        this.#updatedString = next;
        this.hello = hello;
        this.howAreU = howAreU;
        this.language2 = language;
    }

    init({ language }) {
        this.language = language;
    }

    create() {

        this.language = this.language || ES;

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

        this.add.image(320, 180, "menuBG")
        this.westText = this.add.text(width / 1.2, height / 1.65, "juntar", {
            fontSize: "24px",
            color: "#303decff",
            fontFamily: "MyFont"
        }).setOrigin(0.5);

        this.westText.angle = 15

        this.southText = this.add.text(width / 1.1, height / 1.45, "dash", {
            fontSize: "24px",
            color: "#303decff",
            fontFamily: "MyFont"
        }).setOrigin(0.5);

        this.southText.angle = -10

        this.eastText = this.add.text(width / 1.05, height / 2, "lanzar", {
            fontSize: "24px",
            color: "#303decff",
            fontFamily: "MyFont"
        }).setOrigin(0.5);

        this.eastText.angle = 10

        this.menuText = this.add.text(width / 10, height / 7, "MENU", {
            fontSize: "50px",
            color: "#000000",
            fontFamily: "MyFont",
            stroke: "#fff",
            strokeThickness: 4,
        }).setOrigin(0);

        this.menuText.angle = -5

        //Titulo PByA
        this.polloText = this.add.text(width / 9, height / 3.7, "POLLO", {
            fontSize: "36px",
            color: "#fff",
            fontFamily: "MyFont"
        }).setOrigin(0);
        this.polloText.angle = -6

        this.bifesText = this.add.text(width / 8.5, height / 3, "BIFES Y", {
            fontSize: "36px",
            color: "#fff",
            fontFamily: "MyFont"
        }).setOrigin(0);
        this.bifesText.angle = -6

        this.achicoriaText = this.add.text(width / 8, height / 2.5, import.meta.env.VITE_TITLE, {
            fontSize: "36px",
            color: "#fff",
            fontFamily: "MyFont"
        }).setOrigin(0);
        this.achicoriaText.angle = -6

        //Botones
        this.coopText = this.add.text(width / 6, height / 2, "◦ Cooperativo", {
            fontSize: "24px",
            color: "#fff",
            fontFamily: "MyFont"
        }).setOrigin(0);
        this.coopText.angle = -5;

        this.versusText = this.add.text(width / 5.8, height / 1.8, "◦ Versus", {
            fontSize: "30px",
            color: "#fff",
            fontFamily: "MyFont"
        }).setOrigin(0);
        this.versusText.angle = -5;

        this.scoreboardText = this.add.text(width / 5.5, height / 1.6, "◦ Scoreboard", {
            fontSize: "24px",
            color: "#fff",
            fontFamily: "MyFont"
        }).setOrigin(0);
        this.scoreboardText.angle = -5;

        this.languageText = this.add.text(width / 5.25, height / 1.45, "◦ " + getPhrase(this.language2), {
            fontSize: "30px",
            color: "#fff",
            fontFamily: "MyFont"
        }
        ).setOrigin(0);
        this.languageText.angle = -5;

        this.#updatedTextInScene = this.languageText; // o cualquier texto que quieras

        this.selector = 3
        this.highlightText()
    }

    update() {

        if (this.#wasChangedLanguage === FETCHED) {
            this.#wasChangedLanguage = READY;
            this.#updatedTextInScene.setText(getPhrase(this.#updatedString));
            this.languageText.setText(getPhrase(this.language2));
        }



        if (this.inputSystem.isJustPressed(INPUT_ACTIONS.UP, "player1") || this.inputSystem.isJustPressed(INPUT_ACTIONS.UP, "player2")) {
            console.log("PA RRIBA")
            this.selector = Math.min(3, this.selector + 1)
            this.highlightText()
        }
        if (this.inputSystem.isJustPressed(INPUT_ACTIONS.DOWN, "player1") || this.inputSystem.isJustPressed(INPUT_ACTIONS.DOWN, "player2")) {
            console.log("PA BAJO")
            this.selector = Math.max(0, this.selector - 1)
            this.highlightText()

        }
        if (this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player1") || this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player2")) {
            console.log("SI SI SI SI")
            if (this.selector === 3) { // COOP
                this.registry.set("mode", 1);
                this.scene.start("Game");
                this.scene.launch("HUD"); // lanzar HUD encima del Game
            }
            if (this.selector === 2) { // VERSUS
                this.registry.set("mode", 2);
                this.scene.start("Game");
                this.scene.launch("HUD"); // lanzar HUD encima del Game
            }
            if (this.selector === 1) {// SCOREBOARD

            }
            if (this.selector === 0) { // LANGUAGE
                if (this.language === ES) {
                    this.getTranslations(EN)
                } else if (this.language === EN) {
                    this.getTranslations(ES)
                }
            }
        }

    }
    highlightText() {
        this.coopText.setColor("#fff");
        this.versusText.setColor("#fff");
        this.languageText.setColor("#fff");
        this.scoreboardText.setColor("#fff");
        let text = null;
        if (this.selector === 3) text = this.coopText;
        if (this.selector === 2) text = this.versusText;
        if (this.selector === 1) text = this.scoreboardText;
        if (this.selector === 0) text = this.languageText;
        text.setColor("#2ed12eff");
    }
    updateWasChangedLanguage = () => {
        this.#wasChangedLanguage = FETCHED;
    };

    async getTranslations(language) {
        this.language = language;
        this.#wasChangedLanguage = FETCHING;

        await getTranslations(language, this.updateWasChangedLanguage);
    }
}
