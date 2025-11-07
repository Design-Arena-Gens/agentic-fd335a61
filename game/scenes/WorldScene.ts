import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { Enemy } from '../entities/Enemy'
import { NPC, DialogueNode } from '../entities/NPC'
import { WorldGenerator } from '../systems/WorldGenerator'
import { GameState } from '../systems/GameState'
import { HUD } from '../ui/HUD'
import { DialogueUI } from '../ui/DialogueUI'
import { Howl } from 'howler'

export default class WorldScene extends Phaser.Scene {
  private player!: Player
  private enemies: Enemy[] = []
  private npcs: NPC[] = []
  private hud!: HUD
  private dialogueUI!: DialogueUI
  private gameState!: GameState
  private tilemap!: Phaser.Tilemaps.Tilemap
  private collisionLayer!: Phaser.Tilemaps.TilemapLayer
  private backgroundLayers: Phaser.GameObjects.TileSprite[] = []
  private lightingLayer!: Phaser.GameObjects.Graphics
  private musicLoop: any
  private currentBiome: string = 'forest'

  constructor() {
    super({ key: 'WorldScene' })
  }

  create() {
    this.gameState = GameState.getInstance()

    // Generate world
    this.createWorld()

    // Create parallax background
    this.createParallaxBackground()

    // Create player
    this.player = new Player(this, 640, 360)

    // Spawn enemies
    this.spawnEnemies()

    // Spawn NPCs
    this.spawnNPCs()

    // Setup camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setZoom(1)

    // Create lighting layer
    this.createLightingEffects()

    // Setup collisions
    this.setupCollisions()

    // Create UI
    this.hud = new HUD(this)
    this.dialogueUI = new DialogueUI(this)

    // Setup event listeners
    this.setupEventListeners()

    // Initialize audio
    this.initializeAudio()

    // Start ambient effects
    this.createAmbientEffects()
  }

  private createWorld() {
    const biomeConfig = {
      name: 'forest',
      tileKey: 'forest_tiles',
      enemyTypes: ['slime', 'goblin'],
      enemyDensity: 0.01
    }

    this.tilemap = WorldGenerator.generateWorld(this, 3200, 2400, biomeConfig)
    this.collisionLayer = this.tilemap.getLayer('collision')?.tilemapLayer!
  }

  private createParallaxBackground() {
    // Create multiple parallax layers for depth
    const colors = [
      { color: 0x1a4d2e, speed: 0.1 },
      { color: 0x2d6a4f, speed: 0.3 },
      { color: 0x40916c, speed: 0.5 }
    ]

    colors.forEach((layer, index) => {
      const bg = this.add.tileSprite(0, 0, 3200, 2400, 'forest_tiles')
      bg.setTint(layer.color)
      bg.setAlpha(0.3)
      bg.setDepth(-10 + index)
      bg.setScrollFactor(layer.speed)
      this.backgroundLayers.push(bg)
    })
  }

  private createLightingEffects() {
    this.lightingLayer = this.add.graphics()
    this.lightingLayer.setDepth(50)

    // Create day/night cycle
    this.time.addEvent({
      delay: 20000,
      callback: this.updateLighting,
      callbackScope: this,
      loop: true
    })
  }

  private updateLighting() {
    this.lightingLayer.clear()

    // Dynamic lighting based on time
    const hour = (Date.now() / 1000) % 24
    let alpha = 0

    if (hour < 6 || hour > 18) {
      alpha = 0.6 // Night
    } else if (hour < 8 || hour > 16) {
      alpha = 0.3 // Dawn/Dusk
    }

    if (alpha > 0) {
      this.lightingLayer.fillStyle(0x000033, alpha)
      this.lightingLayer.fillRect(
        this.cameras.main.scrollX,
        this.cameras.main.scrollY,
        this.cameras.main.width,
        this.cameras.main.height
      )

      // Player light
      this.lightingLayer.fillStyle(0xffaa00, 0.4)
      this.lightingLayer.fillCircle(this.player.x, this.player.y, 150)
    }
  }

  private spawnEnemies() {
    const spawnPoints = [
      { x: 400, y: 300, type: 'slime' },
      { x: 800, y: 500, type: 'goblin' },
      { x: 1200, y: 400, type: 'slime' },
      { x: 1600, y: 700, type: 'skeleton' },
      { x: 2000, y: 600, type: 'goblin' },
      { x: 2400, y: 800, type: 'slime' },
      { x: 2800, y: 500, type: 'skeleton' },
      { x: 1000, y: 1200, type: 'goblin' },
      { x: 1800, y: 1400, type: 'skeleton' },
      { x: 2200, y: 1600, type: 'slime' }
    ]

    spawnPoints.forEach(spawn => {
      const enemy = new Enemy(this, spawn.x, spawn.y, spawn.type, this.player)
      this.enemies.push(enemy)
    })
  }

  private spawnNPCs() {
    // Village elder
    const elderDialogue: DialogueNode[] = [
      {
        id: 'elder_greeting',
        speaker: 'Village Elder',
        text: 'Greetings, traveler! Dark forces have been stirring in the forest. We need someone brave to investigate.',
        choices: [
          {
            text: 'Tell me more about these dark forces.',
            next: 'elder_explain'
          },
          {
            text: 'I will help you.',
            next: 'elder_accept',
            action: () => {
              this.gameState.activateQuest('main_quest_1')
              this.hud.showNotification('Quest Accepted: The Dark Forest', '#ffeb3b')
            }
          },
          {
            text: 'I must go.',
            next: null
          }
        ]
      },
      {
        id: 'elder_explain',
        speaker: 'Village Elder',
        text: 'Strange creatures have been appearing near the old ruins. They attack anyone who ventures too close. We fear something ancient has awakened.',
        choices: [
          {
            text: 'I will investigate.',
            next: 'elder_accept',
            action: () => {
              this.gameState.activateQuest('main_quest_1')
              this.hud.showNotification('Quest Accepted: The Dark Forest', '#ffeb3b')
            }
          },
          {
            text: 'That sounds dangerous. Farewell.',
            next: null
          }
        ]
      },
      {
        id: 'elder_accept',
        speaker: 'Village Elder',
        text: 'Thank you, brave one. May the spirits guide you. Return to me when you have defeated the creatures.',
        choices: [
          {
            text: 'I will return.',
            next: null
          }
        ]
      }
    ]

    const elder = new NPC(this, 500, 600, 'villager', 'Village Elder', elderDialogue)
    this.npcs.push(elder)

    // Merchant
    const merchantDialogue: DialogueNode[] = [
      {
        id: 'merchant_greeting',
        speaker: 'Wandering Merchant',
        text: 'Ah, a customer! I have rare wares from distant lands. Looking for anything specific?',
        choices: [
          {
            text: 'Show me your weapons.',
            next: 'merchant_weapons'
          },
          {
            text: 'Do you have any potions?',
            next: 'merchant_potions'
          },
          {
            text: 'Just browsing.',
            next: null
          }
        ]
      },
      {
        id: 'merchant_weapons',
        speaker: 'Wandering Merchant',
        text: 'I have a fine steel sword for 100 gold. Sharper than anything you will find elsewhere!',
        choices: [
          {
            text: 'I will take it.',
            next: null,
            action: () => {
              if (this.gameState.playerGold >= 100) {
                this.gameState.addGold(-100)
                this.gameState.addItem({
                  id: 'steel_sword',
                  name: 'Steel Sword',
                  type: 'weapon',
                  sprite: 'sword',
                  quantity: 1
                })
                this.hud.showNotification('Purchased: Steel Sword', '#00ff00')
              } else {
                this.hud.showNotification('Not enough gold!', '#ff0000')
              }
            }
          },
          {
            text: 'Too expensive. Maybe later.',
            next: null
          }
        ]
      },
      {
        id: 'merchant_potions',
        speaker: 'Wandering Merchant',
        text: 'Health potions are 20 gold each. They will restore your vitality in battle.',
        choices: [
          {
            text: 'Buy a potion.',
            next: null,
            action: () => {
              if (this.gameState.playerGold >= 20) {
                this.gameState.addGold(-20)
                this.gameState.addItem({
                  id: 'potion1',
                  name: 'Health Potion',
                  type: 'potion',
                  sprite: 'potion',
                  quantity: 1
                })
                this.hud.showNotification('Purchased: Health Potion', '#00ff00')
              } else {
                this.hud.showNotification('Not enough gold!', '#ff0000')
              }
            }
          },
          {
            text: 'Not right now.',
            next: null
          }
        ]
      }
    ]

    const merchant = new NPC(this, 800, 600, 'merchant', 'Wandering Merchant', merchantDialogue)
    this.npcs.push(merchant)

    // Guard
    const guardDialogue: DialogueNode[] = [
      {
        id: 'guard_greeting',
        speaker: 'Village Guard',
        text: 'Stay vigilant, traveler. The roads are not safe these days.',
        choices: [
          {
            text: 'What dangers lurk out there?',
            next: 'guard_warning'
          },
          {
            text: 'I can handle myself.',
            next: null
          }
        ]
      },
      {
        id: 'guard_warning',
        speaker: 'Village Guard',
        text: 'Goblins and worse roam the forests. Keep your weapon ready and trust no one in the ruins.',
        choices: [
          {
            text: 'Thank you for the warning.',
            next: null
          }
        ]
      }
    ]

    const guard = new NPC(this, 650, 600, 'guard', 'Village Guard', guardDialogue)
    this.npcs.push(guard)
  }

  private setupCollisions() {
    // Player collisions
    this.physics.add.collider(this.player, this.collisionLayer)

    // Enemy collisions
    this.enemies.forEach(enemy => {
      this.physics.add.collider(enemy, this.collisionLayer)
      this.physics.add.collider(enemy, this.player)
    })

    // NPC collisions
    this.npcs.forEach(npc => {
      this.physics.add.collider(npc, this.player)
    })
  }

  private setupEventListeners() {
    // Player attack
    this.events.on('playerAttack', (data: any) => {
      this.enemies.forEach(enemy => {
        const distance = Phaser.Math.Distance.Between(data.x, data.y, enemy.x, enemy.y)
        if (distance < 40) {
          enemy.takeDamage(data.damage)
          this.playSound('hit')
        }
      })
    })

    // Enemy attack
    this.events.on('enemyAttack', (data: any) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        data.enemy.x,
        data.enemy.y
      )
      if (distance < 50) {
        this.player.takeDamage(data.damage)
        this.hud.update()
        this.playSound('damage')
      }
    })

    // Enemy killed
    this.events.on('enemyKilled', (data: any) => {
      this.hud.showNotification(`+${data.gold} Gold, +${data.exp} XP`, '#ffeb3b')
      this.playSound('kill')

      // Spawn pickup
      const coin = this.add.sprite(data.x, data.y, 'coin')
      coin.setScale(2)
      this.tweens.add({
        targets: coin,
        y: coin.y - 30,
        alpha: 0,
        duration: 1000,
        onComplete: () => coin.destroy()
      })

      this.hud.update()
    })

    // Player interaction
    this.events.on('interact', () => {
      if (this.dialogueUI.isVisible()) return

      let interacted = false

      this.npcs.forEach(npc => {
        if (npc.canInteract(this.player)) {
          const dialogue = npc.interact()
          if (dialogue) {
            this.dialogueUI.show(dialogue, (nextId) => {
              if (nextId) {
                npc.setDialogueNode(nextId)
                const nextDialogue = npc.interact()
                if (nextDialogue) {
                  this.dialogueUI.show(nextDialogue, () => {})
                }
              }
            })
            interacted = true
          }
        }
      })
    })

    // Toggle inventory
    this.events.on('toggleInventory', () => {
      this.hud.toggleInventory()
    })

    // Player healed
    this.events.on('playerHealed', () => {
      this.hud.showNotification('Health Restored!', '#00ff00')
      this.hud.update()
      this.playSound('heal')
    })

    // Player died
    this.events.on('playerDied', () => {
      this.handlePlayerDeath()
    })
  }

  private initializeAudio() {
    // Create simple audio using Web Audio API
    try {
      // Background music loop
      this.musicLoop = new Howl({
        src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6f'],
        loop: true,
        volume: 0.3,
        html5: true
      })
      // Uncomment to play music: this.musicLoop.play()
    } catch (e) {
      console.log('Audio initialization skipped')
    }
  }

  private playSound(type: string) {
    // Sound effects would be played here
    // For now, we'll use visual feedback instead
  }

  private createAmbientEffects() {
    // Create floating particles
    const particles = this.add.particles(0, 0, 'coin', {
      speed: { min: 10, max: 30 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 3000,
      frequency: 500,
      emitting: true,
      follow: this.player,
      blendMode: 'ADD'
    })
    particles.setDepth(60)

    // Weather effects
    this.time.addEvent({
      delay: 30000,
      callback: () => {
        if (Math.random() > 0.5) {
          this.createRainEffect()
        }
      },
      loop: true
    })
  }

  private createRainEffect() {
    const rain = this.add.particles(0, 0, 'coin', {
      x: { min: 0, max: 3200 },
      y: -10,
      speedY: { min: 300, max: 500 },
      speedX: { min: -20, max: 20 },
      scale: { min: 0.05, max: 0.1 },
      alpha: 0.6,
      lifespan: 3000,
      tint: 0x4682b4,
      frequency: 10
    })

    this.time.delayedCall(10000, () => {
      rain.stop()
      this.time.delayedCall(3000, () => {
        rain.destroy()
      })
    })
  }

  private handlePlayerDeath() {
    this.hud.showNotification('You have died...', '#ff0000')

    this.time.delayedCall(2000, () => {
      // Respawn player
      this.player.x = 640
      this.player.y = 360
      this.gameState.playerHealth = this.gameState.playerMaxHealth
      this.player.clearTint()
      this.hud.update()
      this.hud.showNotification('Respawned at village', '#00ff00')
    })
  }

  update(time: number, delta: number) {
    this.player.update()

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(time)
    })

    // Update NPCs
    this.npcs.forEach(npc => {
      npc.update(this.player)
    })

    // Update parallax
    this.backgroundLayers.forEach((layer, index) => {
      layer.tilePositionX = this.cameras.main.scrollX * (0.1 + index * 0.2)
      layer.tilePositionY = this.cameras.main.scrollY * (0.1 + index * 0.2)
    })

    // Update lighting
    if (this.lightingLayer) {
      this.updateLighting()
    }

    // Update HUD
    this.hud.update()

    // Update minimap
    const entities = [
      ...this.enemies.map(e => ({ x: e.x, y: e.y, type: 'enemy' })),
      ...this.npcs.map(n => ({ x: n.x, y: n.y, type: 'npc' }))
    ]
    this.hud.updateMinimap(this.player.x, this.player.y, entities)
  }
}
