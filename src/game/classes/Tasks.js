import { Interactuables } from "./Interactuables.js";
import { CircularTimer } from "./CircularTimer.js";
import { Ingredientes } from "./Ingredientes.js";

export class Task extends Interactuables {
    constructor(scene, x, y, availableIngredients = [], size = 48, textureKey = "orden") {

        super(scene, x, y, textureKey, size);

        this.scene = scene;
        this.textureKey = textureKey;
        this.availableIngredients = availableIngredients;
        this.ingredientList = [];
        this.ingredientAmount = Math.floor(Math.random() * 3) + 1;
        this.ordersLeft = this.ingredientAmount;
        this.itemsHolded = []

        this.zoneLayout = this.scene.add.image(x+84, y, "zonaEntrega")
        this.zoneLayout.setDepth(7)
        this.zoneLayout.setBlendMode(Phaser.BlendModes.LIGHTEN)

        for (let i = 0; i < this.ingredientAmount; i++) {
            const randomIndexPedidosDisponibles = Math.floor(Math.random() * this.availableIngredients.length)
            const nextIngredient = new Ingredientes(this.scene, x + 5, y + (20 * i) - 15, this.availableIngredients[randomIndexPedidosDisponibles]);
            nextIngredient.done = false;
            this.itemsHolded.push(nextIngredient);
            nextIngredient.setVisible(true)
        }

        this.taskDuration = 30000 * this.ingredientAmount;

        this.body.setCollideWorldBounds(true);
        this.body.setImmovable(true);
        this.body.setSize(this.body.width + 37, this.body.height-50)
        this.body.setOffset(this.body.offset.x + 50 / 2, this.body.offset.y)
        this.timerText = this.scene.add.text(x, y - 32, "ORDEN", {
            fontFamily: "MyFont",
            fontSize: "18px",
            color: "#3b7ffcff"
        }).setOrigin(.5);

        this.scene.Interactuables.forEach(other => {
            if (other !== this) {
                this.scene.physics.add.collider(this, other);

            }
        });

        this.circleTimer = new CircularTimer(scene, x + 26, y + 33, 8, this.taskDuration, () => { this.failTask() })
        this.circleTimer.start()
    }

    onInteract(player) {
        if (player.holdingItem) {
            console.log(player.itemHolded.textureKey)
            console.log(`%cItem del player: ${player.itemHolded.textureKey} e items del pedido: ${this.itemsHolded.join(", ")}`, "color: aqua")

            const atStart = this.ordersLeft;
            this.itemsHolded.forEach(order => {
                if (this.ordersLeft === atStart) {
                    if (player.itemHolded.textureKey === order.textureKey && !order.done) {
                        order.done = true;
                        this.ordersLeft--;

                        this.scene.Interactuables = this.scene.Interactuables.filter(i => i !== order);
                        order.destroy();
                        this.scene.Interactuables = this.scene.Interactuables.filter(i => i !== player.itemHolded);
                        const itemRef = player.itemHolded;
                        player.holdingSM.changeState("none", { player: player })
                        itemRef.destroy()
                        this.scene.pedidoEntregadoAudio.play({
                            volume: 0.5, // Ajusta el volumen
                            rate: 1    // Ajusta el pitch
                        });

                    }

                    if (this.ordersLeft <= 0) {
                        this.completeTask(player.kind);
                    }
                }
            });
        }
    }

    failTask() {
        if (this.scene.currentMode === 1) {
            let points = this.scene.registry.get("coopPoints");
            points -= 10;
            this.scene.registry.set("coopPoints", points < 0 ? 0: points);
            this.scene.scene.get("HUD").updatePoints();
            if (points < 0) {
                this.scene.onPlayerDeath("failed to cook")
            }
        } else if (this.scene.currentMode === 2) {
            let points1 = this.scene.registry.get("vsPoints1");
            let points2 = this.scene.registry.get("vsPoints2");
            points1 -= 10;
            points2 -= 10;
            this.scene.registry.set("vsPoints1", points1 < 0 ? 0 : points1);
            this.scene.registry.set("vsPoints2", points1 < 0 ? 0 : points1);
            this.scene.scene.get("HUD").updatePoints();
            if(points1 < 0 && points2 < 0){
                this.scene.onPlayerDeath("A los dos les falto calle", 2)
            }

            if (points1 < 0 || points2 < 0) {
                this.scene.onPlayerDeath(`Al jugador ${points1 < 0 ? 1 : 2} le falta calle`, 2)
            }
        }

        this.clearTask();
    }

    update(dt) {
        this.circleTimer.update(dt)
    }

    completeTask(playerId) {
        if (this.scene.currentMode === 1) {
            this.scene.registry.set("coopPoints", this.scene.registry.get("coopPoints") + 20);
            this.scene.scene.get("HUD").updatePoints()
        } else if (this.scene.currentMode === 2) {
            this.scene.registry.set(`vsPoints${playerId}`, this.scene.registry.get(`vsPoints${playerId}`) + 20);
            this.scene.scene.get("HUD").updatePoints()
        }
        this.scene.dineroAudio.play({
            volume: 0.5, // Ajusta el volumen
            rate: Phaser.Math.FloatBetween(.8, 1.4)   // Ajusta el pitch
        });

        this.clearTask();
    }

    clearTask(){
        this.scene.Interactuables = this.scene.Interactuables.filter(i => i !== this);
        this.setVisible(false);
        this.setPosition(300, 300);
        this.scene.checkTaskQueue();
        this.circleTimer.circle.setVisible(false);

        this.itemsHolded.forEach(element => {
            this.scene.Interactuables = this.scene.Interactuables.filter(i => i !== element);
            element.destroy();
        });

        this.circleTimer.circle.destroy();
        this.timerText.destroy();
        this.destroy()
    }
}