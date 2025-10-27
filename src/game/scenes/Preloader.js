

export class Preloader extends Phaser.Scene {
    constructor() {
        super("Preloader")
        this.fontReady = false;
        this.ready = false;
        this.timerReady = false;
    }

    preload() {
        //PRELOAD
        this.currentCycle = "preload"
        this.load.setPath("assets");
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Paso 1: cargar solo el ícono de carga
        this.load.image("campana", "SS_Campanilla.png");
        this.add.text(width / 2, height / 1.35, "Este símbolo significa que está cargando!", {
            fontFamily: "MyFont",
            fontSize: "22px",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.load.once("complete", () => {
            // Mostrar sprite animado
            this.loaderSprite = this.add.sprite(width / 2, height / 2 + 130, "campana").setScale(2);
            this.tweens.add({
                targets: this.loaderSprite,
                scale: 3,
                duration: 200,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });

            this.time.delayedCall(1000, () => {
                this.timerReady = true;
            });

            // Paso 2: cargar el resto de los assets
            this.loadRemainingAssets();
            this.load.start();
        });

        this.load.start(); // inicia el paso 1    
    }

    loadRemainingAssets() {
        this.load.setPath("assets");

        //IMAGENES ------------------------------------------
        this.load.image("background", "BG_Dia_01(1).png");
        this.load.image("freidora", "SS_Freidora_0.png");
        this.load.image("freidoraOn", "SS_Freidora_1.png");
        this.load.image("caja", "SS_Caja.png");
        this.load.image("orden", "SS_Orden.png");
        this.load.image("tabla", "SS_Tablones.png");
        this.load.image("cenizas", "SS_Asador_Cenizas.png");
        this.load.image("iconoCarbon", "SS_Icono_Carbon.png");
        this.load.image("iconoCarbonActivado", "SS_Icono_Carbon_Activado.png");
        this.load.image("tablaCortar", "SS_Tabla.png");
        this.load.image("zonaEntrega", "SS_Layout Zona Entrega(1).png");
        this.load.image("libroReceta", "SS_LibroReceta.png");
        this.load.image("backgroundCaceria", "BG_Noche_01.png");
        this.load.image("lobo", "Lobison pixelart.png")
        this.load.image("heart", "Heart.png");
        this.load.image("menuBG", "Menu Principal(1).png");
        this.load.image("hoja", "hoja.png");
        this.load.image("indicadorRecetario", "SS_indicador_recetario.png");
        this.load.image("brasero", "SS_Brasero.png");
        this.load.image("icono", "SS_Icono_Admiracion.png");

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
        this.load.audio("golpePj", "./audio/PByA_PJ_Ataque_Golpe.mp3");
        this.load.audio("golpeBoss", "./audio/PByA_Boss_Lobizon_Ataque_Golpe.mp3");
        this.load.audio("muerteBoss", "./audio/PByA_Boss_Lobizon_Muerte.mp3");
        this.load.audio("ambienteBoss", "./audio/PByA_Boss_Lobizon_Ambiente.mp3");
        this.load.audio("musica_cumbia_1", "./audio/music/cumbiesita_1.mp3");
        this.load.audio("musica_boss_1", "./audio/music/boss musica.mp3");
        this.load.audio("musicaCuarteto", "./audio/music/Ultimate_Cuarteto.mp3");
        this.load.audio("musicaChacarera", "./audio/music/Ultimate_Chacarera.mp3");
        this.load.audio("ambienteCaceria", "./audio/PByA_Ambiente_Caceria_01.mp3");
        this.load.audio("ambienteCocina", "./audio/PByA_Ambiente_Cocina_01.mp3");

        //SPRITESHEETS--------------------------------
        this.load.spritesheet("bossAttack1", "SS_Atack-1.png", { frameWidth: 197, frameHeight: 110 })
        this.load.spritesheet("bossAttack2", "SS_Atack-2.png", { frameWidth: 197, frameHeight: 110 })
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
        this.load.spritesheet("particleHumo", "SS_Particulas_Humo.png", { frameWidth: 20, frameHeight: 20 })
        this.load.spritesheet("particleHumo2", "SS_Particulas_Humo2.png", { frameWidth: 10, frameHeight: 10 })
        this.load.spritesheet("particlePolvo", "SS_Particulas_Polvo.png", { frameWidth: 20, frameHeight: 20 })
        this.load.spritesheet("particlePolvo2", "SS_Particulas_Polvo2.png", { frameWidth: 10, frameHeight: 10 })
        this.load.spritesheet("nivelCarbon", "SS_Nivel de Carbon.png", { frameWidth: 40, frameHeight: 31 })

        this.load.on("complete", () => {
            this.assetsReady = true;
        });
    }

    create() {
    }

    update() {
        // Esperar que TODO esté listo antes de pasar
        if (this.assetsReady && this.timerReady) {

            this.tweens.add({
                targets: this.loaderSprite,
                scale: 5,
                duration: 400,
                yoyo: true,
                ease: "Back.easeOut"
            });

            this.time.delayedCall(400, () => {
                this.scene.start("MainMenu")
            });
        }
    }
}