import InputSystem, { INPUT_ACTIONS } from "../../utils/InputSystem";
import { Boss } from "../classes/Boss";
import { Player } from "../classes/Player";

export class Caceria extends Phaser.Scene {
  constructor() {
    super("Caceria");
  }

  init(data) {
  }

  preload() {
    this.currentCycle = "preload";
    this.caceria = true;
    this.actualLevel = this.registry.get("actualLevel");
    console.log(`%cActual Level: ${this.actualLevel}`, "color: aqua")
    this.load.setPath("assets");
    this.currentMode = this.registry.get("mode");
    console.log(`%cModo de juego: ${this.currentMode}`, "color: yellow")
  }

  create() {
    this.gameScene = this.scene.get("Game");
    const { width, height } = this.scale;
    this.scene.bringToTop();

    this.musicaBoss1 = this.sound.add("musicaChacarera", { loop: true, volume: 0 });
    this.musicaBoss1.play()
    this.tweens.add({
      targets: this.musicaBoss1,
      volume: 1,        // volumen final
      duration: 3000,   // 3 segundos
      ease: 'Sine.easeInOut'
    });

    this.anims.create({
      key: "boss_attack_1",
      frames: this.anims.generateFrameNumbers("bossAttack1", { start: 0, end: 7 }),
      frameRate: 7,
      repeat: 0
    });
    this.anims.create({
      key: "boss_dash",
      frames: this.anims.generateFrameNumbers("bossAttack2", { start: 0, end: 7 }),
      frameRate: 4,
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

    this.add.image(320, 180, "backgroundCaceria");
    // this.nightOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000033, 0.6)
    //   .setOrigin(0)
    //   .setScrollFactor(0); //Esto crea la idea de que ya es de noche

    this.ambienteCaceria = this.sound.add("ambienteCaceria", { loop: true, volume: .2 }).play()

    this.player = new Player(this, (width / 2) - 200, 190, "player1", this.inputSystem);
    this.player2 = new Player(this, (width / 2) + 200, 190, "player2", this.inputSystem, 2);
    this.boss = new Boss(this, width / 2, height / 2 - 100, "bossAttack1");

    this.physics.add.collider(this.player, this.player2, () => {
      this.playersTouching = true;
    }, null, this);
    this.physics.add.collider(this.boss, this.player, () => {
      this.playersTouching = true;
    }, null, this);
    this.physics.add.collider(this.boss, this.player2, () => {
      this.playersTouching = true;
    }, null, this);

    //VIDAS
    this.player1Lives = 3;
    this.player2Lives = 3;
    this.lastDamageTimeP1 = 0;
    this.lastDamageTimeP2 = 0;
    // Corazones de Player 1 (izquierda)
    this.heartsP1 = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(30 + i * 40, 30, "heart").setScrollFactor(0).setScale(2);
      this.heartsP1.push(heart);
    }

    // Corazones de Player 2 (derecha)
    this.heartsP2 = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(this.scale.width - 30 - i * 40, 30, "heart")
        .setScrollFactor(0)
        .setScale(2);
      this.heartsP2.push(heart);
    }
    this.gameScene.ambienteBossAudio.play({
      volume: 0.3, // Ajusta el volumen
      rate: 1    // Ajusta el pitch
    });
  }

  damagePlayer(playerIndex) {
    const now = this.time.now;
    const cooldown = 1000; // 1 segundo

    if (playerIndex === 1) {
      if (now - this.lastDamageTimeP1 < cooldown || this.player.isDashing) return;
      this.lastDamageTimeP1 = now;
      this.player1Lives--;
      this._updateHearts(1);
      console.log(`Player 1 recibió daño (${this.player1Lives}/3)`);
      this.gameScene.golpeBossAudio.play({
        volume: 0.3, // Ajusta el volumen
        rate: Phaser.Math.FloatBetween(1.2, .8)    // Ajusta el pitch
      });
    } else if (playerIndex === 2) {
      if (now - this.lastDamageTimeP2 < cooldown || this.player2.isDashing) return;
      this.lastDamageTimeP2 = now;
      this.player2Lives--;
      this._updateHearts(2);
      console.log(`Player 2 recibió daño (${this.player2Lives}/3)`);
      this.gameScene.golpeBossAudio.play({
        volume: 0.3, // Ajusta el volumen
        rate: Phaser.Math.FloatBetween(1.2, .8)    // Ajusta el pitch
      });
    }
  }

  _updateHearts(playerIndex) {
    const hearts = playerIndex === 1 ? this.heartsP1 : this.heartsP2;
    const lives = playerIndex === 1 ? this.player1Lives : this.player2Lives;

    hearts.forEach((heart, i) => {
      heart.setVisible(i < lives);
    });

    if (lives <= 0) {
      console.log(`%cPlayer ${playerIndex} murió`, "color: red");
      if (playerIndex === 1) {
        this.player.setVisible(false);          // Lo oculta visualmente
        this.player.body.enable = false;        // Desactiva su colisión y movimiento
        this.player.active = false;             // Evita que Phaser lo actualice en colisiones
      } else {
        this.player2.setVisible(false);          // Lo oculta visualmente
        this.player2.body.enable = false;        // Desactiva su colisión y movimiento
        this.player2.active = false;
      }

      this.cameras.main.flash(300, 255, 0, 0); // parpadeo rojo breve

      if (this.player1Lives <= 0 && this.player2Lives <= 0) {
        console.log("%cAmbos jugadores murieron. Fin de la cacería.", "color: gray");

        // Esperar 2 segundos y volver al menú
        this.time.delayedCall(2000, () => {
          this.sound.stopAll();
          this.scene.start("Victory", { reason: "La criatura destruyó la parrilla", empate: false, completado: false, boss: true }); // <-- Cambiá por el nombre real de tu escena de menú
        });
      }
    }
  }

  update(t, dt) {
    if (this.player) this.player.update(dt);
    if (this.player2) this.player2.update(dt);
    if (this.boss) {
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
