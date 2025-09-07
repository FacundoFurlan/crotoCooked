import { Scene } from "phaser";
import { Player } from "../classes/Player.js";
import { IngredientBox } from "../classes/IngredientBox.js";
import { KitchenBox } from "../classes/kitchenBox.js";
import { Task } from "../classes/Tasks.js";

export class Game extends Scene {
  constructor() {
    super("Game");
    this.cycleText = null;
    this.currentCycle = "init";
    this.player = null;
  }

  init() {
    this.currentCycle = "init";

    this.input.once('pointerdown', () => { //esto es para evitar un warning molesto del audio
      if (this.sound.context.state === 'suspended') {
          this.sound.context.resume();
      }
    });
  }

  preload() {
    this.currentCycle = "preload";
    this.load.setPath("assets");
    this.load.image("background", "grass.jpg");

    this.load.spritesheet("bchef", "bCheff1.png",{frameWidth: 20, frameHeight: 36})
  }

  create() {
    this.currentCycle = "create";
    this.add.image(640, 360, "background");
    this.player = new Player(this, 640, 360, "bchef");

    //Cajas---------------------------------------------------------------
    this.boxes = []

    this.box1 = new IngredientBox(this, 300, 100, "pasta", 0x555555, 64);
    this.physics.add.collider(this.box1, this.player)
    this.boxes.push(this.box1);

    this.box2 = new IngredientBox(this, 400, 100, "meat", 0xffffff, 64);
    this.physics.add.collider(this.box2, this.player)
    this.boxes.push(this.box2);
    
    this.kitchenBox1 = new KitchenBox(this, 400, 400, 0xaaaaaa, 128)
    this.physics.add.collider(this.player, this.kitchenBox1)
    this.boxes.push(this.kitchenBox1);

    this.pedido1 = new Task(this, 300, 600, 0xaaaaaa, 64)
    this.physics.add.collider(this.player, this.pedido1)
    this.boxes.push(this.pedido1);


    //Cursors
    this.actionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.cancelKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.victoryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    this.DefeatKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
  }

  update(t, dt) {
    this.currentCycle = "update";
    // console.log("FR: ", dt/1000)
    
    this._getClosestBox();
    
    if (this.player) this.player.update(dt);
    if (this.box1) this.box1.update(dt)
    if (this.box2) this.box2.update(dt)
    if (this.kitchenBox1) this.kitchenBox1.update(dt)
    if (this.pedido1) this.pedido1.update(dt)

    if (Phaser.Input.Keyboard.JustDown(this.actionKey)) {
      if(this.nearestBox.activeBox){
        this.nearestBox.onInteract(this.player)
        console.log("Action key pressed!")
      } else{
        console.log("Action key pressed but no box in range")
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.cancelKey)) {
      if(this.player.holdingItem){
        this.player.holdingSM.changeState("none", {player: this.player})

      } else{
        console.log("Cancel key pressed but no box in range")
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.victoryKey)) {
      this.finishLevel();
    }
    if (Phaser.Input.Keyboard.JustDown(this.DefeatKey)) {
      this.onPlayerDeath();
    }
    
  }

  _getClosestBox(){
    const player = this.player; //player reference
    if (!player || !player.body) return;

    this.nearestBox = null; //box reference
    this.minDist = Infinity;

    //buscar la caja más cercana
    for (const box of this.boxes) {
      const d2 = box.getDistSqToPlayer(player);

      if (d2 < this.minDist) {
        this.minDist = d2;
        this.nearestBox = box;
      }
    }

    //aplicar estado a las cajas
    for (const box of this.boxes) {
      if (box === this.nearestBox) box.markAsClosest(true, this.minDist);
      else box.markAsClosest(false, Infinity);
    }
  }

  finishLevel() {
    const score = this.playerScore ?? 0;
    // Detenemos el HUD y lanzamos la escena de victoria
    this.scene.stop("HUD");
    // Opcional: animación de cámara antes de cambiar (fade)
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("Victory", { score: score });
    });
  }

  onPlayerDeath(reason) {
    const score = this.playerScore ?? 0;
    this.scene.stop("HUD");
    this.cameras.main.fadeOut(400);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("Defeat", { reason, score });
    });
  }
}
