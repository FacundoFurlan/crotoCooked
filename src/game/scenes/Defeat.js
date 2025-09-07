export class Defeat extends Phaser.Scene {
  constructor() {
    super("Defeat");
  }

  init(data) {
    this.reason = data.reason ?? null; // opcional
    this.score = data.score ?? 0;
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);

    this.add.text(width/2, height/2 - 60, "DERROTA", {
      fontFamily: "Arial",
      fontSize: "48px",
      color: "#ff5555",
      align: "center"
    }).setOrigin(0.5);

    if (this.reason) {
      this.add.text(width/2, height/2 - 10, `Motivo: ${this.reason}`, { fontSize: "18px" }).setOrigin(0.5);
    }

    this.add.text(width/2, height/2 + 20, `Puntaje: ${this.score}`, { fontSize: "20px" }).setOrigin(0.5);

    const retry = this.add.text(width/2, height/2 + 80, "REINTENTAR", { fontSize: "20px" }).setOrigin(0.5).setInteractive();
    const menu = this.add.text(width/2, height/2 + 120, "VOLVER AL MENÚ", { fontSize: "20px" }).setOrigin(0.5).setInteractive();

    retry.on("pointerdown", () => {
      this.scene.stop("HUD");
      this.scene.stop("Game");
      this.scene.start("Game");
      this.scene.launch("HUD");
    });

    menu.on("pointerdown", () => {
      this.scene.stop("HUD");
      this.scene.stop("Game");
      this.scene.start("MainMenu");
    });

    this.scene.bringToTop();
  }
}
