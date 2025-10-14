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
    this.caceria = true;
    this.actualLevel = this.registry.get("actualLevel");
    console.log(`%cActual Level: ${this.actualLevel}`, "color: aqua")
    this.load.setPath("assets");
    this.currentMode = this.registry.get("mode");
    console.log(`%cModo de juego: ${this.currentMode}`, "color: yellow")

    //sprites---
    this.load.image("background", "BG_Dia.png")
    this.load.image("lobo", "Lobison pixelart.png")

    //sprite sheet ---------
    this.load.spritesheet("player1", "SS_PJ1.png",{frameWidth: 21, frameHeight: 45})
    this.load.spritesheet("player2", "SS_PJ2.png",{frameWidth: 21, frameHeight: 45})
    this.load.spritesheet("bossAttack1", "SS_Atack-1.png",{frameWidth: 197, frameHeight: 110})
  }

  create() {
    const { width, height } = this.scale;
    this.scene.bringToTop();
    this.anims.create({
      key: "boss_attack_1",
      frames: this.anims.generateFrameNumbers("bossAttack1", { start: 0, end: 7 }),
      frameRate: 8,
      repeat: 0
    });

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

    this.physics.add.collider(this.player, this.player2, () => {
      this.playersTouching = true;
    }, null, this);

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

    //PLAYER 1 ----------------------------------------------------------------------------
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player1")) {
      console.log("attack p1")
      this.player.attack()
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST, "player1")) {
      console.log("parry p1")
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH, "player1")) {
      console.log("dash p1")
      this.player.dash()
    }
    //PLAYER 2 ----------------------------------------------------------------------------
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player2")) {
      console.log("attack p2")
      this.player2.attack()
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST, "player2") && this.player2.holdingItem) {
      console.log("parry p2")
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH, "player2")) {
      console.log("dash p2")
      this.player2.dash()
    }

    if (this.playersTouching) {
      console.log("tocandose");
      if (this.player.isDashing) {
        this._pushPlayers(this.player, this.player2);
      }
      if (this.player2.isDashing) {
        this._pushPlayers(this.player2, this.player);
      }
      this.playersTouching = false; // reset para la siguiente frame
    }
  }

  _pushPlayers(p1, p2) {
    const dir = p1.lastDirection
    const force = 400;

    p2.pushed = true;
    p2.pushedTime = 0;
    p2.body.setVelocity(dir.x * force, dir.y * force);
  }
}
