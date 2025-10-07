import InputSystem, { INPUT_ACTIONS } from "../../utils/InputSystem";
import { Boss } from "../classes/boss";
import { Player } from "../classes/Player";

export class Caceria extends Phaser.Scene {
  constructor() {
    super("Caceria");
  }

  init(data) {
  }

  preload(){
    this.currentCycle = "preload";
    this.actualLevel = this.registry.get("actualLevel");
    console.log(`%cActual Level: ${this.actualLevel}`, "color: aqua")
    this.load.setPath("assets");
    this.currentMode = this.registry.get("mode");
    console.log(`%cModo de juego: ${this.currentMode}`, "color: yellow")

    //sprites---
    this.load.image("background", "BG_Dia.png")
    this.load.image("lobo", "lobizonPlaceHolder.png")

    //sprite sheet ---------
    this.load.spritesheet("player1", "SS_PJ1.png",{frameWidth: 21, frameHeight: 45})
    this.load.spritesheet("player2", "SS_PJ2.png",{frameWidth: 21, frameHeight: 45})
  }

  create() {
    const { width, height } = this.scale;
    this.scene.bringToTop();

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

    this.add.image(320,180, "background");
    this.nightOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000033, 0.6)
    .setOrigin(0)
    .setScrollFactor(0); //Esto crea la idea de que ya es de noche

    this.player = new Player(this, 640, 360, "player1", this.inputSystem);
    this.player2 = new Player(this, 440, 360, "player2", this.inputSystem, 2);
    this.boss = new Boss(this, width/2, height/2 - 100, "lobo");

    this.add.text(width/2, height/2 - 60, "Caceria", {
      fontFamily: "MyFont",
      fontSize: "48px",
      color: "#ff5555",
      align: "center"
    }).setOrigin(0.5);

  }

  update(t, dt){
    if (this.player) this.player.update(dt);
    if (this.player2) this.player2.update(dt);
    if (this.boss){
      this.boss.update(dt);
    } 
  }
}
