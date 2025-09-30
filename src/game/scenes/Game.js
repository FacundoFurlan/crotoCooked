import { Scene } from "phaser";
import { Player } from "../classes/Player.js";
import { IngredientBox } from "../classes/IngredientBox.js";
import { KitchenBox } from "../classes/kitchenBox.js";
import { Task } from "../classes/Tasks.js";
import { Asador } from "../classes/asador.js";

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
    this.currentMode = this.registry.get("mode");
    console.log(`%cModo de juego: ${this.currentMode}`, "color: yellow")

    //SPRITES---------------------------------------
    this.load.image("background", "BG_Dia.png");
    this.load.image("mesa", "SS_Mesa.png");
    this.load.image("freidora", "SS_Freidora_0.png");
    this.load.image("freidoraOn", "SS_Freidora_1.png");
    this.load.image("asador", "SS_Asador_0.png");
    this.load.image("asadorOn", "SS_Asador_1.png");
    this.load.image("caja", "SS_Caja.png");
    this.load.image("orden", "SS_Orden.png");
    this.load.image("tabla", "SS_Tablones.png");
    
    //AUDIO----------------------------------------
    this.load.audio("caminar_pasto_0", "./audio/PJ_Caminar_Pasto_0.mp3");
    this.load.audio("coccion_0", "./audio/Coccion_0.mp3");
    this.load.audio("picar_0", "./audio/Picar_0.mp3");
    this.load.audio("fritar_0", "./audio/Fritar_0.mp3");

    //SPRITESHEETS--------------------------------
    this.load.spritesheet("player1", "SS_PJ1.png",{frameWidth: 21, frameHeight: 45})
    this.load.spritesheet("player2", "SS_PJ2.png",{frameWidth: 21, frameHeight: 45})
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
    
    this.ingredientesNecesarios = ["papa_0", "achicoria_0", "pollo_0", "carbon_0"]
    this.randomIndexIngredientesNecesarios = Math.floor(Math.random() * this.ingredientesNecesarios.length)
    //CREAR SONIDOS ---------------------------------------------------
    this.coccionAudio = this.sound.add("coccion_0", {loop: true})
    this.picarAudio = this.sound.add("picar_0", {loop: true})
    this.fritarAudio = this.sound.add("fritar_0", {loop: true})
    
    //FONDO Y PJ ---------------------------------------------------------
    this.add.image(320, 180, "background");
    this.barra = this.physics.add.sprite(100, 180, "tabla");
    this.barra.setImmovable(true);
    this.barra.body.setSize(this.barra.body.width-10, this.barra.body.height)
    this.player = new Player(this, 640, 360, "player1");
    this.player2 = new Player(this, 440, 360, "player2", 2);

    this.physics.add.collider(this.player, this.player2, () => {
      this.playersTouching = true;
    }, null, this);

    this.physics.add.collider(this.player, this.barra);
    this.physics.add.collider(this.player2, this.barra);
    
    //Cajas---------------------------------------------------------------
    this.Interactuables = []
    this.ingredientesCreadosArray = []
    this.nearestBox = null;
    this.posicionesPedidos = [45, 135, 225, 315]
    
    this.box1 = new IngredientBox(this, 300, 80, this.ingredientesNecesarios[this.randomIndexIngredientesNecesarios], "caja", 10);
    this.physics.add.collider(this.box1, this.player)
    this.physics.add.collider(this.box1, this.player2)
    this.Interactuables.push(this.box1);
    this.ingredientesNecesarios.splice(this.randomIndexIngredientesNecesarios, 1);
    this.randomIndexIngredientesNecesarios = Math.floor(Math.random() * this.ingredientesNecesarios.length)
    
    this.box2 = new IngredientBox(this, 400, 80, this.ingredientesNecesarios[this.randomIndexIngredientesNecesarios], "caja", 10);
    this.physics.add.collider(this.box2, this.player)
    this.physics.add.collider(this.box2, this.player2)
    this.Interactuables.push(this.box2);
    this.ingredientesNecesarios.splice(this.randomIndexIngredientesNecesarios, 1);
    this.randomIndexIngredientesNecesarios = Math.floor(Math.random() * this.ingredientesNecesarios.length)
    
    this.box3 = new IngredientBox(this, 200, 80, this.ingredientesNecesarios[this.randomIndexIngredientesNecesarios], "caja", 10);
    this.physics.add.collider(this.box3, this.player)
    this.physics.add.collider(this.box3, this.player2)
    this.Interactuables.push(this.box3);
    this.ingredientesNecesarios.splice(this.randomIndexIngredientesNecesarios, 1);
    this.randomIndexIngredientesNecesarios = Math.floor(Math.random() * this.ingredientesNecesarios.length)
    
    this.box4 = new IngredientBox(this, 500, 80, this.ingredientesNecesarios[this.randomIndexIngredientesNecesarios], "caja", 10);
    this.physics.add.collider(this.box4, this.player)
    this.physics.add.collider(this.box4, this.player2)
    this.Interactuables.push(this.box4);
    this.ingredientesNecesarios.splice(this.randomIndexIngredientesNecesarios, 1);
    this.randomIndexIngredientesNecesarios = Math.floor(Math.random() * this.ingredientesNecesarios.length)
    
    this.kitchenBox1 = new KitchenBox(this, 400, 250, "mesa", 30)
    this.physics.add.collider(this.player, this.kitchenBox1)
    this.physics.add.collider(this.player2, this.kitchenBox1)
    this.Interactuables.push(this.kitchenBox1);
    
    this.kitchenBox2 = new KitchenBox(this, 300, 250, "freidora", 30)
    this.physics.add.collider(this.player, this.kitchenBox2)
    this.physics.add.collider(this.player2, this.kitchenBox2)
    this.Interactuables.push(this.kitchenBox2);
    
    this.kitchenBox3 = new Asador(this, 200, 250, "asador", 30)
    this.physics.add.collider(this.player, this.kitchenBox3)
    this.physics.add.collider(this.player2, this.kitchenBox3)
    this.Interactuables.push(this.kitchenBox3);
    
    this.spawnPedidos();
    this.spawnPedidos();
    this.time.addEvent({
      delay: 5000,
      callback: () => {
          this.spawnPedidos();
      },
      loop: true
    });
    

    //Cursors
    this.actionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.throwKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.actionKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.throwKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.dashKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.victoryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    this.DefeatKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
  }

  update(t, dt) {
    this.currentCycle = "update";
    // console.log("FR: ", dt/1000)
    
    this.nearestBox = this._getClosestBox(this.player)
    this.nearestBox2 = this._getClosestBox(this.player2)
    
    if (this.player) this.player.update(dt);
    if (this.player2) this.player2.update(dt);
    this.Interactuables.forEach(box => { //updatea todas las cajas
      box.update(dt);
    });

    //PLAYER 1 ----------------------------------------------------------------------------
    if (Phaser.Input.Keyboard.JustDown(this.actionKey)) {
      if(this.nearestBox.activeBox){
        this.nearestBox.onInteract(this.player)
        console.log("Action key pressed!")
      } else{
        if(this.player.holdingItem){
          this.player.holdingSM.changeState("none", {player: this.player})
    
        } else{
          console.log("Cancel key pressed but nothing in the hands")
        }
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.throwKey) && this.player.holdingItem) {
      const itemToThrow = this.player.itemHolded;
      this.player.holdingSM.changeState("none", {player: this.player});

      const speed = 600;
      itemToThrow.thrownBy = 1;
      itemToThrow.body.setVelocity(this.player.lastDirection.x * speed, this.player.lastDirection.y * speed);
    }

    if (Phaser.Input.Keyboard.JustDown(this.dashKey)) {
      this.player.dash()
    }
    //PLAYER 2 ----------------------------------------------------------------------------
    if (Phaser.Input.Keyboard.JustDown(this.actionKey2)) {
      if(this.nearestBox2.activeBox2){
        this.nearestBox2.onInteract(this.player2)
        console.log("Action key pressed!")
      } else{
        if(this.player2.holdingItem){
          this.player2.holdingSM.changeState("none", {player: this.player2})
    
        } else{
          console.log("Cancel key pressed but nothing in the hands")
        }
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.throwKey2) && this.player2.holdingItem) {
      const itemToThrow = this.player2.itemHolded;
      this.player2.holdingSM.changeState("none", {player: this.player2});

      const speed = 600;
      itemToThrow.thrownBy = 1;
      itemToThrow.body.setVelocity(this.player2.lastDirection.x * speed, this.player2.lastDirection.y * speed);
    }

    if (Phaser.Input.Keyboard.JustDown(this.dashKey2)) {
      this.player2.dash()
    }

    if (Phaser.Input.Keyboard.JustDown(this.victoryKey)) {
      this.finishLevel();
    }
    if (Phaser.Input.Keyboard.JustDown(this.DefeatKey)) {
      this.onPlayerDeath();
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

  _getClosestBox(player){
    if(!player || !player.body){
      return null;
    }

    let minDist = Infinity;
    let nearest = null;
    

    //buscar la caja más cercana
    for (const box of this.Interactuables) {
      if(!box.grabbed){
        const dActual = box.getDistSqToPlayer(player);
  
        if (dActual < minDist) {
          minDist = dActual;
          nearest = box;
        } else if (dActual === minDist) {
          if(box !== nearest){
            nearest = box;
          }
        }
      }
    }

    //aplicar estado a las cajas
    for (const box of this.Interactuables) {
      if (box === nearest) box.markAsClosest(true, minDist, player.kind);
      else box.markAsClosest(false, Infinity, player.kind);
    }

    return nearest;
  }

  _pushPlayers(p1, p2) {
    const dir = p1.lastDirection
    const force = 400;

    p2.pushed = true;
    p2.pushedTime = 0;
    p2.body.setVelocity(dir.x * force, dir.y * force);
  }

  finishLevel() {
    this.sound.stopAll();
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
    this.sound.stopAll();
    const score = this.playerScore ?? 0;
    this.scene.stop("HUD");
    this.cameras.main.fadeOut(400);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("Defeat", { reason, score });
    });
  }

  spawnPedidos(){
    // busca una posición libre
    let y = this.posicionesPedidos.find(
      pos => !this.Interactuables.some(p => p.y === pos && p.availableIngredients)
    );

    if (!y) { // no hay lugar libre
      const hud = this.scene.get("HUD");
      hud.addPedidosEnCola(1);
    } else{
      let pedido = new Task(this, 40, y, this.pedidosDisponibles);
      this.physics.add.collider(this.player, pedido);
      this.physics.add.collider(this.player2, pedido);
      this.Interactuables.push(pedido);
    }
  }

  checkTaskQueue(){
    if(this.scene.get("HUD").getPedidosEnCola() > 0){
      this.spawnPedidos();
      this.scene.get("HUD").subsPedidosEnCola(1);
    }
  }
}
