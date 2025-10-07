import { State } from "../state/State";
import { StateMachine } from "../state/StateMachine";


export class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    this.scene = scene;
    this.hp = 300;
    this.maxHp = 300;
    this.attackCooldown = 2000;
    this.lastAttack = 0;
    this.isAlive = true;
    
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
    console.log("PREUPTDATEEEEEEEEEEEEEEEEEEE")
    if (this.isDead) return;

    const target = this.getClosestPlayer();
    if (target) {
      this.scene.physics.moveToObject(this, target, this.speed);
    } else {
      this.setVelocity(0, 0);
    }
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
    }
  }

  takeDamage(amount) {
    if (!this.isAlive) return;
    this.hp -= amount;
    this.behaviorSM.changeState("hurt", { boss: this });
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
    console.log("%cBoss entra en Idle", "color: cyan");
  }

  update(dt) {
    // Espera y luego pasa a ataque
    if (this.boss.lastAttack >= this.boss.attackCooldown) {
      this.boss.behaviorSM.changeState("attack", { boss: this.boss });
    }
  }

  finish() {
    console.log("Boss sale de Idle");
  }
}

class AttackState extends State {
  init(params) {
    this.boss = params.boss;
    console.log("%cBoss lanza ataque", "color: orange");

    this.attackDuration = 1000;
    this.elapsed = 0;
    this.boss.lastAttack = 0;

    this.boss.setTint(0xff0000); // Feedback visual de ataque
  }

  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.attackDuration) {
      this.boss.behaviorSM.changeState("idle", { boss: this.boss });
    }
  }

  finish() {
    this.boss.clearTint();
  }
}

class HurtState extends State {
  init(params) {
    this.boss = params.boss;
    console.log("%cBoss recibe daño", "color: red");
    this.boss.setTint(0xffffff);
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
