export class CircularTimer {
    constructor(scene, x, y, radius = 20, duration = 2000, onComplete = null) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.duration = duration;
        this.onComplete = onComplete;

        // Gráfico base
        this.circle = scene.add.graphics();
        this.circle.setDepth(10); // <-- depth alto para estar encima de todo
        this.circle.lineStyle(4, 0xffffff);
        this.circle.strokeCircle(this.x, this.y, this.radius);
        this.circle.setVisible(false)

        // Progreso
        this.progress = 0;
        this.active = false;
    }

    start() {
        this.progress = 0;
        this.active = true;
        this.circle.setVisible(true)
    }

    stop() {
        this.active = false;
        this.progress = 0;
        this.draw();
        this.circle.setVisible(false)
    }

    update(dt) {
        if (!this.active) return;

        this.progress += dt;
        if (this.progress >= this.duration) {
            this.stop()
            if (this.onComplete) {
                this.onComplete()
            }
        }
        this.draw();
    }

    draw() {
        this.circle.clear();
        this.circle.lineStyle(4, 0xffffff);
        this.circle.strokeCircle(this.x, this.y, this.radius);

        if (this.active) {
            let angle = (this.progress / this.duration) * Phaser.Math.PI2;
            if ((this.progress * 100) / this.duration < 50) {
                this.circle.lineStyle(4, 0x00ff00);
            } else if ((this.progress * 100) / this.duration < 80) {
                this.circle.lineStyle(4, 0xffbf00);
            } else {
                this.circle.lineStyle(4, 0xff0000);
            }
            this.circle.beginPath();
            this.circle.arc(this.x, this.y, this.radius, -Math.PI / 2, -Math.PI / 2 + angle, false);
            this.circle.strokePath();
        }
    }
}
