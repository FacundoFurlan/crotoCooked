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
        this.westText = this.add.text(width / 2 + 210, height / 2 + 40, "juntar", { fontSize: "24px", color: "#303decff", fontFamily: "MyFont" }).setOrigin(0.5);
        this.westText.angle = 15
        this.southText = this.add.text(width / 2 + 260, height / 2 + 70, "dash", { fontSize: "24px", color: "#303decff", fontFamily: "MyFont" }).setOrigin(0.5);
        this.southText.angle = -10
        this.eastText = this.add.text(width / 2 + 280, height / 2 - 0, "lanzar", { fontSize: "24px", color: "#303decff", fontFamily: "MyFont" }).setOrigin(0.5);
        this.eastText.angle = 10

        this.titleText1 = this.add.text(width / 2 - 186, height / 4, "POLLO, BIFES", { fontSize: "30px", color: "#fff", fontFamily: "MyFont" }).setOrigin(0.5);
        this.titleText1.angle = -5
        this.titleText1 = this.add.text(width / 2 - 182, height / 4 + 20, "Y ACHICORIA", { fontSize: "30px", color: "#fff", fontFamily: "MyFont" }).setOrigin(0.5);
        this.titleText1.angle = -5
        this.coopText = this.add.text(width / 2 - 170, height / 2.3, "Coop", { fontSize: "30px", color: "#fff", fontFamily: "MyFont" }).setOrigin(0.5);
        this.versusText = this.add.text(width / 2 - 160, height / 1.8, "Versus", { fontSize: "30px", color: "#fff", fontFamily: "MyFont" }).setOrigin(0.5);

        this.languageText = this.add.text(
            width / 2 - 150,
            height / 1.5,
            getPhrase(this.language2),
            {
                fontSize: "30px", color: "#fff", fontFamily: "MyFont"
            }
        ).setOrigin(0.5);

        this.coopText.angle = -5;
        this.versusText.angle = -5;
        this.languageText.angle = -5;

        this.#updatedTextInScene = this.languageText; // o cualquier texto que quieras

        this.selector = 2
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
            this.selector = Math.min(2, this.selector + 1)
            this.highlightText()
        }
        if (this.inputSystem.isJustPressed(INPUT_ACTIONS.DOWN, "player1") || this.inputSystem.isJustPressed(INPUT_ACTIONS.DOWN, "player2")) {
            console.log("PA BAJO")
            this.selector = Math.max(0, this.selector - 1)
            this.highlightText()

        }
        if (this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player1") || this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player2")) {
            console.log("SI SI SI SI")
            if (this.selector === 2) { // COOP
                this.registry.set("mode", 1);
                this.scene.start("Game");
                this.scene.launch("HUD"); // lanzar HUD encima del Game
            }
            if (this.selector === 1) { // VERSUS
                this.registry.set("mode", 2);
                this.scene.start("Game");
                this.scene.launch("HUD"); // lanzar HUD encima del Game
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
        let text = null;
        if (this.selector === 2) text = this.coopText;
        if (this.selector === 1) text = this.versusText;
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
