import { StateMachine } from "../state/StateMachine.js";
import { State } from "../state/State.js";

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, kind = 1) {
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

    if (kind === 1) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
    } else if (kind === 2) {
      this.cursors = {
        left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      };
    }

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
    this.holdingSM.changeState("none", {player: this});

    //AÑADIENDO A LA ESCENA ------------------------------------------
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    //ROMPER EL SPRITE SHEET
    const directions = ['down', 'up', 'left', 'right'];
    const dirStart = { down: 2, up: 3, left: 0, right: 1 };
    const dirEnd   = { down: 2, up: 3, left: 0, right: 1 };


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
    if(this.pushedDuration < this.pushedTime){
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
    const cursors = this.player.cursors;
    if (
      cursors.left.isDown ||
      cursors.right.isDown ||
      cursors.up.isDown ||
      cursors.down.isDown
    ) {
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
    if(!this.player.pushed){
      this.handleInput(dt);
    }
    // Si no se presiona ninguna tecla, vuelve a idle
    const cursors = this.player.cursors;
    if (
      !cursors.left.isDown &&
      !cursors.right.isDown &&
      !cursors.up.isDown &&
      !cursors.down.isDown
    ) {
      this.player.movingSM.changeState("idle", { player: this.player });
    }

    if (this.player.body.velocity.lengthSq() > 0) {
      this.player.lastDirection = this.player.body.velocity.clone().normalize();
    }


    this.stepTimer += dt;
    if(this.stepTimer >= this.stepInterval){
      this.stepTimer = 0;
      this.player.scene.sound.play("caminar_pasto_0", {volume: .1, rate: Phaser.Math.FloatBetween(.8,1.2)})
    }
  }
  handleInput(dt) {
    const cursors = this.player.cursors;
    const speed = 200;
    let dir = null;

    if (cursors.left.isDown) { 
      this.player.body.setVelocityX(-speed); 
      dir = 'left';
    }
    if (cursors.right.isDown) { 
      this.player.body.setVelocityX(speed); 
      dir = 'right';
    }
    if (cursors.up.isDown) { 
      this.player.body.setVelocityY(-speed); 
      dir = 'up';
    }
    if (cursors.down.isDown) { 
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
    
    this.player.itemHolded.setPosition(this.player.body.center.x, this.player.body.center.y);
    this.player.itemHolded.grabbed = true;
    this.player.itemHolded.setVisible(true)
  }
  update(dt) {
    this.player.itemHolded.setPosition(this.player.body.center.x, this.player.body.center.y);
  }
  
  finish() {
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
      const cursors = this.player.cursors;
      if (
        cursors.left.isDown ||
        cursors.right.isDown ||
        cursors.up.isDown ||
        cursors.down.isDown
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