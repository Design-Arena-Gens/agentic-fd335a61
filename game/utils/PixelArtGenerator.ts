export class PixelArtGenerator {
  static generateCharacterSprite(scene: Phaser.Scene, key: string, width: number, height: number, colors: number[]): void {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    const pattern = [
      [0,0,1,1,1,1,0,0],
      [0,1,1,2,2,1,1,0],
      [0,1,2,2,2,2,1,0],
      [0,1,1,2,2,1,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,3,3,3,3,0,0],
      [0,3,3,3,3,3,3,0],
      [0,3,0,0,0,0,3,0],
      [0,3,0,0,0,0,3,0],
      [0,0,3,0,0,3,0,0],
      [0,0,3,0,0,3,0,0],
      [0,3,3,0,0,3,3,0]
    ]

    const pixelWidth = Math.floor(width / 8)
    const pixelHeight = Math.floor(height / 12)

    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        const colorIndex = pattern[y][x]
        if (colorIndex > 0) {
          ctx.fillStyle = this.numToHex(colors[colorIndex - 1])
          ctx.fillRect(x * pixelWidth, y * pixelHeight, pixelWidth, pixelHeight)
        }
      }
    }

    scene.textures.addCanvas(key, canvas)
  }

  static generateEnemySprite(scene: Phaser.Scene, key: string, width: number, height: number, type: string): void {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    const patterns: { [key: string]: number[][] } = {
      slime: [
        [0,0,1,1,1,1,0,0],
        [0,1,2,2,2,2,1,0],
        [1,2,3,2,2,3,2,1],
        [1,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,1],
        [0,1,2,2,2,2,1,0],
        [0,0,1,1,1,1,0,0]
      ],
      skeleton: [
        [0,0,1,1,1,1,0,0],
        [0,1,2,3,3,2,1,0],
        [0,1,2,2,2,2,1,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [0,1,0,1,1,0,1,0],
        [0,1,0,1,1,0,1,0],
        [1,1,0,0,0,0,1,1]
      ],
      goblin: [
        [0,0,1,1,1,1,0,0],
        [0,1,2,1,1,2,1,0],
        [0,1,1,1,1,1,1,0],
        [0,0,3,3,3,3,0,0],
        [0,3,3,3,3,3,3,0],
        [0,3,0,3,3,0,3,0],
        [0,3,0,0,0,0,3,0],
        [3,3,0,0,0,0,3,3]
      ]
    }

    const pattern = patterns[type] || patterns.slime
    const colors = type === 'slime' ? [0x00ff00, 0x88ff88, 0x004400] :
                   type === 'skeleton' ? [0xdddddd, 0xffffff, 0x000000] :
                   [0x228b22, 0xff0000, 0x8b4513]

    const pixelWidth = Math.floor(width / 8)
    const pixelHeight = Math.floor(height / pattern.length)

    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        const colorIndex = pattern[y][x]
        if (colorIndex > 0) {
          ctx.fillStyle = this.numToHex(colors[colorIndex - 1])
          ctx.fillRect(x * pixelWidth, y * pixelHeight, pixelWidth, pixelHeight)
        }
      }
    }

    scene.textures.addCanvas(key, canvas)
  }

  static generateNPCSprite(scene: Phaser.Scene, key: string, width: number, height: number, npcType: string): void {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    const colors = npcType === 'merchant' ? [0x8b4513, 0xffeb3b, 0xffc107] :
                   npcType === 'guard' ? [0x757575, 0xff0000, 0xffd700] :
                   [0x2196f3, 0xffe0bd, 0x795548]

    const pattern = [
      [0,0,1,1,1,1,0,0],
      [0,1,2,2,2,2,1,0],
      [0,1,2,2,2,2,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,3,3,3,3,0,0],
      [0,3,3,3,3,3,3,0],
      [0,3,0,0,0,0,3,0],
      [0,3,0,0,0,0,3,0],
      [0,0,3,0,0,3,0,0],
      [0,0,3,0,0,3,0,0],
      [0,3,3,0,0,3,3,0]
    ]

    const pixelWidth = Math.floor(width / 8)
    const pixelHeight = Math.floor(height / pattern.length)

    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        const colorIndex = pattern[y][x]
        if (colorIndex > 0) {
          ctx.fillStyle = this.numToHex(colors[colorIndex - 1])
          ctx.fillRect(x * pixelWidth, y * pixelHeight, pixelWidth, pixelHeight)
        }
      }
    }

    scene.textures.addCanvas(key, canvas)
  }

  static generateTileset(scene: Phaser.Scene, key: string, tileSize: number, biome: string): void {
    const canvas = document.createElement('canvas')
    const tilesPerRow = 8
    canvas.width = tileSize * tilesPerRow
    canvas.height = tileSize * tilesPerRow
    const ctx = canvas.getContext('2d')!

    const biomeColors: { [key: string]: { grass: number, dirt: number, stone: number, water: number, tree: number, flower: number } } = {
      forest: { grass: 0x228b22, dirt: 0x8b4513, stone: 0x696969, water: 0x1e90ff, tree: 0x006400, flower: 0xff69b4 },
      desert: { grass: 0xf4a460, dirt: 0xdaa520, stone: 0xd2691e, water: 0x4682b4, tree: 0x8b4513, flower: 0xffa500 },
      snow: { grass: 0xf0f8ff, dirt: 0xdcdcdc, stone: 0x778899, water: 0x4682b4, tree: 0x2f4f4f, flower: 0xe6e6fa },
      ruins: { grass: 0x556b2f, dirt: 0x696969, stone: 0x2f4f4f, water: 0x191970, tree: 0x3c3c3c, flower: 0x8b008b }
    }

    const colors = biomeColors[biome] || biomeColors.forest

    const tiles = [
      { color: colors.grass, pattern: 'solid' },
      { color: colors.dirt, pattern: 'solid' },
      { color: colors.stone, pattern: 'brick' },
      { color: colors.water, pattern: 'wave' },
      { color: colors.tree, pattern: 'tree' },
      { color: colors.flower, pattern: 'flower' }
    ]

    let tileIndex = 0
    for (let ty = 0; ty < tilesPerRow && tileIndex < tiles.length; ty++) {
      for (let tx = 0; tx < tilesPerRow && tileIndex < tiles.length; tx++) {
        const tile = tiles[tileIndex]
        const x = tx * tileSize
        const y = ty * tileSize

        if (tile.pattern === 'solid') {
          ctx.fillStyle = this.numToHex(tile.color)
          ctx.fillRect(x, y, tileSize, tileSize)
        } else if (tile.pattern === 'brick') {
          ctx.fillStyle = this.numToHex(tile.color)
          ctx.fillRect(x, y, tileSize, tileSize)
          ctx.strokeStyle = this.numToHex(this.darken(tile.color, 0.3))
          ctx.lineWidth = 1
          for (let i = 0; i < tileSize; i += 4) {
            ctx.strokeRect(x + i, y + i, 4, 4)
          }
        } else if (tile.pattern === 'wave') {
          ctx.fillStyle = this.numToHex(tile.color)
          ctx.fillRect(x, y, tileSize, tileSize)
          ctx.fillStyle = this.numToHex(this.lighten(tile.color, 0.2))
          for (let i = 0; i < tileSize; i += 4) {
            ctx.fillRect(x + i, y + i, 2, 2)
          }
        } else if (tile.pattern === 'tree') {
          ctx.fillStyle = this.numToHex(0x8b4513)
          ctx.fillRect(x + tileSize/2 - 2, y + tileSize/2, 4, tileSize/2)
          ctx.fillStyle = this.numToHex(tile.color)
          ctx.beginPath()
          ctx.arc(x + tileSize/2, y + tileSize/2, tileSize/3, 0, Math.PI * 2)
          ctx.fill()
        } else if (tile.pattern === 'flower') {
          ctx.fillStyle = this.numToHex(0x228b22)
          ctx.fillRect(x, y, tileSize, tileSize)
          ctx.fillStyle = this.numToHex(tile.color)
          ctx.fillRect(x + tileSize/2 - 2, y + tileSize/2 - 2, 4, 4)
        }

        tileIndex++
      }
    }

    scene.textures.addCanvas(key, canvas)
  }

  static generateWeaponSprite(scene: Phaser.Scene, key: string, weaponType: string): void {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')!

    if (weaponType === 'sword') {
      ctx.fillStyle = '#c0c0c0'
      ctx.fillRect(14, 4, 4, 24)
      ctx.fillStyle = '#ffd700'
      ctx.fillRect(12, 24, 8, 4)
      ctx.fillStyle = '#8b4513'
      ctx.fillRect(14, 28, 4, 4)
    } else if (weaponType === 'axe') {
      ctx.fillStyle = '#8b4513'
      ctx.fillRect(14, 12, 4, 20)
      ctx.fillStyle = '#696969'
      ctx.fillRect(10, 8, 12, 8)
    } else if (weaponType === 'bow') {
      ctx.strokeStyle = '#8b4513'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(16, 16, 10, -Math.PI/2, Math.PI/2)
      ctx.stroke()
      ctx.strokeStyle = '#fff'
      ctx.beginPath()
      ctx.moveTo(16 - 10, 6)
      ctx.lineTo(16 - 10, 26)
      ctx.stroke()
    }

    scene.textures.addCanvas(key, canvas)
  }

  static generateItemSprite(scene: Phaser.Scene, key: string, itemType: string): void {
    const canvas = document.createElement('canvas')
    canvas.width = 24
    canvas.height = 24
    const ctx = canvas.getContext('2d')!

    if (itemType === 'potion') {
      ctx.fillStyle = '#8b0000'
      ctx.fillRect(8, 6, 8, 12)
      ctx.fillStyle = '#ff0000'
      ctx.fillRect(9, 7, 6, 10)
      ctx.fillStyle = '#696969'
      ctx.fillRect(10, 4, 4, 3)
    } else if (itemType === 'coin') {
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.arc(12, 12, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffed4e'
      ctx.beginPath()
      ctx.arc(12, 12, 4, 0, Math.PI * 2)
      ctx.fill()
    } else if (itemType === 'key') {
      ctx.fillStyle = '#ffd700'
      ctx.fillRect(8, 10, 8, 3)
      ctx.beginPath()
      ctx.arc(8, 11.5, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillRect(15, 8, 2, 2)
      ctx.fillRect(15, 12, 2, 2)
    }

    scene.textures.addCanvas(key, canvas)
  }

  private static numToHex(num: number): string {
    return '#' + num.toString(16).padStart(6, '0')
  }

  private static darken(color: number, amount: number): number {
    const r = Math.floor(((color >> 16) & 0xff) * (1 - amount))
    const g = Math.floor(((color >> 8) & 0xff) * (1 - amount))
    const b = Math.floor((color & 0xff) * (1 - amount))
    return (r << 16) | (g << 8) | b
  }

  private static lighten(color: number, amount: number): number {
    const r = Math.min(255, Math.floor(((color >> 16) & 0xff) * (1 + amount)))
    const g = Math.min(255, Math.floor(((color >> 8) & 0xff) * (1 + amount)))
    const b = Math.min(255, Math.floor((color & 0xff) * (1 + amount)))
    return (r << 16) | (g << 8) | b
  }
}
