import { Scene } from "phaser";
import { Player } from "../classes/Player.js";
import { IngredientBox } from "../classes/IngredientBox.js";
import { KitchenBox } from "../classes/KitchenBox.js";
import { Task } from "../classes/Tasks.js";
import { Asador } from "../classes/Asador.js";
import InputSystem, { INPUT_ACTIONS } from "../../utils/InputSystem.js";
import { Recetario } from "../classes/Recetario.js";
import { LibroRecetario } from "../classes/LibroRecetario.js";
import { Freidora } from "../classes/Freidora.js";

export class Game extends Scene {
  constructor() {
    super("Game");
    this.cycleText = null;
    this.currentCycle = "init";
    this.player = null;
  }

  init() {
    this.currentCycle = "init";
    this.caceria = false;

    this.input.once('pointerdown', () => { //esto es para evitar un warning molesto del audio
      if (this.sound.context.state === 'suspended') {
        this.sound.context.resume();
      }
    });
  }

  preload() {
    this.currentCycle = "preload";
    this.actualLevel = this.registry.get("actualLevel");
    console.log(`%cActual Level: ${this.actualLevel}`, "color: aqua")
    this.load.setPath("assets");
    this.currentMode = this.registry.get("mode");
    console.log(`%cModo de juego: ${this.currentMode}`, "color: yellow")
  }

  create() {
    this.currentCycle = "create";

    //INDICES ATLAS---------------------------------------------------------
    this.ingredientesAtlas = {
      //POLLO---------
      polloCrudo_0: { index: 28, next: { asador: "polloAsado_0", mesa: "polloLonja_0" } },
      polloAsado_0: { index: 29, next: { asador: "polloAsado_1" } },
      polloAsado_1: { index: 30, next: { asador: "polloAsado_2" } },
      polloAsado_2: { index: 31, next: { asador: "polloQuemado" } },
      polloQuemado: { index: 32 },
      polloLonja_0: { index: 36, next: { mesa: "polloPicado_0" }, fusion: { panRallado_0: "milaPollo_0" } },
      polloPicado_0: { index: 35, fusion: { tapaEmpanada_0: "empaPollo_0" } },

      //MILANESAS --------------
      milaPollo_0: { index: 37, next: { freidora: "milaPollo_1" } },
      milaPollo_1: { index: 38, next: { freidora: "milaPolloQuemado" }, fusion: { panCortado_0: "milaPolloPan_0", panAchicoria_0: "sanMila_0" } },
      milaPolloQuemado: { index: 39 },
      milaCarne_0: { index: 7, next: { freidora: "milaCarne_1" } },
      milaCarne_1: { index: 8, next: { freidora: "milaCarneQuemado" }, fusion: { panCortado_0: "milaCarnePan_0", panAchicoria_0: "sanMilaCarne_0" } },
      milaCarneQuemado: { index: 9 },
      sanMila_0: { index: 41 },
      sanMilaCarne_0: { index: 11 },
      milaCarnePan_0: { index: 10, fusion: { achicoriaPicada_0: "sanMilaCarne_0" } },
      milaPolloPan_0: { index: 40, fusion: { achicoriaPicada_0: "sanMila_0" } },

      //Asado o lomo 
      lomoCrudo_0: { index: 21, next: { asador: "lomo_0" } },
      lomo_0: { index: 22, next: { asador: "lomo_1" } },
      lomo_1: { index: 23, next: { asador: "lomo_2" } },
      lomo_2: { index: 24, next: { asador: "lomoQuemado", mesa: "lomoPicado" } },
      lomoQuemado: { index: 25 },
      lomoPicado: { index: 26, fusion: { tapaEmpanada_0: "empaCarne_0" } },

      //Empanadas
      tapaEmpanada_0: { index: 56, fusion: { asadoPicado: "empaCarne_0", polloPicado_0: "empaPollo_0" } },
      empaPollo_0: { index: 57, next: { mesa: "empaPollo_1" } },
      empaPollo_1: { index: 59, next: { freidora: "empaPollo_2" } },
      empaPollo_2: { index: 61, next: { freidora: "empaPolloQuemado" } },
      empaPolloQuemado: { index: 33 },
      empaCarne_0: { index: 58, next: { mesa: "empaCarne_1" } },
      empaCarne_1: { index: 60, next: { freidora: "empaCarne_2" } },
      empaCarne_2: { index: 62, next: { freidora: "empaCarneQuemado" } },
      empaCarneQuemado: { index: 34 },

      //ACHICORIA ----------
      achicoriaCruda_0: { index: 0, next: { mesa: "achicoriaPicada_0" } },
      achicoriaPicada_0: { index: 1, fusion: { panCortado_0: "panAchicoria_0", milaPolloPan_0: "sanMila_0" } },

      //PAN --------------
      panCrudo_0: { index: 3, next: { mesa: "panCortado_0" } },
      panCortado_0: { index: 4, next: { mesa: "panRallado_0" }, fusion: { achicoriaPicada_0: "panAchicoria_0", chorizo_2: "panChorizo_0", bife_2: "panBife_2", milaCarne_1: "milaCarnePan_0", milaPollo_1: "milaPolloPan_0" } },
      panAchicoria_0: { index: 6, fusion: { milaPollo_1: "sanMila_0", milaCarne_1: "sanMilaCarme_0", bife_2: "sanBife_0", chorizo_2: "pancho" } },
      panRallado_0: { index: 5, fusion: { polloLonja_0: "milaPollo_0", bifeCrudo_0: "milaCarne_0" } },

      //CARBON -----------
      carbon_0: { index: 2 },

      //PAPAS --------------
      papaCruda_0: { index: 49, next: { mesa: "papaCortada_0", asador: "papaAsada_0" } },
      papaCortada_0: { index: 50, next: { freidora: "papaCortada_1" } },
      papaCortada_1: { index: 51, next: { freidora: "papaCortadaQuemada" } },
      papaCortadaQuemada: { index: 53 },
      papaAsada_0: { index: 52, next: { asador: "papaAsadaQuemada" } },
      papaAsadaQuemada: { index: 54 },

      //Chorizo
      chorizoCrudo_0: { index: 42, next: { asador: "chorizo_0" } },
      chorizo_0: { index: 43, next: { asador: "chorizo_1" } },
      chorizo_1: { index: 44, next: { asador: "chorizo_2" } },
      chorizo_2: { index: 45, next: { asador: "chorizoQuemado" }, fusion: { panCortado_0: "panChorizo_0", panAchicoria_0: "pancho" } },
      chorizoQuemado: { index: 46 },
      panChorizo_0: { index: 47, fusion: { achicoriaPicada_0: "pancho" } },
      pancho: { index: 48 },

      //Bifes
      bifeCrudo_0: { index: 14, next: { asador: "bife_0" }, fusion: { panRallado_0: "milaCarne_0" } },
      bife_0: { index: 15, next: { asador: "bife_1" } },
      bife_1: { index: 16, next: { asador: "bife_2" } },
      bife_2: { index: 17, next: { asador: "bifeQuemado" }, fusion: { panCortado_0: "panBife_0", panAchicoria_0: "sanBife_0" } },
      bifeQuemado: { index: 18 },
      panBife_0: { index: 19, fusion: { achicoriaPicada_0: "sanBife_0" } },
      sanBife_0: { index: 20 },

    } //index: numero de aparicion en atlas

    this.aparatosAtlas = {
      mesa: {
        accepts: {
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
          milaCarnePan_0: true,
          milaCarne_0: true,
          milaCarne_1: true,
          milaCarneQuemado: true,
          sanMilaCarne_0: true,
          milaCarnePan_0: true,

          //Asado o lomo
          lomoCrudo_0: true,
          lomo_0: true,
          lomo_1: true,
          lomo_2: true,
          lomoQuemado: true,
          lomoPicado: true,

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

        }
      },
      asador: {
        accepts: {
          polloCrudo_0: true,
          polloAsado_0: true,
          polloAsado_1: true,
          polloAsado_2: true,
          polloQuemado: true,

          papaCruda_0: true,
          papaAsada_0: true,
          papaAsadaQuemada: true,

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

          lomoCrudo_0: true,
          lomo_0: true,
          lomo_1: true,
          lomo_2: true,
          lomoQuemado: true,
        }
      },
      freidora: {
        accepts: { //si se lo puede depositar en esta maquina o no
          milaPollo_0: true,
          milaPollo_1: true,
          milaPolloQuemado: true,

          milaCarne_0: true,
          milaCarne_1: true,
          milaCarneQuemado: true,

          papaCortada_0: true,
          papaCortada_1: true,
          papaCortadaQuemada: true,

          empaPollo_1: true,
          empaPollo_2: true,
          empaPolloQuemado: true,
          empaCarne_1: true,
          empaCarne_2: true,
          empaCarneQuemado: true,
        }
      },
    }

    this.nivel1 = { pedidosDispo: ["polloAsado_2", "bife_2", "achicoriaPicada_0"], ingreNecesarios: ["polloCrudo_0", "bifeCrudo_0", "achicoriaCruda_0"] }
    this.nivel2 = { pedidosDispo: ["polloAsado_2", "bife_2", "achicoriaPicada_0", "papaAsada_0", "papaCortada_1"], ingreNecesarios: ["polloCrudo_0", "bifeCrudo_0", "achicoriaCruda_0", "papaCruda_0"] }
    this.nivel3 = { pedidosDispo: ["polloAsado_2", "bife_2", "achicoriaPicada_0", "papaAsada_0", "papaCortada_1", "lomo_2", "chorizo_2"], ingreNecesarios: ["polloCrudo_0", "bifeCrudo_0", "achicoriaCruda_0", "papaCruda_0", "lomoCrudo_0", "chorizoCrudo_0"] }
    this.nivel4 = { pedidosDispo: ["polloAsado_2", "bife_2", "achicoriaPicada_0", "papaAsada_0", "papaCortada_1", "lomo_0", "chorizo_2", "pancho", "sanBife_0"], ingreNecesarios: ["polloCrudo_0", "bifeCrudo_0", "achicoriaCruda_0", "papaCruda_0", "lomoCrudo_0", "chorizoCrudo_0", "panCrudo_0"] }
    this.nivel5 = { pedidosDispo: ["polloAsado_2", "bife_2", "achicoriaPicada_0", "papaAsada_0", "papaCortada_1", "lomo_0", "chorizo_2", "pancho", "sanBife_0", "milaPollo_1", "milaCarne_1"], ingreNecesarios: ["polloCrudo_0", "bifeCrudo_0", "achicoriaCruda_0", "papaCruda_0", "lomoCrudo_0", "chorizoCrudo_0", "panCrudo_0"] }
    this.nivel6 = { pedidosDispo: ["polloAsado_2", "bife_2", "achicoriaPicada_0", "papaAsada_0", "papaCortada_1", "lomo_0", "chorizo_2", "pancho", "sanBife_0", "milaPollo_1", "milaCarne_1", "sanMila_0", "sanMilaCarne_0"], ingreNecesarios: ["polloCrudo_0", "bifeCrudo_0", "achicoriaCruda_0", "papaCruda_0", "lomoCrudo_0", "chorizoCrudo_0", "panCrudo_0"] }
    this.nivel7 = { pedidosDispo: ["polloAsado_2", "bife_2", "achicoriaPicada_0", "papaAsada_0", "papaCortada_1", "lomo_0", "chorizo_2", "pancho", "sanBife_0", "milaPollo_1", "milaCarne_1", "sanMila_0", "sanMilaCarne_0", "empaPollo_2", "empaCarne_2"], ingreNecesarios: ["polloCrudo_0", "bifeCrudo_0", "achicoriaCruda_0", "papaCruda_0", "lomoCrudo_0", "chorizoCrudo_0", "panCrudo_0", "tapaEmpanada_0"] }
    if (this.actualLevel === 1) {
      this.pedidosDisponibles = this.nivel1.pedidosDispo
      this.ingredientesNecesarios = this.nivel1.ingreNecesarios
    } else if (this.actualLevel === 2) {
      this.pedidosDisponibles = this.nivel2.pedidosDispo
      this.ingredientesNecesarios = this.nivel2.ingreNecesarios
    } else if (this.actualLevel === 3) {
      this.pedidosDisponibles = this.nivel3.pedidosDispo
      this.ingredientesNecesarios = this.nivel3.ingreNecesarios
    } else if (this.actualLevel === 4) {
      this.pedidosDisponibles = this.nivel4.pedidosDispo
      this.ingredientesNecesarios = this.nivel4.ingreNecesarios
    } else if (this.actualLevel === 5) {
      this.pedidosDisponibles = this.nivel5.pedidosDispo
      this.ingredientesNecesarios = this.nivel5.ingreNecesarios
    } else if (this.actualLevel === 6) {
      this.pedidosDisponibles = this.nivel6.pedidosDispo
      this.ingredientesNecesarios = this.nivel6.ingreNecesarios
    } else if (this.actualLevel >= 7) {
      this.pedidosDisponibles = this.nivel7.pedidosDispo
      this.ingredientesNecesarios = this.nivel7.ingreNecesarios
    }

    this.randomIndexIngredientesNecesarios = Math.floor(Math.random() * this.ingredientesNecesarios.length)
    //CREAR SONIDOS ---------------------------------------------------
    this.musicaCumbia1 = this.sound.add("musica_cumbia_1", { loop: true, volume: .2 }).play()
    this.ambienteCocina = this.sound.add("ambienteCocina", { loop: true, volume: 1 }).play()
    this.coccionAudio = this.sound.add("coccion", { loop: true })
    this.picarAudio = this.sound.add("picar", { loop: true })
    this.picarListoAudio = this.sound.add("picarListo", { loop: false })
    this.fritarAudio = this.sound.add("fritar", { loop: true })
    this.coccionListoAudio = this.sound.add("coccionListo", { loop: false })
    this.dashAudio = this.sound.add("dash", { loop: false })
    this.caminarAudio = this.sound.add("caminar_pasto", { loop: false })
    this.agarrarAudio = this.sound.add("agarrar", { loop: false })
    this.lanzarAudio = this.sound.add("lanzar", { loop: false })
    this.cajaAudio = this.sound.add("caja", { loop: false })
    this.pedidoNuevoAudio = this.sound.add("pedidoNuevo", { loop: false })
    this.pedidoEntregadoAudio = this.sound.add("pedidoEntregado", { loop: false })
    this.dineroAudio = this.sound.add("dinero", { loop: false })
    this.tiempoEmpiezaAudio = this.sound.add("tiempoEmpieza", { loop: false })
    this.tiempoCriticoAudio = this.sound.add("tiempoCritico", { loop: false })
    this.tiempoFinAudio = this.sound.add("tiempoFin", { loop: false })
    this.golpePjAudio = this.sound.add("golpePj", { loop: false })
    this.muerteBossAudio = this.sound.add("muerteBoss", { loop: false })
    this.golpeBossAudio = this.sound.add("golpeBoss", { loop: false })
    this.ambienteBossAudio = this.sound.add("ambienteBoss", { loop: false })



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
    this.add.image(565, 195, "cenizas");
    const campana1 = this.add.image(100, 65, "campana");
    campana1.setDepth(99)
    const campana2 = this.add.image(100, 155, "campana");
    campana2.setDepth(99)
    const campana3 = this.add.image(100, 245, "campana");
    campana3.setDepth(99)
    const campana4 = this.add.image(100, 335, "campana");
    campana4.setDepth(99)
    this.add.sprite(550, 180, "asador", 4);
    this.add.sprite(575, 180, "asador", 5);
    this.add.sprite(350, 225, "mesa", 6);
    this.add.sprite(375, 225, "mesa", 7);
    this.barra = this.physics.add.sprite(100, 180, "tabla");
    this.barra.body.pushable = false;
    this.barra.body.setImmovable(true)
    this.barra.body.setSize(this.barra.body.width - 10, this.barra.body.height)
    this.player = new Player(this, 420, 150, "player1", this.inputSystem);
    this.player2 = new Player(this, 300, 150, "player2", this.inputSystem, 2);

    this.physics.add.collider(this.player, this.player2, () => {
      this.playersTouching = true;
    }, null, this);

    this.physics.add.collider(this.player, this.barra);
    this.physics.add.collider(this.player2, this.barra);

    this.recetario = new Recetario(this, 225, 378, this.actualLevel)
    //Cajas---------------------------------------------------------------
    this.Interactuables = []
    this.ingredientesCreadosArray = []
    this.nearestBox = null;
    this.posicionesPedidos = [45, 135, 225, 315]

    this.libroRecetario = new LibroRecetario(this, 100, 260)
    this.Interactuables.push(this.libroRecetario)

    this.arrayUbicacionesCajas = [{ x: 240, y: 80 }, { x: 290, y: 65 }, { x: 358, y: 74 }, { x: 260, y: 205 }, { x: 460, y: 190 }, { x: 340, y: 280 }, { x: 430, y: 300 }, { x: 525, y: 300 }, { x: 575, y: 275 }]

    let cont = 0;
    this.ingredientesNecesarios.forEach(element => {
      const index = Math.floor(Math.random() * this.arrayUbicacionesCajas.length);

      const element1 = this.arrayUbicacionesCajas[index];

      this.arrayUbicacionesCajas.splice(index, 1);

      let box1 = new IngredientBox(this, element1.x, element1.y, element, "caja", 10);

      this.physics.add.collider(box1, this.player)
      this.physics.add.collider(box1, this.player2)
      this.Interactuables.push(box1);
      cont++;
    });

    let box1 = new IngredientBox(this, 600, 80, "carbon_0", "caja", 10);
    this.physics.add.collider(box1, this.player)
    this.physics.add.collider(box1, this.player2)
    this.Interactuables.push(box1);

    // Creacion de mesa
    for (let i = 0; i < 6; i++) {
      let x = 350 + (i % 2) * 25; // X 400, 425, 400, 425
      let y = 150 + (Math.floor(i / 2) * 25); // Y aumenta en 1 cada 2 iteraciones
      let tabla = Math.random() < 0.5 ? 0 : 1;
      if (i === 2) tabla = 1; // proteccion para que no hayan tablas
      if (i > 2) tabla = 0; // proteccion para que no sean todos los espacios tablas
      let mesa = new KitchenBox(this, x, y, "mesa", 25, i, tabla);
      this.physics.add.collider(this.player, mesa);
      this.physics.add.collider(this.player2, mesa);
      this.Interactuables.push(mesa);
    }

    if (this.actualLevel > 1) {
      console.log('FREIDORA RAAAAAAAAAAAAAAAAAA')
      this.kitchenBox2 = new Freidora(this, 460, 80, 30, null)
      this.physics.add.collider(this.player, this.kitchenBox2)
      this.physics.add.collider(this.player2, this.kitchenBox2)
      this.Interactuables.push(this.kitchenBox2);
    }

    //Creacion de asador
    for (let i = 0; i < 4; i++) {
      let x = 550 + (i % 2) * 25; // X 200, 225, 200, 225
      let y = 180 + (Math.floor(i / 2) * 25); // Y aumenta en 1 cada 2 iteraciones
      let asador = new Asador(this, x, y, 25, i);
      this.physics.add.collider(this.player, asador);
      this.physics.add.collider(this.player2, asador);
      this.Interactuables.push(asador);
    }
    console.log(this.Interactuables)
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
    this.CaceriaKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.recetarioKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
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
      if (this.nearestBox.activeBox) {
        this.nearestBox.onInteract(this.player)
        console.log(`Se presionó tecla de accion en: ${this.nearestBox}`)
      } else {
        if (this.player.holdingItem) {
          this.player.holdingSM.changeState("none", { player: this.player })

        } else {
          console.log("Nothing at hand")
        }
      }
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST, "player1") && this.player.holdingItem) {
      const itemToThrow = this.player.itemHolded;
      this.player.holdingSM.changeState("none", { player: this.player });

      const speed = 600;
      itemToThrow.thrownBy = 1;
      itemToThrow.body.setVelocity(this.player.lastDirection.x * speed, this.player.lastDirection.y * speed);
      this.lanzarAudio.play({
        volume: .4,
        rate: 1
      })
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH, "player1")) {
      this.player.dash()
    }
    //PLAYER 2 ----------------------------------------------------------------------------
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player2")) {
      if (this.nearestBox2.activeBox2) {
        this.nearestBox2.onInteract(this.player2)
        console.log("Action key pressed!")
      } else {
        if (this.player2.holdingItem) {
          this.player2.holdingSM.changeState("none", { player: this.player2 })

        } else {
          console.log("Nothing at hand")
        }
      }
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST, "player2") && this.player2.holdingItem) {
      const itemToThrow = this.player2.itemHolded;
      this.player2.holdingSM.changeState("none", { player: this.player2 });

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
    if (Phaser.Input.Keyboard.JustDown(this.recetarioKey)) {
      this.recetario.onInput()
    }
    if (Phaser.Input.Keyboard.JustDown(this.CaceriaKey)) {
      this.registry.set("actualLevel", this.actualLevel + 1)
      this.sound.stopAll();
      this.scene.stop("HUD");
      this.cameras.main.fadeOut(400);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("Load", { nextScene: "Caceria" });
      });
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

  _getClosestBox(player) {
    if (!player || !player.body) {
      return null;
    }

    let minDist = Infinity;
    let nearest = null;


    //buscar la caja más cercana
    for (const box of this.Interactuables) {
      if (!box.grabbed) {
        const dActual = box.getDistSqToPlayer(player);

        if (dActual < minDist) {
          minDist = dActual;
          nearest = box;
        } else if (dActual === minDist) {
          if (box !== nearest) {
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
    this.registry.set("actualLevel", this.actualLevel + 1)
    // Detenemos el HUD y lanzamos la escena de victoria
    this.scene.stop("HUD");
    // Opcional: animación de cámara antes de cambiar (fade)
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("Load", { nextScene: "Caceria" });
    });
  }

  onPlayerDeath(reason, mode = 1) {

    if (mode === 1) {
      this.registry.set("actualLevel", 1)
      this.sound.stopAll();
      this.scene.stop("HUD");
      this.cameras.main.fadeOut(400);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("Defeat", { reason });
      });
    } else if (mode === 2) {
      this.registry.set("actualLevel", 1)
      this.sound.stopAll();
      this.scene.stop("HUD");
      this.cameras.main.fadeOut(400);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("Victory", { reason });
      });
    }
  }

  spawnPedidos() {
    // busca una posición libre
    let y = this.posicionesPedidos.find(
      pos => !this.Interactuables.some(p => p.y === pos && p.availableIngredients)
    );

    if (!y) { // no hay lugar libre
      const hud = this.scene.get("HUD");
      if (hud && hud.scene.isActive()) {
        hud.addPedidosEnCola(1);
      }
    } else {
      let pedido = new Task(this, 40, y, this.pedidosDisponibles);
      this.physics.add.collider(this.player, pedido);
      this.physics.add.collider(this.player2, pedido);
      this.Interactuables.push(pedido);
      this.pedidoNuevoAudio.play({
        volume: 0.2, // Ajusta el volumen
        rate: 1    // Ajusta el pitch
      });
    }
  }

  checkTaskQueue() {
    if (this.scene.get("HUD").getPedidosEnCola() > 0) {
      this.spawnPedidos();
      this.scene.get("HUD").subsPedidosEnCola(1);
    }
  }
}
