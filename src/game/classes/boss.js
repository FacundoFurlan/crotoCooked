import { State } from "../state/State";
import { StateMachine } from "../state/StateMachine";


export class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    this.scene = scene;
    this.hp = 300;
    this.maxHp = 300;
    this.attackCooldown = 2000;
    this.isAttacking = false;
    this.lastAttack = 0;
    this.isAlive = true;
    this.fx = this.preFX.addColorMatrix();
    this.highlighted = false;
    this.highlightedTimer = 0;
    this.healthBar = this.scene.add.graphics();
    this.healthBar.setDepth(20);
    this.targetHpWidth = 60; // ancho objetivo para tween
    this.currentHpWidth = 60; // ancho actual
    this.barWidth = 60;
    this.barHeight = 8;
    
    // Agregar a escena y sistema de físicas
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.setImmovable(true);
    this.setCollideWorldBounds(true);
    this.setDepth(10);
    this.setScale(.2)

    //Máquina de estados del boss
    this.behaviorSM = new StateMachine("appear");
    this.behaviorSM.addState("appear", new AppearState());
    this.behaviorSM.addState("idle", new BossIdleState());
    this.behaviorSM.addState("attack", new AttackState());
    this.behaviorSM.addState("hurt", new HurtState());
    this.behaviorSM.addState("dead", new DeadState());
    this.behaviorSM.changeState("appear", { boss: this });
  }
  
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.isDead) return;

    if (this.isAttacking) {
      this.setVelocity(0, 0);
      return;
    }

    const target = this.getClosestPlayer();
    if (target) {
      this.scene.physics.moveToObject(this, target, this.speed);
    } else {
      this.setVelocity(0, 0);
    }
  }
  
  updateHealthBar(dt) {
    const x = this.x - this.barWidth / 2;
    const y = this.y - 20; // 20px arriba del boss

    // Smooth tween del ancho
    const targetWidth = (this.hp / this.maxHp) * this.barWidth;
    const lerpSpeed = 0.1; // ajusta para suavidad
    this.currentHpWidth += (targetWidth - this.currentHpWidth) * lerpSpeed;

    // Color según porcentaje
    const hpPercent = this.currentHpWidth / this.barWidth;
    let color = 0x00ff00; // verde
    if (hpPercent < 0.5) color = 0xffff00; // amarillo
    if (hpPercent < 0.25) color = 0xff0000; // rojo

    this.healthBar.clear();

    // Fondo
    this.healthBar.fillStyle(0x000000);
    this.healthBar.fillRect(x, y, this.barWidth, this.barHeight);

    // Vida
    this.healthBar.fillStyle(color);
    this.healthBar.fillRect(x, y, this.currentHpWidth, this.barHeight);
  }

  getClosestPlayer() {
    const players = [];
    if (this.scene.player) players.push(this.scene.player);
    if (this.scene.player2) players.push(this.scene.player2);

    if (players.length === 0) return null;

    let closest = players[0];
    let closestDist = Phaser.Math.Distance.Between(this.x, this.y, closest.x, closest.y);

    for (let i = 1; i < players.length; i++) {
      const p = players[i];
      const dist = Phaser.Math.Distance.Between(this.x, this.y, p.x, p.y);
      if (dist < closestDist) {
        closest = p;
        closestDist = dist;
      }
    }
    return closest;
  }

  update(dt) {
    if (this.isAlive) {
      this.behaviorSM.update(dt);
      this.lastAttack += dt;
      this.highlightedTimer -= dt;
      if(this.highlightedTimer <= 0 && this.highlighted){
        this.highlighted = false;
        this.fx.brightness(1);
      }
      // Actualizar posición de la barra
      this.updateHealthBar(dt);
    }
  }

  takeDamage(amount) {
    if (!this.isAlive) return;
    const cooldown = 50;
    
    // --- Cooldown de daño ---
    const now = this.scene.time.now;
    if (this.lastHitTime && now - this.lastHitTime < cooldown) {
      return; // Ignora si fue golpeado hace menos de cooldown ms
    }
    this.lastHitTime = now;

    // --- Aplicar daño ---
    this.hp -= amount;
    console.log(`%cBoss HP: ${this.hp}/${this.maxHp}`, "color: yellow");

    // --- Flash blanco visual ---
    this._flashWhite(cooldown); // <- brilla cooldownms

    // --- Cambiar estado ---
    this.behaviorSM.changeState("hurt", { boss: this });
  }

  _flashWhite(cooldown) {
    console.log("Iluminando")
    this.fx.brightness(80);
    this.highlighted = true;
    this.highlightedTimer = cooldown;
  }
  
}

class AppearState extends State {
  init(params) {
    this.boss = params.boss;
    console.log("%cBoss aparece en escena", "color: purple");
    this.timer = 0;
    this.duration = 1500;
    this.boss.setAlpha(0);
    this.boss.scene.tweens.add({
      targets: this.boss,
      alpha: 1,
      duration: this.duration,
      onComplete: () => {
        this.boss.behaviorSM.changeState("idle", { boss: this.boss });
      }
    });
  }

  update(dt) {
    this.timer += dt;
  }
}

class BossIdleState extends State {
  init(params) {
    this.boss = params.boss;
  }

  update(dt) {
    // Espera y luego pasa a ataque
    if (this.boss.lastAttack >= this.boss.attackCooldown) {
      this.boss.behaviorSM.changeState("attack", { boss: this.boss });
    }
  }

  finish() {
  }
}

class AttackState extends State {
  init(params) {
    this.boss = params.boss;
    console.log("%cBoss lanza ataque dirigido", "color: orange");

    this.attackDuration = 1000;
    this.elapsed = 0;
    this.boss.lastAttack = 0;

    this.boss.setTint(0xff0000); // feedback visual
    this.boss.setVelocity(0, 0); // boss queda quieto
    this.boss.isAttacking = true;

    // --- Identificar objetivo ---
    this.target = this.boss.getClosestPlayer();
    if(!this.target) return;

    // Vector de dirección normalizado
    const dir = new Phaser.Math.Vector2(
      this.target.x - this.boss.x,
      this.target.y - this.boss.y
    ).normalize();

    // --- Hitbox ---
    const hitboxDistance = 50; // distancia desde el boss
    const hitboxSize = { w: 60, h: 60 };

    this.hitbox = this.boss.scene.add.rectangle(
      this.boss.x + dir.x * hitboxDistance,
      this.boss.y + dir.y * hitboxDistance,
      hitboxSize.w,
      hitboxSize.h,
      0xff0000,
      0.3
    );

    this.boss.scene.physics.add.existing(this.hitbox);
    this.hitbox.body.setAllowGravity(false);
    this.hitbox.body.setImmovable(true);

    // Colisiones con players
    const players = [];
    if(this.boss.scene.player) players.push(this.boss.scene.player);
    if(this.boss.scene.player2) players.push(this.boss.scene.player2);

    players.forEach(player => {
      this.boss.scene.physics.add.overlap(this.hitbox, player, () => {
        player.takeDamage?.(20);
        console.log(`%cplayer${player.kind} took damage`, "color: yellow")
      });
    });
  }

  update(dt) {
    this.elapsed += dt;

    if(this.elapsed >= this.attackDuration) {
      this.boss.behaviorSM.changeState("idle", { boss: this.boss });
    }
  }

  finish() {
    this.boss.clearTint();
    this.boss.isAttacking = false;
    if(this.hitbox) this.hitbox.destroy();
  }
}

class HurtState extends State {
  init(params) {
    this.boss = params.boss;
    console.log("%cBoss recibe daño", "color: red");
    this.timer = 0;
    this.duration = 300;

    if (this.boss.hp <= 0) {
      this.boss.behaviorSM.changeState("dead", { boss: this.boss });
    }
  }

  update(dt) {
    this.timer += dt;
    if (this.timer >= this.duration) {
      this.boss.clearTint();
      if (this.boss.hp > 0) {
        this.boss.behaviorSM.changeState("idle", { boss: this.boss });
      }
    }
  }
}

class DeadState extends State {
  init(params) {
    this.boss = params.boss;
    console.log("%cBoss muere", "color: gray");
    this.boss.isAlive = false;
    this.boss.scene.tweens.add({
      targets: this.boss,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.boss.destroy();
      }
    });
  }
}
