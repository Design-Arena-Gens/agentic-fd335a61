import Phaser from 'phaser'

export interface BiomeConfig {
  name: string
  tileKey: string
  enemyTypes: string[]
  enemyDensity: number
}

export class WorldGenerator {
  static generateWorld(scene: Phaser.Scene, width: number, height: number, biome: BiomeConfig): Phaser.Tilemaps.Tilemap {
    const tileSize = 32
    const mapWidth = Math.floor(width / tileSize)
    const mapHeight = Math.floor(height / tileSize)

    // Create blank tilemap
    const map = scene.make.tilemap({
      tileWidth: tileSize,
      tileHeight: tileSize,
      width: mapWidth,
      height: mapHeight
    })

    const tileset = map.addTilesetImage(biome.tileKey, biome.tileKey, tileSize, tileSize, 0, 0)

    if (!tileset) {
      throw new Error('Failed to create tileset')
    }

    // Create layers
    const groundLayer = map.createBlankLayer('ground', tileset, 0, 0)
    const objectLayer = map.createBlankLayer('objects', tileset, 0, 0)
    const collisionLayer = map.createBlankLayer('collision', tileset, 0, 0)

    if (!groundLayer || !objectLayer || !collisionLayer) {
      throw new Error('Failed to create layers')
    }

    // Generate terrain using Perlin-like noise
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const noise = this.noise(x * 0.1, y * 0.1)

        // Ground tiles
        if (noise < 0.3) {
          groundLayer.putTileAt(0, x, y) // Grass
        } else if (noise < 0.5) {
          groundLayer.putTileAt(1, x, y) // Dirt
        } else if (noise < 0.7) {
          groundLayer.putTileAt(2, x, y) // Stone
        } else {
          groundLayer.putTileAt(3, x, y) // Water
        }

        // Place objects
        if (noise > 0.8 && Math.random() > 0.7) {
          objectLayer.putTileAt(4, x, y) // Tree
          collisionLayer.putTileAt(2, x, y)
        }
      }
    }

    // Set collision
    collisionLayer.setCollisionByExclusion([-1])

    // Add paths
    this.generatePaths(groundLayer, mapWidth, mapHeight)

    // Add special locations
    this.generateVillage(groundLayer, objectLayer, collisionLayer, Math.floor(mapWidth / 4), Math.floor(mapHeight / 4))
    this.generateRuins(groundLayer, objectLayer, collisionLayer, Math.floor(mapWidth * 3 / 4), Math.floor(mapHeight * 3 / 4))

    return map
  }

  private static noise(x: number, y: number): number {
    // Simple pseudo-random noise function
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123
    return n - Math.floor(n)
  }

  private static generatePaths(layer: Phaser.Tilemaps.TilemapLayer, width: number, height: number) {
    // Horizontal path
    const pathY = Math.floor(height / 2)
    for (let x = 0; x < width; x++) {
      layer.putTileAt(1, x, pathY) // Dirt path
      if (Math.random() > 0.5) {
        layer.putTileAt(1, x, pathY + 1)
      }
    }

    // Vertical path
    const pathX = Math.floor(width / 2)
    for (let y = 0; y < height; y++) {
      layer.putTileAt(1, pathX, y)
      if (Math.random() > 0.5) {
        layer.putTileAt(1, pathX + 1, y)
      }
    }
  }

  private static generateVillage(
    groundLayer: Phaser.Tilemaps.TilemapLayer,
    objectLayer: Phaser.Tilemaps.TilemapLayer,
    collisionLayer: Phaser.Tilemaps.TilemapLayer,
    centerX: number,
    centerY: number
  ) {
    // Clear area for village
    for (let y = centerY - 5; y < centerY + 5; y++) {
      for (let x = centerX - 5; x < centerX + 5; x++) {
        groundLayer.putTileAt(0, x, y)
        objectLayer.removeTileAt(x, y)
        collisionLayer.removeTileAt(x, y)
      }
    }

    // Add buildings (using stone tiles as walls)
    const buildings = [
      { x: centerX - 3, y: centerY - 3, w: 4, h: 4 },
      { x: centerX + 1, y: centerY - 3, w: 4, h: 4 },
      { x: centerX - 3, y: centerY + 1, w: 4, h: 3 }
    ]

    buildings.forEach(building => {
      for (let y = building.y; y < building.y + building.h; y++) {
        for (let x = building.x; x < building.x + building.w; x++) {
          if (x === building.x || x === building.x + building.w - 1 ||
              y === building.y || y === building.y + building.h - 1) {
            objectLayer.putTileAt(2, x, y) // Stone walls
            collisionLayer.putTileAt(2, x, y)
          }
        }
      }
    })
  }

  private static generateRuins(
    groundLayer: Phaser.Tilemaps.TilemapLayer,
    objectLayer: Phaser.Tilemaps.TilemapLayer,
    collisionLayer: Phaser.Tilemaps.TilemapLayer,
    centerX: number,
    centerY: number
  ) {
    // Clear area for ruins
    for (let y = centerY - 4; y < centerY + 4; y++) {
      for (let x = centerX - 4; x < centerX + 4; x++) {
        groundLayer.putTileAt(2, x, y) // Stone ground
      }
    }

    // Add broken walls
    for (let i = 0; i < 10; i++) {
      const x = centerX + Phaser.Math.Between(-4, 4)
      const y = centerY + Phaser.Math.Between(-4, 4)
      if (Math.random() > 0.5) {
        objectLayer.putTileAt(2, x, y)
        collisionLayer.putTileAt(2, x, y)
      }
    }
  }

  static generateCave(scene: Phaser.Scene, width: number, height: number): Phaser.Tilemaps.Tilemap {
    const tileSize = 32
    const mapWidth = Math.floor(width / tileSize)
    const mapHeight = Math.floor(height / tileSize)

    const map = scene.make.tilemap({
      tileWidth: tileSize,
      tileHeight: tileSize,
      width: mapWidth,
      height: mapHeight
    })

    const tileset = map.addTilesetImage('ruins_tiles', 'ruins_tiles', tileSize, tileSize, 0, 0)

    if (!tileset) {
      throw new Error('Failed to create tileset')
    }

    const groundLayer = map.createBlankLayer('ground', tileset, 0, 0)
    const wallLayer = map.createBlankLayer('walls', tileset, 0, 0)

    if (!groundLayer || !wallLayer) {
      throw new Error('Failed to create layers')
    }

    // Fill with walls
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        wallLayer.putTileAt(2, x, y)
      }
    }

    // Carve out cave using cellular automata
    const caves = this.generateCellularAutomata(mapWidth, mapHeight, 0.45, 4)

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if (caves[y][x] === 0) {
          wallLayer.removeTileAt(x, y)
          groundLayer.putTileAt(1, x, y)
        }
      }
    }

    wallLayer.setCollisionByExclusion([-1])

    return map
  }

  private static generateCellularAutomata(
    width: number,
    height: number,
    fillProbability: number,
    iterations: number
  ): number[][] {
    let grid: number[][] = []

    // Initialize with random values
    for (let y = 0; y < height; y++) {
      grid[y] = []
      for (let x = 0; x < width; x++) {
        grid[y][x] = Math.random() < fillProbability ? 1 : 0
      }
    }

    // Run cellular automata
    for (let i = 0; i < iterations; i++) {
      const newGrid: number[][] = []
      for (let y = 0; y < height; y++) {
        newGrid[y] = []
        for (let x = 0; x < width; x++) {
          const neighbors = this.countNeighbors(grid, x, y, width, height)
          newGrid[y][x] = neighbors > 4 ? 1 : 0
        }
      }
      grid = newGrid
    }

    return grid
  }

  private static countNeighbors(
    grid: number[][],
    x: number,
    y: number,
    width: number,
    height: number
  ): number {
    let count = 0
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          if (dx !== 0 || dy !== 0) {
            count += grid[ny][nx]
          }
        } else {
          count++ // Treat edges as walls
        }
      }
    }
    return count
  }
}
