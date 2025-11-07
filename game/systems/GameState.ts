export interface Quest {
  id: string
  title: string
  description: string
  objectives: string[]
  completed: boolean
  active: boolean
  rewards: { gold?: number, item?: string }
}

export interface InventoryItem {
  id: string
  name: string
  type: 'weapon' | 'potion' | 'key' | 'misc'
  sprite: string
  quantity: number
  equipped?: boolean
}

export class GameState {
  private static instance: GameState

  public playerHealth: number = 100
  public playerMaxHealth: number = 100
  public playerGold: number = 0
  public playerLevel: number = 1
  public playerExp: number = 0
  public inventory: InventoryItem[] = []
  public quests: Quest[] = []
  public equippedWeapon: string = 'sword'
  public gameProgress: { [key: string]: boolean } = {}

  private constructor() {
    this.initializeGame()
  }

  static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState()
    }
    return GameState.instance
  }

  private initializeGame() {
    this.inventory = [
      { id: 'sword1', name: 'Iron Sword', type: 'weapon', sprite: 'sword', quantity: 1, equipped: true },
      { id: 'potion1', name: 'Health Potion', type: 'potion', sprite: 'potion', quantity: 3 }
    ]

    this.quests = [
      {
        id: 'main_quest_1',
        title: 'The Dark Forest',
        description: 'Investigate the strange creatures appearing in the forest',
        objectives: ['Defeat 5 slimes', 'Talk to the village elder'],
        completed: false,
        active: true,
        rewards: { gold: 50, item: 'key' }
      },
      {
        id: 'side_quest_1',
        title: 'Lost Merchant',
        description: 'Find the merchant\'s lost goods',
        objectives: ['Search the ruins', 'Return items to merchant'],
        completed: false,
        active: false,
        rewards: { gold: 30 }
      }
    ]
  }

  addItem(item: InventoryItem) {
    const existing = this.inventory.find(i => i.id === item.id)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      this.inventory.push(item)
    }
  }

  removeItem(itemId: string, quantity: number = 1) {
    const item = this.inventory.find(i => i.id === itemId)
    if (item) {
      item.quantity -= quantity
      if (item.quantity <= 0) {
        this.inventory = this.inventory.filter(i => i.id !== itemId)
      }
    }
  }

  equipWeapon(weapon: string) {
    this.inventory.forEach(item => {
      if (item.type === 'weapon') {
        item.equipped = item.id === weapon
      }
    })
    this.equippedWeapon = weapon
  }

  usePotion() {
    const potion = this.inventory.find(i => i.type === 'potion')
    if (potion && potion.quantity > 0) {
      this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 50)
      this.removeItem(potion.id, 1)
      return true
    }
    return false
  }

  takeDamage(amount: number) {
    this.playerHealth = Math.max(0, this.playerHealth - amount)
  }

  addGold(amount: number) {
    this.playerGold += amount
  }

  addExp(amount: number) {
    this.playerExp += amount
    while (this.playerExp >= this.getExpForNextLevel()) {
      this.playerExp -= this.getExpForNextLevel()
      this.levelUp()
    }
  }

  private getExpForNextLevel(): number {
    return this.playerLevel * 100
  }

  private levelUp() {
    this.playerLevel++
    this.playerMaxHealth += 10
    this.playerHealth = this.playerMaxHealth
  }

  completeQuestObjective(questId: string, objectiveIndex: number) {
    const quest = this.quests.find(q => q.id === questId)
    if (quest && quest.active) {
      // Mark as complete logic here
    }
  }

  activateQuest(questId: string) {
    const quest = this.quests.find(q => q.id === questId)
    if (quest) {
      quest.active = true
    }
  }

  completeQuest(questId: string) {
    const quest = this.quests.find(q => q.id === questId)
    if (quest) {
      quest.completed = true
      quest.active = false
      if (quest.rewards.gold) {
        this.addGold(quest.rewards.gold)
      }
      if (quest.rewards.item) {
        // Add reward item to inventory
      }
    }
  }

  setProgress(key: string, value: boolean) {
    this.gameProgress[key] = value
  }

  getProgress(key: string): boolean {
    return this.gameProgress[key] || false
  }
}
