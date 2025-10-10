import { StateMachine } from "../state/StateMachine.js";
import { State } from "../state/State.js";
import { INPUT_ACTIONS } from "../../utils/InputSystem.js";

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, inputSystem, kind = 1,) {
    //INICIALIZANDO VARIABLES---------------------------------------
    super(scene, x, y, key);
    this.scene = scene;
    this.kind = kind;
    this.holdingItem = false;
    this.itemHolded = null;
    this.dashCooldown = 2000;
    this.isDashing = false;
    this.lastDash = 0;
    this.pushed = false;
    this.pushedDuration = 400;
    this.pushedTime = 0;
    this.inputId = this.kind === 1 ? "player1" : "player2";
    this.inputSystem = inputSystem;

    //MAQUINA DE ESTADO DE MOVIMIENTO -------------------------------
    this.movingSM = new StateMachine("idle");
    this.movingSM.addState("idle", new IdleState());
    this.movingSM.addState("moving", new MovingState());
    this.movingSM.addState("dashing", new DashingState());
    this.movingSM.changeState("idle", { player: this });

    //MAQUINA DE ESTADO DE HOLDEO ------------------------------------
    this.holdingSM = new StateMachine("none");
    this.holdingSM.addState("none", new HoldingNothingState())
    this.holdingSM.addState("ingredient", new HoldingIngredientState())
    this.holdingSM.changeState("none", { player: this });

    //AÑADIENDO A LA ESCENA ------------------------------------------
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.setDepth(8);
    // HITBOX CUSTOM: por ejemplo, 16x32 centrada
    this.body.setSize(16, 16);
    this.body.setOffset(1.5, 30); // Ajusta estos valores según tu sprite

    //ROMPER EL SPRITE SHEET
    const directions = ['down', 'up', 'left', 'right'];
    const dirStart = { down: 2, up: 3, left: 0, right: 1 };
    const dirEnd = { down: 2, up: 3, left: 0, right: 1 };


    directions.forEach(dir => {
      const animKey = `p${kind}_walk_${dir}`;
      if (!this.scene.anims.exists(animKey)) {
        this.scene.anims.create({
          key: animKey,
          frames: this.scene.anims.generateFrameNumbers(key, { start: dirStart[dir], end: dirEnd[dir] }),
          frameRate: 6,
          repeat: -1
        });
      }
    });

    //ULTIMOS ARREGLOS DE SPRITE -----------------------------------------

    this.refreshBody()
    this.setPushable(false)
    this.body.setCollideWorldBounds(true)
  }

  update(dt) {
    this.movingSM.update(dt);
    this.holdingSM.update(dt);

    this.lastDash += dt;
    this.pushedTime += dt;
    if (this.pushedDuration < this.pushedTime) {
      this.pushed = false;
    }
  }

  dash() {
    if (this.lastDash >= this.dashCooldown) {
      if (this.lastDirection) {
        this.movingSM.changeState("dashing", { player: this });
        this.lastDash = 0;
      }
    }
  }
}

class IdleState extends State {
  init(params) {
    this.player = params.player;
    console.log("Entering Idle State");
  }
  update(dt) {
    if (
      this.player.inputSystem.isPressed(INPUT_ACTIONS.UP, this.player.inputId) ||
      this.player.inputSystem.isPressed(INPUT_ACTIONS.DOWN, this.player.inputId) ||
      this.player.inputSystem.isPressed(INPUT_ACTIONS.LEFT, this.player.inputId) ||
      this.player.inputSystem.isPressed(INPUT_ACTIONS.RIGHT, this.player.inputId)
    ) {
      console.log("%ctaclas presionandose", "color: red")
      this.player.movingSM.changeState("moving", { player: this.player });
    }
  }
  finish() {
    this.player.clearTint();
    console.log("Exiting Idle State");
  }
}

class MovingState extends State {
  init(params) {
    console.log("Entering Moving State");
    this.player = params.player;

    this.stepTimer = 0;
    this.stepInterval = 300;
  }
  update(dt) {
    if (!this.player.pushed) {
      this.handleInput(dt);
    }
    // Si no se presiona ninguna tecla, vuelve a idle
    if (
      !this.player.inputSystem.isPressed(INPUT_ACTIONS.UP, this.player.inputId) &&
      !this.player.inputSystem.isPressed(INPUT_ACTIONS.DOWN, this.player.inputId) &&
      !this.player.inputSystem.isPressed(INPUT_ACTIONS.LEFT, this.player.inputId) &&
      !this.player.inputSystem.isPressed(INPUT_ACTIONS.RIGHT, this.player.inputId)
    ) {
      this.player.movingSM.changeState("idle", { player: this.player });
    }

    if (this.player.body.velocity.lengthSq() > 0) {
      this.player.lastDirection = this.player.body.velocity.clone().normalize();
    }


    this.stepTimer += dt;
    if (this.stepTimer >= this.stepInterval) {
      this.stepTimer = 0;
      this.player.scene.sound.play("caminar_pasto", { volume: .2, rate: Phaser.Math.FloatBetween(.8, 1.2) })
    }
  }
  handleInput(dt) {
    const speed = 200;
    let dir = null;

    if (this.player.inputSystem.isPressed(INPUT_ACTIONS.LEFT, this.player.inputId)) {
      this.player.body.setVelocityX(-speed);
      dir = 'left';
    }
    if (this.player.inputSystem.isPressed(INPUT_ACTIONS.RIGHT, this.player.inputId)) {
      this.player.body.setVelocityX(speed);
      dir = 'right';
    }
    if (this.player.inputSystem.isPressed(INPUT_ACTIONS.UP, this.player.inputId)) {
      this.player.body.setVelocityY(-speed);
      dir = 'up';
    }
    if (this.player.inputSystem.isPressed(INPUT_ACTIONS.DOWN, this.player.inputId)) {
      this.player.body.setVelocityY(speed);
      dir = 'down';
    }
    this.player.body.velocity.normalize().scale(speed);

    if (dir) {
      this.player.anims.play(`p${this.player.kind}_walk_${dir}`, true);
    }
  }
  finish() {
    // FX: Quita tint al salir de moving
    if (!this.player.pushed) {
      this.player.body.setVelocity(0);
    }
    this.player.clearTint();
    console.log("Exiting Moving State");
  }
}

class HoldingNothingState extends State {
  init(params) {
    this.player = params.player;
    this.player.holdingItem = false;
    this.player.itemHolded = null;
  }
  update(dt) {

  }

  finish() {

  }
}

class HoldingIngredientState extends State {
  init(params) {
    this.player = params.player;
    this.ingredient = params.ingredient;

    this.player.holdingItem = true;
    this.player.itemHolded = this.ingredient;

    this.player.itemHolded.setDepth(9)
    this.player.itemHolded.setPosition(this.player.body.center.x, this.player.body.center.y - 10);
    this.player.itemHolded.grabbed = true;
    this.player.itemHolded.setVisible(true)
  }
  update(dt) {
    this.player.itemHolded.setPosition(this.player.body.center.x, this.player.body.center.y - 10);
  }

  finish() {
    this.player.itemHolded.setDepth(7)
    this.player.holdingItem = false;
    this.player.itemHolded.setVisible(true);
    this.player.itemHolded.grabbed = false;
    this.player.itemHolded = null;
  }
}

class DashingState extends State {
  init(params) {
    this.player = params.player;

    this.dashDuration = 250;
    this.elapsed = 0;
    this.player.isDashing = true;

    const dashSpeed = 600;

    if (this.player.lastDirection) {
      this.player.body.setVelocity(
        this.player.lastDirection.x * dashSpeed,
        this.player.lastDirection.y * dashSpeed
      );
    }

    this.player.setTint(0xffff00); // feedback visual
    console.log("Entering Dashing State");
  }

  update(dt) {
    this.elapsed += dt;

    if (this.elapsed >= this.dashDuration) {
      if (
        this.player.inputSystem.isPressed(INPUT_ACTIONS.UP, this.player.inputId) ||
        this.player.inputSystem.isPressed(INPUT_ACTIONS.DOWN, this.player.inputId) ||
        this.player.inputSystem.isPressed(INPUT_ACTIONS.LEFT, this.player.inputId) ||
        this.player.inputSystem.isPressed(INPUT_ACTIONS.RIGHT, this.player.inputId)
      ) {
        this.player.movingSM.changeState("moving", { player: this.player });
      } else {
        this.player.movingSM.changeState("idle", { player: this.player });
      }
    }
  }

  finish() {
    this.player.clearTint();
    this.player.isDashing = false;
    this.player.body.setVelocity(0);
    console.log("Exiting Dashing State");
  }
}