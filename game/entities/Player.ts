import Phaser from 'phaser'
import { GameState } from '../systems/GameState'

export class Player extends Phaser.Physics.Arcade.Sprite {
  private keys: any
  private speed: number = 160
  private attacking: boolean = false
  private weapon: Phaser.GameObjects.Sprite
  private gameState: GameState

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player')

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)
    this.setScale(1.5)
    this.gameState = GameState.getInstance()

    // Create weapon sprite
    this.weapon = scene.add.sprite(0, 0, this.gameState.equippedWeapon)
    this.weapon.setScale(1.5)
    this.weapon.setVisible(false)

    this.setupInput()
    this.createAnimations()
  }

  private setupInput() {
    this.keys = this.scene.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      attack: Phaser.Input.Keyboard.KeyCodes.SPACE,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      inventory: Phaser.Input.Keyboard.KeyCodes.I,
      potion: Phaser.Input.Keyboard.KeyCodes.P
    })

    this.scene.input.keyboard!.on('keydown-SPACE', () => {
      if (!this.attacking) {
        this.attack()
      }
    })

    this.scene.input.keyboard!.on('keydown-P', () => {
      if (this.gameState.usePotion()) {
        this.scene.events.emit('playerHealed')
      }
    })

    this.scene.input.keyboard!.on('keydown-E', () => {
      this.scene.events.emit('interact')
    })

    this.scene.input.keyboard!.on('keydown-I', () => {
      this.scene.events.emit('toggleInventory')
    })
  }

  private createAnimations() {
    // Animations will be simple position-based for procedural sprites
  }

  update() {
    if (this.attacking) return

    let velocityX = 0
    let velocityY = 0

    if (this.keys.left.isDown) {
      velocityX = -this.speed
      this.setFlipX(true)
    } else if (this.keys.right.isDown) {
      velocityX = this.speed
      this.setFlipX(false)
    }

    if (this.keys.up.isDown) {
      velocityY = -this.speed
    } else if (this.keys.down.isDown) {
      velocityY = this.speed
    }

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707
      velocityY *= 0.707
    }

    this.setVelocity(velocityX, velocityY)

    // Update weapon position
    if (this.weapon.visible) {
      this.weapon.setPosition(this.x + (this.flipX ? -20 : 20), this.y)
    }
  }

  private attack() {
    this.attacking = true
    this.weapon.setVisible(true)

    const attackDirection = this.flipX ? -1 : 1
    this.weapon.setPosition(this.x + (attackDirection * 20), this.y)
    this.weapon.setFlipX(this.flipX)

    // Attack animation
    this.scene.tweens.add({
      targets: this.weapon,
      angle: attackDirection * 90,
      duration: 150,
      yoyo: true,
      onComplete: () => {
        this.weapon.setVisible(false)
        this.weapon.angle = 0
        this.attacking = false
      }
    })

    // Emit attack event for combat system
    this.scene.events.emit('playerAttack', {
      x: this.x + (attackDirection * 40),
      y: this.y,
      damage: 10 + (this.gameState.playerLevel * 2)
    })
  }

  takeDamage(amount: number) {
    this.gameState.takeDamage(amount)

    // Flash red
    this.setTint(0xff0000)
    this.scene.time.delayedCall(200, () => {
      this.clearTint()
    })

    if (this.gameState.playerHealth <= 0) {
      this.die()
    }
  }

  private die() {
    this.setVelocity(0, 0)
    this.setTint(0x000000)
    this.scene.events.emit('playerDied')
  }

  getWeaponSprite(): Phaser.GameObjects.Sprite {
    return this.weapon
  }
}
