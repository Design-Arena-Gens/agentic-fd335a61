import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const GameComponent = dynamic(() => import('../game/GameComponent'), {
  ssr: false
})

export default function Home() {
  return (
    <div id="game-container">
      <GameComponent />
    </div>
  )
}
