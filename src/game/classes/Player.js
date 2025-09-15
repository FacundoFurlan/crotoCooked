import { StateMachine } from "../state/StateMachine.js";
import { State } from "../state/State.js";

// Extiende de sprite y usa el asset "logo"
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    //INICIALIZANDO VARIABLES---------------------------------------
    super(scene, x, y, key);
    this.scene = scene;
    this.holdingItem = false;
    this.itemHolded = null;

    this.cursors = this.scene.input.keyboard.createCursorKeys();

    //MAQUINA DE ESTADO DE MOVIMIENTO -------------------------------
    this.movingSM = new StateMachine("idle");
    this.movingSM.addState("idle", new IdleState());
    this.movingSM.addState("moving", new MovingState());
    this.movingSM.changeState("idle", { player: this });

    //MAQUINA DE ESTADO DE HOLDEO ------------------------------------
    this.holdingSM = new StateMachine("none");
    this.holdingSM.addState("none", new HoldingNothingState())
    this.holdingSM.addState("ingredient", new HoldingIngredientState())
    this.holdingSM.changeState("none", {player: this});

    //AÑADIENDO A LA ESCENA ------------------------------------------
    this.scene.add.existing(this); // Agrega el sprite a la escena
    this.scene.physics.add.existing(this);

    //ANIMACION DEL IDLE ----------------------------------------------
    if (!this.scene.anims.exists('bChefIdle')) {
        this.scene.anims.create({
            key: 'bChefIdle',
            frames: this.scene.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
            frameRate: 4,   // fps, ajustalo a tu gusto
            repeat: -1      // -1 = loop infinito
        });
    }

    this.play('bChefIdle');

    //ULTIMOS ARREGLOS DE SPRITE -----------------------------------------
    this.setScale(1.3);
    console.log(this.getBounds())
    
    this.refreshBody()
    this.body.setCollideWorldBounds(true)
  }

  update(dt) {
    this.movingSM.update(dt);
    this.holdingSM.update(dt)
  }
}

class IdleState extends State {
  init(params) {
    this.player = params.player;
    // FX: Tint azul al entrar en idle
    this.player.setTint(0x3399ff);
    console.log("Entering Idle State");
  }
  update(dt) {
    // Si se presiona alguna tecla de movimiento, cambia a moving
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
    // FX: Quita tint al salir de idle
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
    this.handleInput(dt);
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

    this.stepTimer += dt;
    if(this.stepTimer >= this.stepInterval){
      this.stepTimer = 0;
      this.player.scene.sound.play("caminar_pasto_0", {volume: .1, rate: Phaser.Math.FloatBetween(.8,1.2)})
    }
  }
  handleInput(dt) {
    const cursors = this.player.cursors;
    const speed = 200;

    if (cursors.left.isDown) this.player.body.setVelocityX(-speed);
    if (cursors.right.isDown) this.player.body.setVelocityX(speed);
    if (cursors.up.isDown) this.player.body.setVelocityY(-speed);
    if (cursors.down.isDown) this.player.body.setVelocityY(speed);
    this.player.body.velocity.normalize().scale(speed); // opcional, para mover diagonal uniforme
  }
  finish() {
    // FX: Quita tint al salir de moving
    this.player.body.setVelocity(0); // reset cada frame
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
    this.player.itemHolded.setVisible(true)
  }
  update(dt) {
    this.player.itemHolded.setPosition(this.player.body.center.x, this.player.body.center.y);
  }

  finish() {
    this.player.holdingItem = false;
    this.player.itemHolded.setVisible(false);
    this.player.itemHolded = null;
  }
}
