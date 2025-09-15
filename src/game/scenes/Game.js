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

    //SPRITES---------------------------------------
    this.load.image("background", "grass.jpg");
    this.load.image("mesa", "SS_Mesa.png");
    this.load.image("freidora", "SS_Freidora_0.png");
    this.load.image("freidoraOn", "SS_Freidora_1.png");
    this.load.image("asador", "SS_Asador_0.png");
    this.load.image("asadorOn", "SS_Asador_1.png");
    this.load.image("caja", "SS_Caja.png");
    this.load.image("orden", "SS_Orden.png");
    
    //AUDIO----------------------------------------
    this.load.audio("caminar_pasto_0", "./audio/PJ_Caminar_Pasto_0.mp3");
    this.load.audio("coccion_0", "./audio/Coccion_0.mp3");
    this.load.audio("picar_0", "./audio/Picar_0.mp3");
    this.load.audio("fritar_0", "./audio/Fritar_0.mp3");

    //SPRITESHEETS--------------------------------
    this.load.spritesheet("bchef", "bCheff1.png",{frameWidth: 20, frameHeight: 36})
    this.load.spritesheet("ingredientesAtlas", "SS_Ingredientes.png",{frameWidth: 20, frameHeight: 20})
  }
  
  create() {
    this.currentCycle = "create";

    //INDICES ATLAS---------------------------------------------------------
    this.ingredientesAtlas = {
      achicoria_0: {index: 0, hasPrev: false, hasNext: true, prev: null, next: "achicoria_1", isWorkedOn: {mesa: true, freidora: false, asador: false}},
      achicoria_1: {index: 1, hasPrev: true, hasNext: false, prev: "achicoria_0", next: null, isWorkedOn: {mesa: false, freidora: false, asador: false}},
      carbon_0: {index: 2, hasPrev: false, hasNext: false, prev: null, next: null, isWorkedOn: {mesa: false, freidora: false, asador: true}},
      pollo_0: {index: 5, hasPrev: false, hasNext: true, prev: null, next: "pollo_1", isWorkedOn: {mesa: false, freidora: false, asador: true}},
      pollo_1: {index: 6, hasPrev: true, hasNext: true, prev: "pollo_0", next: "pollo_2", isWorkedOn: {mesa: false, freidora: false, asador: true}},
      pollo_2: {index: 7, hasPrev: true, hasNext: true, prev: "pollo_1", next: "pollo_3", isWorkedOn: {mesa: false, freidora: false, asador: true}},
      pollo_3: {index: 8, hasPrev: true, hasNext: true, prev: "pollo_2", next: "pollo_4", isWorkedOn: {mesa: false, freidora: false, asador: true}},
      pollo_4: {index: 9, hasPrev: true, hasNext: false, prev: "pollo_3", next: null, isWorkedOn: {mesa: false, freidora: false, asador: false}},
      papa_0: {index: 10, hasPrev: false, hasNext: true, prev: null, next: "papa_1", isWorkedOn: {mesa: true, freidora: false, asador: false}},
      papa_1: {index: 11, hasPrev: true, hasNext: true, prev: "papa_0", next: "papa_2", isWorkedOn: {mesa: false, freidora: true, asador: false}},
      papa_2: {index: 12, hasPrev: true, hasNext: true, prev: "papa_1", next: "papa_3", isWorkedOn: {mesa: false, freidora: true, asador: false}},
      papa_3: {index: 13, hasPrev: true, hasNext: false, prev: "papa_2", next: null, isWorkedOn: {mesa: false, freidora: false, asador: false}},
    }

    this.aparatosAtlas = {
      freidora: {accepts: {
        achicoria_0: false,
        achicoria_1: false,
        carbon_0: false,
        pollo_0: false,
        pollo_1: false,
        pollo_2: false,
        pollo_3: false,
        pollo_4: false,
        papa_0: false,
        papa_1: true,
        papa_2: true,
        papa_3: false,
      }},
      mesa: {accepts: {
        achicoria_0: true,
        achicoria_1: true,
        carbon_0: true,
        pollo_0: true,
        pollo_1: true,
        pollo_2: true,
        pollo_3: true,
        pollo_4: true,
        papa_0: true,
        papa_1: true,
        papa_2: true,
        papa_3: true,
      }},
      asador: {accepts: {
        achicoria_0: false,
        achicoria_1: false,
        carbon_0: false,
        pollo_0: true,
        pollo_1: true,
        pollo_2: true,
        pollo_3: true,
        pollo_4: false,
        papa_0: false,
        papa_1: false,
        papa_2: false,
        papa_3: false,
      }},
    }

    this.pedidosDisponibles = ["papa_2", "pollo_3", "achicoria_1"]
    this.randomIndexPedidosDisponibles = Math.floor(Math.random() * this.pedidosDisponibles.length)
    
    this.ingredientesNecesarios = ["papa_0", "achicoria_0", "pollo_0", "carbon_0"]
    this.randomIndexIngredientesNecesarios = Math.floor(Math.random() * this.ingredientesNecesarios.length)
    //CREAR SONIDOS ---------------------------------------------------
    this.coccionAudio = this.sound.add("coccion_0", {loop: true})
    this.picarAudio = this.sound.add("picar_0", {loop: true})
    this.fritarAudio = this.sound.add("fritar_0", {loop: true})
    
    //FONDO Y PJ ---------------------------------------------------------
    this.add.image(320, 180, "background");
    this.player = new Player(this, 640, 360, "bchef");
    
    //Cajas---------------------------------------------------------------
    this.boxes = []
    this.nearestBox = null;
    
    this.box1 = new IngredientBox(this, 300, 80, this.ingredientesNecesarios[this.randomIndexIngredientesNecesarios], "caja", 10);
    this.physics.add.collider(this.box1, this.player)
    this.boxes.push(this.box1);
    this.ingredientesNecesarios.splice(this.randomIndexIngredientesNecesarios, 1);
    this.randomIndexIngredientesNecesarios = Math.floor(Math.random() * this.ingredientesNecesarios.length)
    
    this.box2 = new IngredientBox(this, 400, 80, this.ingredientesNecesarios[this.randomIndexIngredientesNecesarios], "caja", 10);
    this.physics.add.collider(this.box2, this.player)
    this.boxes.push(this.box2);
    this.ingredientesNecesarios.splice(this.randomIndexIngredientesNecesarios, 1);
    this.randomIndexIngredientesNecesarios = Math.floor(Math.random() * this.ingredientesNecesarios.length)
    
    this.box3 = new IngredientBox(this, 200, 80, this.ingredientesNecesarios[this.randomIndexIngredientesNecesarios], "caja", 10);
    this.physics.add.collider(this.box3, this.player)
    this.boxes.push(this.box3);
    this.ingredientesNecesarios.splice(this.randomIndexIngredientesNecesarios, 1);
    this.randomIndexIngredientesNecesarios = Math.floor(Math.random() * this.ingredientesNecesarios.length)
    
    this.box4 = new IngredientBox(this, 500, 80, this.ingredientesNecesarios[this.randomIndexIngredientesNecesarios], "caja", 10);
    this.physics.add.collider(this.box4, this.player)
    this.boxes.push(this.box4);
    this.ingredientesNecesarios.splice(this.randomIndexIngredientesNecesarios, 1);
    this.randomIndexIngredientesNecesarios = Math.floor(Math.random() * this.ingredientesNecesarios.length)
    
    this.kitchenBox1 = new KitchenBox(this, 400, 200, "mesa", 30)
    this.physics.add.collider(this.player, this.kitchenBox1)
    this.boxes.push(this.kitchenBox1);
    
    this.kitchenBox2 = new KitchenBox(this, 300, 200, "freidora", 30)
    this.physics.add.collider(this.player, this.kitchenBox2)
    this.boxes.push(this.kitchenBox2);
    
    this.kitchenBox3 = new KitchenBox(this, 200, 200, "asador", 30)
    this.physics.add.collider(this.player, this.kitchenBox3)
    this.boxes.push(this.kitchenBox3);
    
    this.pedido1 = new Task(this, 100, 200, this.pedidosDisponibles[this.randomIndexPedidosDisponibles], 30)
    this.physics.add.collider(this.player, this.pedido1)
    this.boxes.push(this.pedido1);
    this.pedidosDisponibles.splice(this.randomIndexPedidosDisponibles, 1);
    this.randomIndexPedidosDisponibles = Math.floor(Math.random() * this.pedidosDisponibles.length)
    

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
    this.boxes.forEach(box => { //updatea todas las cajas
      box.update(dt);
    });

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
    this.minDist = Infinity;

    //buscar la caja más cercana
    for (const box of this.boxes) {
      const dActual = box.getDistSqToPlayer(player);

      if (dActual < this.minDist) {
        this.minDist = dActual;
        this.nearestBox = box;
      } else if (dActual === this.minDist) {
        if(box !== this.nearestBox){
          this.nearestBox = box;
        }
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
