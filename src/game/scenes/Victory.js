export class Victory extends Phaser.Scene {
  constructor() {
    super("Victory");
  }

  init(data) {
    // recibe datos opcionales desde Game (ej: score, time)
    this.score = data.score ?? 0;
    this.stats = data.stats ?? null;
  }

  create() {
    const { width, height } = this.scale;

    // fondo semi-transparente
    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);

    // texto grande
    this.add.text(width/2, height/2 - 60, "¡VICTORIA!", {
      fontFamily: "MyFont",
      fontSize: "48px",
      color: "#ffff00",
      align: "center"
    }).setOrigin(0.5);

    // detalles / puntaje
    this.add.text(width/2, height/2, `Puntaje: ${this.score}`, {
      fontFamily: "MyFont",
      fontSize: "22px",
      color: "#ffffff"
    }).setOrigin(0.5);

    // Botones: Reiniciar o Volver al menú
    const restart = this.add.text(width/2, height/2 + 80, "REINICIAR", { fontSize: "20px" }).setOrigin(0.5).setInteractive();
    const menu = this.add.text(width/2, height/2 + 120, "VOLVER AL MENÚ", { fontSize: "20px" }).setOrigin(0.5).setInteractive();

    restart.on("pointerdown", () => {
      // Parar HUD antes de reiniciar si está lanzado
      this.scene.stop("HUD");
      this.scene.stop("Game");
      this.scene.start("Game");      // reinicia el juego
      this.scene.launch("HUD");      // relanza el HUD
    });

    menu.on("pointerdown", () => {
      this.scene.stop("HUD");
      this.scene.stop("Game");
      this.scene.start("MainMenu");
    });

    // Permitir también teclado (Enter -> reiniciar, Esc -> menú)
    this.input.keyboard.once("keydown-ENTER", () => restart.emit("pointerdown"));
    this.input.keyboard.once("keydown-ESC", () => menu.emit("pointerdown"));

    // Aseguramos que esta escena quede arriba
    this.scene.bringToTop();
  }
}
