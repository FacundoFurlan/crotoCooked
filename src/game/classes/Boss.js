import { State } from "../state/State";
import { StateMachine } from "../state/StateMachine";


export class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key, 0);
    this.scene = scene;
    this.actualLevel = this.scene.registry.get("actualLevel");
    this.hp = 500 * this.actualLevel;
    this.key = key
    this.speed = 210;
    this.maxHp = 500 * this.actualLevel;
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
    this.setScale(1)

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
      this.setFlipX(target.x > this.x ? true : false)
    } else {
      this.setVelocity(0, 0);
    }
  }
  
  updateHealthBar(dt) {
    const x = this.x - this.barWidth / 2;
    const y = this.y - 50; // 20px arriba del boss

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
    if (this.scene.player && this.scene.player.active && this.scene.player.visible) {
      players.push(this.scene.player);
    }
    if (this.scene.player2 && this.scene.player2.active && this.scene.player2.visible) {
      players.push(this.scene.player2);
    }

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
    const target = this.boss.getClosestPlayer();
    if (target) {
      const dist = Phaser.Math.Distance.Between(this.boss.x, this.boss.y, target.x, target.y);
      if (dist < 120 && this.boss.lastAttack >= this.boss.attackCooldown) {
        this.boss.behaviorSM.changeState("attack", { boss: this.boss });
      }
    }
  }
}

class AttackState extends State {
  init(params) {
    this.boss = params.boss;
    this.boss.isAttacking = true;
    this.boss.setVelocity(0, 0);
    this.boss.lastAttack = 0;

    // Buscar objetivo
    this.target = this.boss.getClosestPlayer();
    if (!this.target) {
      this.boss.behaviorSM.changeState("idle", { boss: this.boss });
      return;
    }

    // Calcular distancia y dirección
    const dx = this.target.x - this.boss.x;
    const dy = Math.abs(this.target.y - this.boss.y); // ignoramos vertical salvo diferencia muy grande
    const dist = Math.abs(dx);

    const attackRange = 120; // distancia máxima del ataque
    if (dist > attackRange || dy > 50) {
      // fuera de rango → no ataca
      this.boss.behaviorSM.changeState("idle", { boss: this.boss });
      this.boss.isAttacking = false;
      return;
    }

    // Determinar dirección (solo izquierda o derecha)
    const facingRight = dx >= 0;
    this.boss.setFlipX(facingRight);
    this.boss.play("boss_attack_1", true);


    this.hitboxFrames = new Set();
    this.boss.lastAttackFrameTime = 0;
    this.attackDelay = 350;

    this.boss.on("animationupdate", (anim, frame) => {
      if (anim.key === "boss_attack_1") {
        const triggerFrames = [2, 4, 6]; // frames donde el ataque pega
        if (triggerFrames.includes(frame.index) && !this.hitboxFrames.has(frame.index)) {

          const now = this.boss.scene.time.now;
          if(now - this.boss.lastAttackFrameTime >= this.attackDelay){
            this.spawnHitbox(facingRight);
            this.applyAttackStep();
            this.hitboxFrames.add(frame.index);
          }
        }
      }
    });

    // Volver a idle cuando termina
    this.boss.once(`animationcomplete`, () => {
      this.finishAttack();
    });
  }

  applyAttackStep() {
    const dx = this.target.x - this.boss.x;
    const facingRight = dx >= 0;
    this.boss.setFlipX(facingRight);
    const impulse = 60; // cuanto se mueve hacia adelante
    console.log("facing right:   ", facingRight)
    const dir = facingRight ? 1 : -1;

    this.boss.scene.tweens.add({
      targets: this.boss,
      x: this.boss.x + dir * impulse,
      duration: 120,
      ease: "Sine.easeOut"
    });
  }

  spawnHitbox(facingRight) {
    const hitboxSize = { w: 197, h: 110 };

    this.hitbox = this.boss.scene.add.rectangle(
      this.boss.x,
      this.boss.y,
      hitboxSize.w,
      hitboxSize.h,
      0xff0000,
      0.3
    );

    this.boss.scene.physics.add.existing(this.hitbox);
    this.hitbox.body.setAllowGravity(false);
    this.hitbox.body.setImmovable(true);

    const players = [];
    if (this.boss.scene.player) players.push(this.boss.scene.player);
    if (this.boss.scene.player2) players.push(this.boss.scene.player2);

    players.forEach(player => {
      this.boss.scene.physics.add.overlap(this.hitbox, player, () => {
        this.boss.scene.damagePlayer(player.kind);
      });
    });

    // hitbox dura poco
    this.boss.scene.time.delayedCall(200, () => {
      if (this.hitbox) this.hitbox.destroy();
    });
  }

  finishAttack() {
    this.boss.isAttacking = false;
    this.boss.clearTint();
    this.boss.setFlipX(false)
    this.boss.setFrame(0);
    this.boss.behaviorSM.changeState("idle", { boss: this.boss });
  }

  finish() {
    if (this.hitbox) this.hitbox.destroy();
    this.boss.off("animationupdate-boss_attack_1");
    this.boss.off("animationcomplete-boss_attack_1");
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
    const scene = this.boss.scene;
    console.log("%cBoss muere", "color: gray");
    this.boss.isAlive = false;
    this.boss.scene.tweens.add({
      targets: this.boss,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.boss.healthBar.destroy();
        this.boss.destroy();

        scene.time.delayedCall(1000, () => {
          scene.scene.start("Game");
          scene.scene.launch("HUD"); // lanzar HUD encima del Game
        });
      }
    });
  }
}
