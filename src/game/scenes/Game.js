import { Scene } from "phaser";
import { Player } from "../classes/Player.js";
import { IngredientBox } from "../classes/IngredientBox.js";
import { KitchenBox } from "../classes/kitchenBox.js";
import { Task } from "../classes/Tasks.js";
import { Asador } from "../classes/asador.js";
import InputSystem, { INPUT_ACTIONS } from "../../utils/InputSystem.js";

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
    this.load.spritesheet("ingredientesAtlas", "SS_Ingredientes(1).png",{frameWidth: 20, frameHeight: 20})
  }
  
  create() {
    this.currentCycle = "create";

    //INDICES ATLAS---------------------------------------------------------
    this.ingredientesAtlas = {
      //POLLO---------
      polloCrudo_0: {index: 28, next: {asador: "polloAsado_0", mesa: "polloLonja_0"}},
      polloAsado_0: {index: 29, next: {asador: "polloAsado_1"}},
      polloAsado_1: {index: 30, next: {asador: "polloAsado_2"}},
      polloAsado_2: {index: 31, next: {asador: "polloQuemado"}},
      polloQuemado: {index: 32},
      polloLonja_0: {index: 36, next: {mesa: "polloPicado_0"}, fusion: {panRallado_0: "milaPollo_0"}},
      polloPicado_0: {index: 35, fusion: {tapaEmpanada_0: "empaPollo_0"}},
      
      //MILANESAS --------------
      milaPollo_0: {index: 37, next: {freidora: "milaPollo_1"}},
      milaPollo_1: {index: 38, next: {freidora: "milaPolloQuemado"}, fusion: {panCortado_0: "milaPolloPan_0", panAchicoria_0: "sanMila_0"}},
      milaPolloQuemado: {index: 39},
      sanMila_0: {index: 41},
      milaPolloPan_0: {index:40, fusion: {achicoriaPicada_0: "sanMila_0"}},

      //Asado
      asadoCrudo_0: {index: 21, next: {asador: "asado_0"}},
      asado_0: {index: 22, next: {asador: "asado_1"}},
      asado_1: {index: 23, next: {asador: "asado_2"}},
      asado_2: {index: 24, next: {asador: "asadoQuemado", mesa: "asadoPicado"}},
      asadoQuemado: {index: 25},
      asadoPicado: {index: 26, fusion: {tapaEmpanada_0: "empaCarne_0"}},
      
      //Empanadas
      tapaEmpanada_0: {index: 56, fusion: {asadoPicado: "empaCarne_0", polloPicado_0: "empaPollo_0"}},
      empaPollo_0: {index: 57, next: {mesa: "empaPollo_1"}},
      empaPollo_1: {index: 59, next: {freidora: "empaPollo_2"}},
      empaPollo_2: {index: 61, next: {freidora: "empaPolloQuemado"}},
      empaPolloQuemado: {index: 33},
      empaCarne_0: {index: 58, next: {mesa: "empaCarne_1"}},
      empaCarne_1: {index: 60, next: {freidora: "empaCarne_2"}},
      empaCarne_2: {index: 62, next: {freidora: "empaCarneQuemado"}},
      empaCarneQuemado: {index: 34},

      //ACHICORIA ----------
      achicoriaCruda_0: {index: 0, next: {mesa: "achicoriaPicada_0"}},
      achicoriaPicada_0: {index: 1, fusion: {panCortado_0: "panAchicoria_0", milaPolloPan_0: "sanMila_0"}},
      
      //PAN --------------
      panCrudo_0: {index: 3, next: {mesa: "panCortado_0"}},
      panCortado_0: {index: 4, next: {mesa: "panRallado_0"}, fusion: {achicoriaPicada_0: "panAchicoria_0", chorizo_2: "panChorizo_0", bife_2: "panBife_2", lomo_0: "panLomo_0", milaPollo_1: "milaPolloPan_0"}},
      panAchicoria_0: {index: 6, fusion: {milaPollo_1: "sanMila_0", lomo_0: "sanLomo_0", bife_2: "sanBife_0", chorizo_2: "pancho"}},
      panRallado_0: {index: 5, fusion: {polloLonja_0: "milaPollo_0"}},
      
      //CARBON -----------
      carbon_0: {index: 2},

      //PAPAS --------------
      papaCruda_0: {index: 49, next: {mesa: "papaCortada_0", asador: "papaAsada_0"}},
      papaCortada_0: {index: 50, next: {freidora: "papaCortada_1"}},
      papaCortada_1: {index: 51, next: {freidora: "papaCortadaQuemada"}},
      papaCortadaQuemada: {index: 53},
      papaAsada_0: {index: 52, next: {asador: "papaAsadaQuemada"}},
      papaAsadaQuemada: {index: 54},

      //Chorizo
      chorizoCrudo_0: {index: 42, next: {asador: "chorizo_0"}},
      chorizo_0: {index: 43, next: {asador: "chorizo_1"}},
      chorizo_1: {index: 44, next: {asador: "chorizo_2"}},
      chorizo_2: {index: 45, next: {asador: "chorizoQuemado"}, fusion: {panCortado_0: "panChorizo_0", panAchicoria_0: "pancho"}},
      chorizoQuemado: {index: 46},
      panChorizo_0: {index: 47, fusion: {achicoriaPicada_0: "pancho"}},
      pancho: {index: 48},

      //Bifes
      bifeCrudo_0: {index: 14, next: {asador: "bife_0"}},
      bife_0: {index: 15, next: {asador: "bife_1"}},
      bife_1: {index: 16, next: {asador: "bife_2"}},
      bife_2: {index: 17, next: {asador: "bifeQuemado"}, fusion: {panCortado_0: "panBife_0", panAchicoria_0: "sanBife_0"}},
      bifeQuemado: {index: 18},
      panBife_0: {index: 19, fusion: {achicoriaPicada_0: "sanBife_0"}},
      sanBife_0: {index: 20},
      
      //Lomo
      lomoCrudo_0: {index: 7, next: {asador: "lomo_0"}},
      lomo_0: {index: 8, next: {asador: "lomoQuemado"}, fusion: {panCortado_0: "panLomo_0", panAchicoria_0: "sanLomo_0"}},
      lomoQuemado: {index: 9},
      panLomo_0: {index: 10, fusion: {achicoriaPicada_0: "sanLomo_0"}},
      sanLomo_0: {index: 11},
    } //index: numero de aparicion en atlas

    this.aparatosAtlas = {
      mesa: {accepts: {
        //POLLO---------
        polloCrudo_0: true,
        polloAsado_0: true,
        polloAsado_1: true,
        polloAsado_2: true,
        polloQuemado: true,
        polloLonja_0: true,
        polloPicado_0: true,
        
        //MILANESAS --------------
        milaPollo_0: true,
        milaPollo_1: true,
        milaPolloQuemado: true,
        sanMila_0: true,
        milaPolloPan_0: true,

        //Asado
        asadoCrudo_0: true,
        asado_0: true,
        asado_1: true,
        asado_2: true,
        asadoQuemado: true,
        asadoPicado: true,
        
        //Empanadas
        tapaEmpanada_0: true,
        empaPollo_0: true,
        empaPollo_1: true,
        empaPollo_2: true,
        empaPolloQuemado: true,
        empaCarne_0: true,
        empaCarne_1: true,
        empaCarne_2: true,
        empaCarneQuemado: true,

        //ACHICORIA ----------
        achicoriaCruda_0: true,
        achicoriaPicada_0: true,
        
        //PAN --------------
        panCrudo_0: true,
        panCortado_0: true,
        panAchicoria_0: true,
        panRallado_0: true,
        
        //CARBON -----------
        carbon_0: true,

        //PAPAS --------------
        papaCruda_0: true,
        papaCortada_0: true,
        papaCortada_1: true,
        papaCortadaQuemada: true,
        papaAsada_0: true,
        papaAsadaQuemada: true,

        //Chorizo
        chorizoCrudo_0: true,
        chorizo_0: true,
        chorizo_1: true,
        chorizo_2: true,
        chorizoQuemado: true,
        panChorizo_0: true,
        pancho: true,

        //Bifes
        bifeCrudo_0: true,
        bife_0: true,
        bife_1: true,
        bife_2: true,
        bifeQuemado: true,
        panBife_0: true,
        sanBife_0: true,
        
        //Lomo
        lomoCrudo_0: true,
        lomo_0: true,
        lomoQuemado: true,
        panLomo_0: true,
        sanLomo_0: true,
      }},
      asador: {accepts: {
        polloCrudo_0: true,
        polloAsado_0: true,
        polloAsado_1: true,
        polloAsado_2: true,
        polloQuemado: true,
      
        papaCruda_0: true,
        papaAsada_0: true,
        papaAsadaQuemada: true,

        lomoCrudo_0: true,
        lomo_0: true,
        lomoQuemado: true,

        bifeCrudo_0: true,
        bife_0: true,
        bife_1: true,
        bife_2: true,
        bifeQuemado: true,

        chorizoCrudo_0: true,
        chorizo_0: true,
        chorizo_1: true,
        chorizo_2: true,
        chorizoQuemado: true,

        asadoCrudo_0: true,
        asado_0: true,
        asado_1: true,
        asado_2: true,
        asadoQuemado: true,
      }},
      freidora: {accepts: { //si se lo puede depositar en esta maquina o no
        milaPollo_0: true,
        milaPollo_1: true,
        milaPolloQuemado: true,

        papaCortada_0: true,
        papaCortada_1: true,
        papaCortadaQuemada: true,

        empaPollo_1: true,
        empaPollo_2: true,
        empaPolloQuemado: true,
        empaCarne_1: true,
        empaCarne_2: true,
        empaCarneQuemado: true,
      }},
    }

    this.pedidosDisponibles = ["milaPollo_1", "empaCarne_2", "pancho", "sanLomo_0", "panBife_0"]
    
    this.ingredientesNecesarios = ["polloCrudo_0", "asadoCrudo_0", "tapaEmpanada_0", "achicoriaCruda_0", "panCrudo_0", "papaCruda_0", "chorizoCrudo_0", "bifeCrudo_0", "lomoCrudo_0"]
    this.randomIndexIngredientesNecesarios = Math.floor(Math.random() * this.ingredientesNecesarios.length)
    //CREAR SONIDOS ---------------------------------------------------
    this.coccionAudio = this.sound.add("coccion_0", {loop: true})
    this.picarAudio = this.sound.add("picar_0", {loop: true})
    this.fritarAudio = this.sound.add("fritar_0", {loop: true})
    
    //MANEJO DE INPUTS ---------------------------------------------------
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

    //FONDO Y PJ ---------------------------------------------------------
    this.add.image(320, 180, "background");
    this.barra = this.physics.add.sprite(100, 180, "tabla");
    this.barra.body.pushable = false;
    this.barra.body.setImmovable(true)
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
    
    this.box4 = new IngredientBox(this, 500, 80, "carbon_0", "caja", 10);
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
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player1")) {
      if(this.nearestBox.activeBox){
        this.nearestBox.onInteract(this.player)
        console.log("Action key pressed!")
      } else{
        if(this.player.holdingItem){
          this.player.holdingSM.changeState("none", {player: this.player})
    
        } else{
          console.log("Nothing at hand")
        }
      }
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST, "player1") && this.player.holdingItem) {
      const itemToThrow = this.player.itemHolded;
      this.player.holdingSM.changeState("none", {player: this.player});

      const speed = 600;
      itemToThrow.thrownBy = 1;
      itemToThrow.body.setVelocity(this.player.lastDirection.x * speed, this.player.lastDirection.y * speed);
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH, "player1")) {
      this.player.dash()
    }
    //PLAYER 2 ----------------------------------------------------------------------------
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player2")) {
      if(this.nearestBox2.activeBox2){
        this.nearestBox2.onInteract(this.player2)
        console.log("Action key pressed!")
      } else{
        if(this.player2.holdingItem){
          this.player2.holdingSM.changeState("none", {player: this.player2})
    
        } else{
          console.log("Nothing at hand")
        }
      }
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST, "player2") && this.player2.holdingItem) {
      const itemToThrow = this.player2.itemHolded;
      this.player2.holdingSM.changeState("none", {player: this.player2});

      const speed = 600;
      itemToThrow.thrownBy = 1;
      itemToThrow.body.setVelocity(this.player2.lastDirection.x * speed, this.player2.lastDirection.y * speed);
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH, "player2")) {
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

    if (this.inputSystem.isGamepadConnected("player1")) {
      const debug1 = this.inputSystem.debugGamepad("player1");
      if (debug1 && debug1.pressedButtons.length > 0) {
        console.log("P1 Raw gamepad buttons:", debug1.pressedButtons);
      }
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
