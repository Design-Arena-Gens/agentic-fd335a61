import Phaser from 'phaser'
import { DialogueNode } from '../entities/NPC'

export class DialogueUI {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private background: Phaser.GameObjects.Graphics
  private nameText: Phaser.GameObjects.Text
  private dialogueText: Phaser.GameObjects.Text
  private choiceButtons: Phaser.GameObjects.Text[] = []
  private visible: boolean = false
  private currentNode: DialogueNode | null = null
  private onChoiceCallback: ((choice: string | null) => void) | null = null

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    this.container = scene.add.container(0, 0)
    this.container.setScrollFactor(0)
    this.container.setDepth(1000)

    // Background
    this.background = scene.add.graphics()
    this.background.fillStyle(0x000000, 0.85)
    this.background.fillRoundedRect(100, 450, 1080, 220, 10)
    this.background.lineStyle(3, 0xffffff, 1)
    this.background.strokeRoundedRect(100, 450, 1080, 220, 10)
    this.container.add(this.background)

    // Name text
    this.nameText = scene.add.text(120, 460, '', {
      fontSize: '20px',
      color: '#ffeb3b',
      fontStyle: 'bold'
    })
    this.container.add(this.nameText)

    // Dialogue text
    this.dialogueText = scene.add.text(120, 495, '', {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 1040 }
    })
    this.container.add(this.dialogueText)

    this.container.setVisible(false)
  }

  show(node: DialogueNode, onChoice: (choice: string | null) => void) {
    this.currentNode = node
    this.onChoiceCallback = onChoice
    this.visible = true

    this.nameText.setText(node.speaker)
    this.dialogueText.setText('')

    // Type out text
    this.typeText(node.text, 0)

    // Clear old choice buttons
    this.choiceButtons.forEach(btn => btn.destroy())
    this.choiceButtons = []

    // Add choice buttons if available
    if (node.choices && node.choices.length > 0) {
      node.choices.forEach((choice, index) => {
        const btn = this.scene.add.text(
          140,
          580 + (index * 30),
          `> ${choice.text}`,
          {
            fontSize: '14px',
            color: '#4ecdc4'
          }
        )
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerover', () => {
          btn.setColor('#ffeb3b')
        })
        btn.on('pointerout', () => {
          btn.setColor('#4ecdc4')
        })
        btn.on('pointerdown', () => {
          if (choice.action) {
            choice.action()
          }
          this.onChoiceCallback?.(choice.next)
          if (!choice.next) {
            this.hide()
          }
        })

        this.container.add(btn)
        this.choiceButtons.push(btn)
      })
    } else {
      // Add continue prompt
      const continueText = this.scene.add.text(
        1100,
        640,
        '[Press E to continue]',
        {
          fontSize: '12px',
          color: '#888888'
        }
      )
      continueText.setOrigin(1, 0)
      this.container.add(continueText)
      this.choiceButtons.push(continueText)

      // Add keyboard listener
      const escKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E)
      escKey.once('down', () => {
        this.hide()
        this.onChoiceCallback?.(null)
      })
    }

    this.container.setVisible(true)
  }

  private typeText(text: string, index: number) {
    if (index < text.length) {
      this.dialogueText.setText(this.dialogueText.text + text[index])
      this.scene.time.delayedCall(30, () => {
        this.typeText(text, index + 1)
      })
    }
  }

  hide() {
    this.visible = false
    this.container.setVisible(false)
    this.choiceButtons.forEach(btn => btn.destroy())
    this.choiceButtons = []
  }

  isVisible(): boolean {
    return this.visible
  }
}
