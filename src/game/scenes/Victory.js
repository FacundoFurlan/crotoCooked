import InputSystem, { INPUT_ACTIONS } from "../../utils/InputSystem";

export class Victory extends Phaser.Scene {
  constructor() {
    super("Victory");
  }

  init(data) {
    // recibe datos opcionales desde Game (ej: score, time)
    this.reason = data.reason ?? null;
    this.empate = data.empate || false
    this.completado = data.completado || false
    this.boss = data.boss || false
  }

  create() {
    const { width, height } = this.scale;

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

    // fondo semi-transparente
    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);

    if (this.reason) {
      this.add.text(width / 2, height / 2 - 10, `Motivo: ${this.reason}`, { fontFamily: "MyFont", fontSize: "18px" }).setOrigin(0.5);
    }
    // texto grande
    this.titulo = this.add.text(width / 2, height / 2 - 60, "", {
      fontFamily: "MyFont",
      fontSize: "48px",
      color: "#ffff00",
      align: "center"
    }).setOrigin(0.5);


    if (this.registry.get("mode") === 1) { // COOP

      let text = ""
      if (this.completado) {
        text = "¡CONTRATADOS!";
      }
      else {
        text = "¡DESPEDIDOS!";
        this.titulo.setColor("#ff5555");
      }

      this.titulo.setText(text)

      //Puntos
      this.add.text(width / 2, height / 2 + 20, `Puntaje: ${this.registry.get("coopPoints")}`, { fontFamily: "MyFont", fontSize: "20px" }).setOrigin(0.5);

    } else if (this.registry.get("mode") === 2) { // VERSUS

      let text = ""
      if (this.boss) { // si boss = true entonces perdieron en la caceria y nadie gana, si boss = false y no hay empate entonces gana uno y pierde el otro
        text = "¡DESPEDIDOS!";
        this.titulo.setColor("#ff5555");
      } else if (this.empate) {
        text = "EMPATE";
      } else {
        text = "¡VICTORIA!";
      }

      this.titulo.setText(text)

      //Puntos VS
      this.add.text(width / 2, height / 2 + 20, `Puntaje: ${this.registry.get("vsPoints1")}`, { fontFamily: "MyFont", fontSize: "20px", color: "#E3C0A1" }).setOrigin(0.5);
      this.add.text(width / 2, height / 2 + 40, `Puntaje: ${this.registry.get("vsPoints2")}`, { fontFamily: "MyFont", fontSize: "20px", color: "#59493F" }).setOrigin(0.5);
    }

    // Botones: Reiniciar o Volver al menú
    const retry = this.add.text(width / 2, height / 2 + 80, "□ DE NUEVO!", { fontFamily: "MyFont", fontSize: "20px" }).setOrigin(0.5);
    const menu = this.add.text(width / 2, height / 2 + 120, "⭘ VOLVER AL MENÚ", { fontFamily: "MyFont", fontSize: "20px" }).setOrigin(0.5);

    // Aseguramos que esta escena quede arriba
    this.scene.bringToTop();
  }

  update(t, dt) {
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player1") || this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player2")) {
      console.log("De nuevo!")
      this.registry.set("actualLevel", 1);
      if (this.registry.get("mode") === 1) {
        this.registry.set("coopPoints", 0)
      } else if (this.registry.get("mode") === 2) {
        this.registry.set("vsPoints1", 0)
        this.registry.set("vsPoints2", 0)
      }
      this.scene.stop("HUD");
      this.scene.stop("Game");
      this.scene.start("Game");
      this.scene.launch("HUD");
    }
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST, "player1") || this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST, "player2")) {
      console.log("Menu!")
      this.scene.stop("HUD");
      this.scene.stop("Game");
      this.scene.start("MainMenu");
    }
  }
}
