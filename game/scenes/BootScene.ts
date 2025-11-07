import Phaser from 'phaser'
import { PixelArtGenerator } from '../utils/PixelArtGenerator'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50)

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff'
    })
    loadingText.setOrigin(0.5, 0.5)

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff'
    })
    percentText.setOrigin(0.5, 0.5)

    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(0xffffff, 1)
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30)
      percentText.setText(Math.floor(value * 100) + '%')
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
      percentText.destroy()
    })
  }

  create() {
    // Generate all pixel art assets
    PixelArtGenerator.generateCharacterSprite(this, 'player', 32, 48, [0xff6b6b, 0xffe66d, 0x4ecdc4])

    // Generate enemies
    PixelArtGenerator.generateEnemySprite(this, 'slime', 32, 28, 'slime')
    PixelArtGenerator.generateEnemySprite(this, 'skeleton', 32, 32, 'skeleton')
    PixelArtGenerator.generateEnemySprite(this, 'goblin', 32, 32, 'goblin')

    // Generate NPCs
    PixelArtGenerator.generateNPCSprite(this, 'merchant', 32, 44, 'merchant')
    PixelArtGenerator.generateNPCSprite(this, 'guard', 32, 44, 'guard')
    PixelArtGenerator.generateNPCSprite(this, 'villager', 32, 44, 'villager')

    // Generate tilesets for different biomes
    PixelArtGenerator.generateTileset(this, 'forest_tiles', 32, 'forest')
    PixelArtGenerator.generateTileset(this, 'desert_tiles', 32, 'desert')
    PixelArtGenerator.generateTileset(this, 'snow_tiles', 32, 'snow')
    PixelArtGenerator.generateTileset(this, 'ruins_tiles', 32, 'ruins')

    // Generate weapons
    PixelArtGenerator.generateWeaponSprite(this, 'sword', 'sword')
    PixelArtGenerator.generateWeaponSprite(this, 'axe', 'axe')
    PixelArtGenerator.generateWeaponSprite(this, 'bow', 'bow')

    // Generate items
    PixelArtGenerator.generateItemSprite(this, 'potion', 'potion')
    PixelArtGenerator.generateItemSprite(this, 'coin', 'coin')
    PixelArtGenerator.generateItemSprite(this, 'key', 'key')

    // Start the main game scene
    this.scene.start('WorldScene')
  }
}
