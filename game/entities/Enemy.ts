import Phaser from 'phaser'
import { GameState } from '../systems/GameState'

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private health: number
  private maxHealth: number
  private damage: number
  private detectionRadius: number = 200
  private attackCooldown: number = 1000
  private lastAttackTime: number = 0
  private player: Phaser.Physics.Arcade.Sprite | null = null
  private enemyType: string
  private healthBar: Phaser.GameObjects.Graphics
  private aiState: 'idle' | 'patrol' | 'chase' | 'attack' = 'idle'
  private patrolTarget: { x: number, y: number } | null = null
  private spawnPoint: { x: number, y: number }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: string,
    player: Phaser.Physics.Arcade.Sprite
  ) {
    super(scene, x, y, type)

    this.enemyType = type
    this.player = player
    this.spawnPoint = { x, y }

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setScale(1.5)
    this.setCollideWorldBounds(true)

    // Set stats based on enemy type
    switch (type) {
      case 'slime':
        this.health = 30
        this.maxHealth = 30
        this.damage = 5
        break
      case 'skeleton':
        this.health = 50
        this.maxHealth = 50
        this.damage = 10
        break
      case 'goblin':
        this.health = 40
        this.maxHealth = 40
        this.damage = 8
        break
      default:
        this.health = 30
        this.maxHealth = 30
        this.damage = 5
    }

    // Create health bar
    this.healthBar = scene.add.graphics()
    this.updateHealthBar()
  }

  update(time: number) {
    if (!this.player || this.health <= 0) return

    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.player.x, this.player.y
    )

    // AI State Machine
    if (distance < 50) {
      this.aiState = 'attack'
      this.attackPlayer(time)
    } else if (distance < this.detectionRadius) {
      this.aiState = 'chase'
      this.chasePlayer()
    } else if (distance > this.detectionRadius + 100) {
      this.aiState = 'idle'
      this.returnToSpawn()
    } else {
      this.aiState = 'patrol'
      this.patrol()
    }

    this.updateHealthBar()
  }

  private chasePlayer() {
    if (!this.player) return

    const speed = this.enemyType === 'slime' ? 60 : 80
    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      this.player.x, this.player.y
    )

    this.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    )

    this.setFlipX(this.player.x < this.x)
  }

  private attackPlayer(time: number) {
    this.setVelocity(0, 0)

    if (time - this.lastAttackTime > this.attackCooldown) {
      this.lastAttackTime = time
      this.scene.events.emit('enemyAttack', {
        enemy: this,
        damage: this.damage
      })

      // Attack animation
      this.setTint(0xff0000)
      this.scene.time.delayedCall(100, () => {
        this.clearTint()
      })
    }
  }

  private patrol() {
    if (!this.patrolTarget) {
      this.patrolTarget = {
        x: this.spawnPoint.x + Phaser.Math.Between(-100, 100),
        y: this.spawnPoint.y + Phaser.Math.Between(-100, 100)
      }
    }

    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.patrolTarget.x, this.patrolTarget.y
    )

    if (distance < 10) {
      this.patrolTarget = null
      this.setVelocity(0, 0)
    } else {
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        this.patrolTarget.x, this.patrolTarget.y
      )
      this.setVelocity(Math.cos(angle) * 40, Math.sin(angle) * 40)
    }
  }

  private returnToSpawn() {
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.spawnPoint.x, this.spawnPoint.y
    )

    if (distance < 10) {
      this.setVelocity(0, 0)
      this.health = this.maxHealth
    } else {
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        this.spawnPoint.x, this.spawnPoint.y
      )
      this.setVelocity(Math.cos(angle) * 60, Math.sin(angle) * 60)
    }
  }

  takeDamage(amount: number) {
    this.health -= amount
    this.updateHealthBar()

    // Flash white
    this.setTint(0xffffff)
    this.scene.time.delayedCall(100, () => {
      this.clearTint()
    })

    if (this.health <= 0) {
      this.die()
    }
  }

  private die() {
    // Drop rewards
    const gameState = GameState.getInstance()
    const goldDrop = Phaser.Math.Between(5, 15)
    const expDrop = this.maxHealth * 2

    gameState.addGold(goldDrop)
    gameState.addExp(expDrop)

    this.scene.events.emit('enemyKilled', {
      type: this.enemyType,
      x: this.x,
      y: this.y,
      gold: goldDrop,
      exp: expDrop
    })

    // Death animation
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0.5,
      duration: 300,
      onComplete: () => {
        this.healthBar.destroy()
        this.destroy()
      }
    })
  }

  private updateHealthBar() {
    this.healthBar.clear()

    const barWidth = 40
    const barHeight = 4
    const x = this.x - barWidth / 2
    const y = this.y - 30

    // Background
    this.healthBar.fillStyle(0x000000)
    this.healthBar.fillRect(x, y, barWidth, barHeight)

    // Health
    const healthWidth = (this.health / this.maxHealth) * barWidth
    this.healthBar.fillStyle(0x00ff00)
    this.healthBar.fillRect(x, y, healthWidth, barHeight)
  }

  getType(): string {
    return this.enemyType
  }
}
