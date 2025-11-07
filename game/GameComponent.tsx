import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import BootScene from './scenes/BootScene'
import WorldScene from './scenes/WorldScene'

export default function GameComponent() {
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 1280,
        height: 720,
        parent: 'game-container',
        backgroundColor: '#1a1a2e',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        render: {
          pixelArt: true,
          antialias: false
        },
        scene: [BootScene, WorldScene]
      }

      gameRef.current = new Phaser.Game(config)
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return null
}
