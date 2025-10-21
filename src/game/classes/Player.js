import { StateMachine } from "../state/StateMachine.js";
import { State } from "../state/State.js";
import { INPUT_ACTIONS } from "../../utils/InputSystem.js";

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, inputSystem, kind = 1,) {
    //INICIALIZANDO VARIABLES---------------------------------------
    super(scene, x, y, key);
    this.scene = scene;
    this.kind = kind;
    this.caceria = this.scene.caceria;
    this.holdingItem = false;
    this.itemHolded = null;
    this.dashCooldown = 1000;
    this.isDashing = false;
    this.lastDash = 0;
    this.pushed = false;
    this.pushedDuration = 400;
    this.pushedTime = 0;
    this.inputId = this.kind === 1 ? "player1" : "player2";
    this.inputSystem = inputSystem;
    this.attackCooldown = 250; // 500 ms
    this.lastAttack = 0;
    this.gameScene = this.scene.scene.get("Game");

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
    this.body.setSize(22, 22);
    this.body.setOffset(4, 25); // Ajusta estos valores según tu sprite

    //ROMPER EL SPRITE SHEET
    const directions = ['down', 'up', 'left', 'right'];
    const dirStart = { down: 6, up: 30, left: 0, right: 24 };
    const dirEnd = { down: 9, up: 33, left: 3, right: 27 };

    this.idleFrames = {
      down: 6,  // primer frame de abajo
      up: 30,   // primer frame de arriba
      left: 0,  // primer frame de izquierda
      right: 24 // primer frame de derecha
    };


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

    if (!this.scene.anims.exists(`p${kind}_Attack`)) {
      this.scene.anims.create({
        key: `p${kind}_Attack`,
        frames: this.scene.anims.generateFrameNumbers(`player${kind}Attack`, { start: 0, end: 2 }),
        frameRate: null,
        frameDuration: 83,
        repeat: 0
      });
    }
    if (!this.scene.anims.exists(`p_attack_woosh`)) {
      this.scene.anims.create({
        key: `p_attack_woosh`,
        frames: this.scene.anims.generateFrameNumbers(`playerAttackWoosh`, { start: 0, end: 2 }),
        frameRate: null,
        frameDuration: 83,
        repeat: 0
      });
    }

    //ULTIMOS ARREGLOS DE SPRITE -----------------------------------------

    this.refreshBody()
    this.setPushable(false)
    this.body.setCollideWorldBounds(true)
  }

  attack() {
    // No ataques si ya estás haciendo dash o empujado
    if (this.isDashing || this.pushed || !this.caceria || !this.active) return;
    if (this.lastAttack < this.attackCooldown) return; // todavía en cooldown
    this.lastAttack = 0;
    this.isAttacking = true;

    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isAttacking = false;
    });

    // Determinar dirección del ataque
    let dir = "right";
    if (this.lastDirection) {
      dir = this.getDirectionFromVector(this.lastDirection);
      if (dir === "up" || dir === "down") {
        if (Math.abs(this.lastDirection.x) > 0) {
          dir = this.lastDirection.x > 0 ? "right" : "left";
        } else {
          dir = "right";
        }
      }
    }

    if (dir === "left") {
      this.setFlipX(true);
    } else {
      this.setFlipX(false);
    }

    const animKey = `p${this.kind}_Attack`;
    this.anims.play(animKey, true);
    this.gameScene.dashAudio.play({
      volume: 0.3, // Ajusta el volumen
      rate: Phaser.Math.FloatBetween(1.2, 1.6)    // Ajusta el pitch
    });
    this.body.setVelocity(0);

    //woosh aca
    const offset = 20;
    const dirVec = dir === "left" ? new Phaser.Math.Vector2(-1, 0) : new Phaser.Math.Vector2(1, 0);
    const attackX = this.x + dirVec.x * offset;
    const attackY = this.y;

    const woosh = this.scene.add.sprite(attackX, attackY, "playerAttackWoosh");
    woosh.play("p_attack_woosh");
    woosh.setDepth(9);
    if (dir === "left") {
      woosh.setFlipX(true);
    } else {
      woosh.setFlipX(false);
    }

    this.scene.physics.add.existing(woosh);
    woosh.body.setAllowGravity(false);
    woosh.body.setImmovable(true);

    this.scene.physics.add.overlap(woosh, this.scene.boss, (hitbox, boss) => {
      if (boss.isAlive && !woosh.hasHit) {
        boss.takeDamage(25, this.kind);
        woosh.hasHit = true;
      }
    });

    woosh.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      woosh.destroy()
    })

    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isAttacking = false;
      this.setFlipX(false);
      if (this.lastDirection) {
        const dir = this.getDirectionFromVector(this.lastDirection);
        this.setFrame(this.idleFrames[dir]);
      }
    });

  }


  update(dt) {
    if (this.isAttacking) {
      this.body.setVelocity(0);
      this.lastAttack += dt;
      this.lastDash += dt;
      this.pushedTime += dt;
      return; // no moverse mientras ataca
    }
    this.movingSM.update(dt);
    this.holdingSM.update(dt);

    this.lastAttack += dt;
    this.lastDash += dt;
    this.pushedTime += dt;
    if (this.pushedDuration < this.pushedTime) {
      this.pushed = false;
    }
  }

  getDirectionFromVector(vec) {
    if (Math.abs(vec.x) > Math.abs(vec.y)) {
      return vec.x > 0 ? 'right' : 'left';
    } else {
      return vec.y > 0 ? 'down' : 'up';
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
  }
  update(dt) {
    if (
      this.player.inputSystem.isPressed(INPUT_ACTIONS.UP, this.player.inputId) ||
      this.player.inputSystem.isPressed(INPUT_ACTIONS.DOWN, this.player.inputId) ||
      this.player.inputSystem.isPressed(INPUT_ACTIONS.LEFT, this.player.inputId) ||
      this.player.inputSystem.isPressed(INPUT_ACTIONS.RIGHT, this.player.inputId)
    ) {
      this.player.movingSM.changeState("moving", { player: this.player });
    } else {
      // SETEAR SPRITE QUIETO
      const dir = this.player.lastDirection ? this.player.getDirectionFromVector(this.player.lastDirection) : 'down';
      this.player.setFrame(this.player.idleFrames[dir]);
      this.player.anims.stop(); // Esto corta cualquier animación que estuviera corriendo
      this.player.body.setVelocity(0);
    }
  }
  finish() {
    this.player.clearTint();
  }
}

class MovingState extends State {
  init(params) {
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
      this.player.gameScene.caminarAudio.play({
        volume: .2,
        rate: Phaser.Math.FloatBetween(.8, 1.2)
      })
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

    // Setear frame de idle según última dirección
    if (this.player.lastDirection) {
      const dir = this.player.getDirectionFromVector(this.player.lastDirection);
      this.player.setFrame(this.player.idleFrames[dir]);
    } else {
      this.player.setFrame(this.player.idleFrames.down);
    }
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
    this.player.gameScene.agarrarAudio.play({
      volume: .1,
      rate: 1.2
    })
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
    this.player.gameScene.agarrarAudio.play({
      volume: .1,
      rate: .8
    })
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
    const dir = this.player.getDirectionFromVector(this.player.lastDirection);
    const dashFrames = {
      down: 10,   // frame de dash hacia abajo
      up: 34,    // frame de dash hacia arriba
      left: 4,   // frame de dash hacia izquierda
      right: 28  // frame de dash hacia derecha
    };
    this.player.setFrame(dashFrames[dir]);
    this.player.setTint(0xffff00); // feedback visual
    this.player.gameScene.dashAudio.play({
      volume: 0.5, // Ajusta el volumen
      rate: Phaser.Math.FloatBetween(1, 1.4)    // Ajusta el pitch
    });
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

    // Setear frame de idle según última dirección
    if (this.player.lastDirection) {
      const dir = this.player.getDirectionFromVector(this.player.lastDirection);
      this.player.setFrame(this.player.idleFrames[dir]);
    } else {
      this.player.setFrame(this.player.idleFrames.down);
    }
  }
}