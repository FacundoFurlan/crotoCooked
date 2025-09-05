import { Scene } from "phaser";
import { Player } from "../Player.js";
import { Boxes } from "../Boxes.js";

export class Game extends Scene {
  constructor() {
    super("Game");
    this.cycleText = null;
    this.currentCycle = "init";
    this.player = null;
  }

  init() {
    this.currentCycle = "init";
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
    this.boxesArray = []
    this.box1 = new Boxes(this, 300, 100, "pasta", 0x999999, 64);
    this.physics.add.collider(this.box1, this.player)
    this.boxesArray.push(this.box1);

    this.box2 = new Boxes(this, 400, 100, "meat", 0xffffff, 64);
    this.physics.add.collider(this.box2, this.player)
    this.boxesArray.push(this.box2);

    //Cursors
    this.actionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
  }

  update(t, dt) {
    this.currentCycle = "update";
    console.log("FR: ", dt/1000)
    
    this._getClosestBox();
    
    if (this.player) this.player.update(dt / 1000);
    if(this.box1) this.box1.update(dt)
    if(this.box2) this.box2.update(dt)

    if (Phaser.Input.Keyboard.JustDown(this.actionKey)) {
      if(this.nearestBox.activeBox){
        const circleColor = this.nearestBox.color;
        this.newCircle = this.giveCircleTo(this.player, circleColor);
        this.nearestBox.changeState("anim");
        console.log("Action key pressed!")

      } else{
        console.log("Action key pressed but no box in range")
      }
    }
    
  }

  _getClosestBox(){
    const player = this.player; //player reference
    if (!player || !player.body) return;

    this.nearestBox = null; //box reference
    this.minDist = Infinity;

    //buscar la caja más cercana
    for (const box of this.boxesArray) {
      const d2 = box.getDistSqToPlayer(player);

      if (d2 < this.minDist) {
        this.minDist = d2;
        this.nearestBox = box;
      }
    }

    //aplicar estado a las cajas
    for (const box of this.boxesArray) {
      if (box === this.nearestBox) box.markAsClosest(true, this.minDist);
      else box.markAsClosest(false, Infinity);
    }
  }
  
  //--------------------------------------todo esto es del circulo ingrediente temporal
  _getCircleTextureKey(color) {
    return `circle_${color.toString(16)}`;
  }

  _ensureCircleTexture(radius = 10, color = 0xffffff) {
    const key = this._getCircleTextureKey(color);
    if (!this.textures.exists(key)) {
      const g = this.add.graphics();
      g.fillStyle(color, 1);
      g.fillCircle(radius, radius, radius);
      g.generateTexture(key, radius * 2, radius * 2);
      g.destroy();
    }
    return key;
  }

  giveCircleTo(player, color) {
    const key = this._ensureCircleTexture(10, color);
    const circle = this.add.image(player.x, player.y - 28, key);
    circle.setDepth(10);
    // opcional: un pequeño feedback visual
    this.tweens.add({
      targets: circle,
      y: circle.y - 8,
      yoyo: true,
      duration: 120,
      repeat: 1
    });
    return circle;
  }
}
