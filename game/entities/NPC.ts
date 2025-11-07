import Phaser from 'phaser'

export interface DialogueChoice {
  text: string
  next: string | null
  action?: () => void
}

export interface DialogueNode {
  id: string
  text: string
  speaker: string
  choices?: DialogueChoice[]
}

export class NPC extends Phaser.Physics.Arcade.Sprite {
  private npcType: string
  private npcName: string
  private dialogue: DialogueNode[]
  private currentDialogueId: string
  private interactionRadius: number = 60
  private indicator: Phaser.GameObjects.Graphics

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: string,
    name: string,
    dialogue: DialogueNode[]
  ) {
    super(scene, x, y, type)

    this.npcType = type
    this.npcName = name
    this.dialogue = dialogue
    this.currentDialogueId = dialogue[0]?.id || ''

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setScale(1.5)
    this.setImmovable(true)

    // Create interaction indicator
    this.indicator = scene.add.graphics()
    this.indicator.setVisible(false)
    this.updateIndicator()
  }

  update(player: Phaser.Physics.Arcade.Sprite) {
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      player.x, player.y
    )

    if (distance < this.interactionRadius) {
      this.indicator.setVisible(true)
      this.updateIndicator()
    } else {
      this.indicator.setVisible(false)
    }
  }

  private updateIndicator() {
    this.indicator.clear()
    this.indicator.fillStyle(0xffff00)
    this.indicator.fillCircle(this.x, this.y - 35, 3)

    // Draw "E" key hint
    this.indicator.fillStyle(0x000000, 0.7)
    this.indicator.fillRect(this.x - 10, this.y - 50, 20, 15)

    // This would be text in a real implementation
    const text = this.scene.add.text(this.x, this.y - 47, 'E', {
      fontSize: '10px',
      color: '#ffffff'
    })
    text.setOrigin(0.5, 0)

    this.scene.time.delayedCall(100, () => {
      text.destroy()
    })
  }

  interact(): DialogueNode | null {
    const node = this.dialogue.find(d => d.id === this.currentDialogueId)
    return node || null
  }

  setDialogueNode(nodeId: string) {
    this.currentDialogueId = nodeId
  }

  getName(): string {
    return this.npcName
  }

  getType(): string {
    return this.npcType
  }

  canInteract(player: Phaser.Physics.Arcade.Sprite): boolean {
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      player.x, player.y
    )
    return distance < this.interactionRadius
  }
}
