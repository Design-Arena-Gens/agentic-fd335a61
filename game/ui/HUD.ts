import Phaser from 'phaser'
import { GameState } from '../systems/GameState'
import gsap from 'gsap'

export class HUD {
  private scene: Phaser.Scene
  private gameState: GameState
  private container: Phaser.GameObjects.Container
  private healthBar: Phaser.GameObjects.Graphics
  private healthText: Phaser.GameObjects.Text
  private goldText: Phaser.GameObjects.Text
  private levelText: Phaser.GameObjects.Text
  private expBar: Phaser.GameObjects.Graphics
  private questPanel: Phaser.GameObjects.Container
  private inventoryPanel: Phaser.GameObjects.Container
  private inventoryVisible: boolean = false
  private minimap: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.gameState = GameState.getInstance()

    this.container = scene.add.container(0, 0)
    this.container.setScrollFactor(0)
    this.container.setDepth(100)

    this.createHealthBar()
    this.createStatsDisplay()
    this.createQuestPanel()
    this.createInventoryPanel()
    this.createMinimap()

    this.update()
  }

  private createHealthBar() {
    this.healthBar = this.scene.add.graphics()
    this.container.add(this.healthBar)

    this.healthText = this.scene.add.text(20, 20, '', {
      fontSize: '14px',
      color: '#ffffff'
    })
    this.container.add(this.healthText)
  }

  private createStatsDisplay() {
    this.goldText = this.scene.add.text(20, 80, '', {
      fontSize: '14px',
      color: '#ffd700'
    })
    this.container.add(this.goldText)

    this.levelText = this.scene.add.text(20, 100, '', {
      fontSize: '14px',
      color: '#4ecdc4'
    })
    this.container.add(this.levelText)

    this.expBar = this.scene.add.graphics()
    this.container.add(this.expBar)
  }

  private createQuestPanel() {
    this.questPanel = this.scene.add.container(1050, 20)
    this.questPanel.setScrollFactor(0)

    const bg = this.scene.add.graphics()
    bg.fillStyle(0x000000, 0.7)
    bg.fillRoundedRect(0, 0, 210, 150, 5)
    this.questPanel.add(bg)

    const title = this.scene.add.text(10, 10, 'Active Quests', {
      fontSize: '14px',
      color: '#ffeb3b',
      fontStyle: 'bold'
    })
    this.questPanel.add(title)

    this.container.add(this.questPanel)
  }

  private createInventoryPanel() {
    this.inventoryPanel = this.scene.add.container(400, 200)
    this.inventoryPanel.setScrollFactor(0)
    this.inventoryPanel.setVisible(false)

    const bg = this.scene.add.graphics()
    bg.fillStyle(0x000000, 0.9)
    bg.fillRoundedRect(0, 0, 480, 320, 10)
    bg.lineStyle(3, 0xffffff, 1)
    bg.strokeRoundedRect(0, 0, 480, 320, 10)
    this.inventoryPanel.add(bg)

    const title = this.scene.add.text(240, 20, 'Inventory', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5, 0)
    this.inventoryPanel.add(title)

    this.container.add(this.inventoryPanel)
  }

  private createMinimap() {
    this.minimap = this.scene.add.graphics()
    this.minimap.setScrollFactor(0)
    this.minimap.fillStyle(0x000000, 0.5)
    this.minimap.fillRect(1080, 20, 180, 180)
    this.minimap.lineStyle(2, 0xffffff, 1)
    this.minimap.strokeRect(1080, 20, 180, 180)
    this.container.add(this.minimap)
  }

  update() {
    this.updateHealthBar()
    this.updateStats()
    this.updateQuestPanel()
  }

  private updateHealthBar() {
    this.healthBar.clear()

    const barWidth = 200
    const barHeight = 20

    // Background
    this.healthBar.fillStyle(0x000000, 0.7)
    this.healthBar.fillRect(20, 40, barWidth, barHeight)

    // Health
    const healthPercent = this.gameState.playerHealth / this.gameState.playerMaxHealth
    const healthWidth = barWidth * healthPercent

    const color = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffaa00 : 0xff0000
    this.healthBar.fillStyle(color)
    this.healthBar.fillRect(20, 40, healthWidth, barHeight)

    // Border
    this.healthBar.lineStyle(2, 0xffffff, 1)
    this.healthBar.strokeRect(20, 40, barWidth, barHeight)

    this.healthText.setText(`HP: ${Math.floor(this.gameState.playerHealth)}/${this.gameState.playerMaxHealth}`)
  }

  private updateStats() {
    this.goldText.setText(`Gold: ${this.gameState.playerGold}`)
    this.levelText.setText(`Level: ${this.gameState.playerLevel}`)

    // Experience bar
    this.expBar.clear()
    const expPercent = this.gameState.playerExp / (this.gameState.playerLevel * 100)
    const expWidth = 200 * expPercent

    this.expBar.fillStyle(0x4ecdc4)
    this.expBar.fillRect(20, 120, expWidth, 10)
    this.expBar.lineStyle(1, 0xffffff, 1)
    this.expBar.strokeRect(20, 120, 200, 10)
  }

  private updateQuestPanel() {
    // Clear old quest text
    this.questPanel.list.slice(2).forEach(obj => obj.destroy())

    const activeQuests = this.gameState.quests.filter(q => q.active)

    activeQuests.forEach((quest, index) => {
      const questText = this.scene.add.text(10, 35 + (index * 35), quest.title, {
        fontSize: '12px',
        color: '#ffffff',
        wordWrap: { width: 190 }
      })
      this.questPanel.add(questText)

      const progressText = this.scene.add.text(10, 50 + (index * 35), quest.objectives[0], {
        fontSize: '10px',
        color: '#aaaaaa',
        wordWrap: { width: 190 }
      })
      this.questPanel.add(progressText)
    })
  }

  toggleInventory() {
    this.inventoryVisible = !this.inventoryVisible

    if (this.inventoryVisible) {
      this.showInventory()
    } else {
      this.hideInventory()
    }
  }

  private showInventory() {
    // Clear old items
    this.inventoryPanel.list.slice(2).forEach(obj => obj.destroy())

    const items = this.gameState.inventory

    items.forEach((item, index) => {
      const row = Math.floor(index / 6)
      const col = index % 6

      const x = 30 + (col * 70)
      const y = 60 + (row * 70)

      // Item slot
      const slot = this.scene.add.graphics()
      slot.lineStyle(2, 0x666666, 1)
      slot.strokeRect(x, y, 60, 60)
      this.inventoryPanel.add(slot)

      // Item sprite
      const sprite = this.scene.add.sprite(x + 30, y + 30, item.sprite)
      sprite.setScale(2)
      this.inventoryPanel.add(sprite)

      // Quantity
      if (item.quantity > 1) {
        const qtyText = this.scene.add.text(x + 45, y + 45, `x${item.quantity}`, {
          fontSize: '10px',
          color: '#ffffff'
        })
        this.inventoryPanel.add(qtyText)
      }

      // Item name on hover
      sprite.setInteractive()
      sprite.on('pointerover', () => {
        const tooltip = this.scene.add.text(x + 30, y - 10, item.name, {
          fontSize: '11px',
          color: '#ffeb3b',
          backgroundColor: '#000000'
        })
        tooltip.setOrigin(0.5, 1)
        this.inventoryPanel.add(tooltip)
      })
    })

    gsap.to(this.inventoryPanel, { alpha: 1, duration: 0.2 })
    this.inventoryPanel.setVisible(true)
  }

  private hideInventory() {
    gsap.to(this.inventoryPanel, {
      alpha: 0,
      duration: 0.2,
      onComplete: () => {
        this.inventoryPanel.setVisible(false)
      }
    })
  }

  showNotification(text: string, color: string = '#ffffff') {
    const notification = this.scene.add.text(640, 150, text, {
      fontSize: '18px',
      color: color,
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    })
    notification.setOrigin(0.5, 0)
    notification.setScrollFactor(0)
    notification.setDepth(1001)

    gsap.from(notification, {
      alpha: 0,
      y: 120,
      duration: 0.3
    })

    gsap.to(notification, {
      alpha: 0,
      delay: 2,
      duration: 0.5,
      onComplete: () => {
        notification.destroy()
      }
    })
  }

  updateMinimap(playerX: number, playerY: number, entities: any[]) {
    this.minimap.clear()
    this.minimap.fillStyle(0x1a1a2e, 0.8)
    this.minimap.fillRect(1080, 20, 180, 180)

    // Draw player
    this.minimap.fillStyle(0x00ff00)
    this.minimap.fillCircle(1170, 110, 3)

    // Draw entities near player
    entities.forEach(entity => {
      const relX = (entity.x - playerX) / 10
      const relY = (entity.y - playerY) / 10

      if (Math.abs(relX) < 90 && Math.abs(relY) < 90) {
        if (entity.type === 'enemy') {
          this.minimap.fillStyle(0xff0000)
          this.minimap.fillCircle(1170 + relX, 110 + relY, 2)
        } else if (entity.type === 'npc') {
          this.minimap.fillStyle(0x00ffff)
          this.minimap.fillCircle(1170 + relX, 110 + relY, 2)
        }
      }
    })

    this.minimap.lineStyle(2, 0xffffff, 1)
    this.minimap.strokeRect(1080, 20, 180, 180)
  }
}
