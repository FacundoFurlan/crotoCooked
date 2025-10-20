export class Preloader extends Phaser.Scene {
    constructor() {
        super("Preloader")
        this.assetsReady = false;
        this.fontReady = false;
    }

    preload() {
        //PRELOAD
        this.currentCycle = "preload"
        this.load.setPath("assets");

        //para cargar la fuente
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');


        //IMAGENES ------------------------------------------
        this.load.image("background", "BG_Dia_01(1).png");
        this.load.image("freidora", "SS_Freidora_0.png");
        this.load.image("freidoraOn", "SS_Freidora_1.png");
        this.load.image("caja", "SS_Caja.png");
        this.load.image("orden", "SS_Orden.png");
        this.load.image("tabla", "SS_Tablones.png");
        this.load.image("cenizas", "SS_Asador_Cenizas.png");
        this.load.image("iconoCarbon", "SS_Icono_Carbon.png");
        this.load.image("tablaCortar", "SS_Tabla.png");
        this.load.image("zonaEntrega", "SS_Layout Zona Entrega(1).png");
        this.load.image("libroReceta", "SS_LibroReceta.png");
        this.load.image("backgroundCaceria", "BG_Noche_01.png");
        this.load.image("lobo", "Lobison pixelart.png")
        this.load.image("heart", "Heart.png");
        this.load.image("campana", "SS_Campanilla.png");
        this.load.image("menuBG", "Menu Principal.png");

        //AUDIO----------------------------------------
        this.load.audio("caminar_pasto", "./audio/PByA_PJ_Caminar_Pasto.mp3");
        this.load.audio("coccion", "./audio/PByA_MT_Parrilla_Coccion.mp3");
        this.load.audio("picar", "./audio/PByA_MT_Tabla_Cortar.mp3");
        this.load.audio("picarListo", "./audio/PByA_MT_Tabla_Listo.mp3");
        this.load.audio("fritar", "./audio/PByA_MT_Freidora_Coccion.mp3");
        this.load.audio("coccionListo", "./audio/PByA_Coccion.mp3");
        this.load.audio("dash", "./audio/PByA_PJ_Dash.mp3");
        this.load.audio("agarrar", "./audio/PByA_Objeto.mp3");
        this.load.audio("lanzar", "./audio/PByA_Objeto_Lanzar.mp3");
        this.load.audio("caja", "./audio/PByA_MT_Caja_Abrir.mp3");
        this.load.audio("pedidoNuevo", "./audio/PByA_Hud_Pedido_Nuevo.mp3");
        this.load.audio("pedidoEntregado", "./audio/PByA_Hud_Pedido_Entregado.mp3");
        this.load.audio("dinero", "./audio/PByA_Hud_Dinero.mp3");
        this.load.audio("tiempoEmpieza", "./audio/PByA_Hud_Tiempo_Empieza.mp3");
        this.load.audio("tiempoCritico", "./audio/PByA_Hud_Tiempo_Critico.mp3");
        this.load.audio("tiempoFin", "./audio/PByA_Hud_Tiempo_Fin.mp3");
        this.load.audio("musica_cumbia_1", "./audio/music/cumbiesita_1.mp3");

        //SPRITESHEETS--------------------------------
        this.load.spritesheet("bossAttack1", "SS_Atack-1.png", { frameWidth: 197, frameHeight: 110 })
        this.load.spritesheet("player1", "SS_PJ1(1).png", { frameWidth: 30, frameHeight: 47 })
        this.load.spritesheet("player2", "SS_PJ2(1).png", { frameWidth: 30, frameHeight: 47 })
        this.load.spritesheet("player1Attack", "SS_PJ1_Golpe.png", { frameWidth: 41, frameHeight: 47 })
        this.load.spritesheet("player2Attack", "SS_PJ2_Golpe.png", { frameWidth: 41, frameHeight: 47 })
        this.load.spritesheet("playerAttackWoosh", "SS_Woosh1_PJ.png", { frameWidth: 40, frameHeight: 30 })
        this.load.spritesheet("ingredientesAtlas", "SS_Ingredientes(1).png", { frameWidth: 20, frameHeight: 20 })
        this.load.spritesheet("asador", "SS_Asador.png", { frameWidth: 25, frameHeight: 25 })
        this.load.spritesheet("brasas", "SS_Asador_Brasas.png", { frameWidth: 32, frameHeight: 32 })
        this.load.spritesheet("mesa", "SS_Mesa.png", { frameWidth: 25, frameHeight: 25 })
        this.load.spritesheet("recetario1", "SS_Recetario_lvl1.png", { frameWidth: 206, frameHeight: 102 })
        this.load.spritesheet("recetario2", "SS_Recetario_lvl2.png", { frameWidth: 206, frameHeight: 102 })
        this.load.spritesheet("recetario3", "SS_Recetario_lvl3.png", { frameWidth: 206, frameHeight: 102 })
        this.load.spritesheet("recetario4", "SS_Recetario_lvl4.png", { frameWidth: 206, frameHeight: 102 })
        this.load.spritesheet("recetario5", "SS_Recetario_lvl5.png", { frameWidth: 206, frameHeight: 102 })
        this.load.spritesheet("recetario6", "SS_Recetario_lvl6.png", { frameWidth: 206, frameHeight: 102 })
        this.load.spritesheet("recetario7", "SS_Recetario_lvl7.png", { frameWidth: 206, frameHeight: 102 })

        //LOGICA DE CARGA
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBox = this.add.rectangle(width / 2, height / 2, 320, 50, 0x222222)
        const progressBar = this.add.rectangle(width / 2 - 150, height / 2, 0, 30, 0xffffff).setOrigin(0, .5);

        const loadingText = this.add.text(width / 2, height / 2 - 50, "Loading...", {
            fontFamily: "MyFont",
            fontSize: "20px",
            color: "#ffffff"
        }).setOrigin(.5)

        this.load.on("progress", (value) => {
            progressBar.width = 300 * value;
        });


        this.load.on("complete", () => {
            progressBox.destroy();
            progressBar.destroy();
            loadingText.destroy();
            this.assetsReady = true;
            this.tryStart();
        })
    }
    create() {
        WebFont.load({
            custom: {
                families: ['MyFont'],
            },
            active: () => {
                this.fontReady = true;
                this.tryStart();
            }
        });
    }
    tryStart() {
        if (this.assetsReady && this.fontReady) {
            this.scene.start("MainMenu");
        }
    }
}