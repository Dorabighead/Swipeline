import { assertBindingConformance } from '@swipeline/binding-testkit'
import { createEngine } from '@swipeline/core'
import { SwipeDeckElement } from '@swipeline/element'
import { createFixtureSource } from './fixture-source'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('The fixture markup is missing #root')

window.__swipelineConformance = async () =>
  assertBindingConformance(
    {
      name: 'element',
      async mount() {
        const element = new SwipeDeckElement()
        const store = createEngine({
          deckId: 'conformance',
          actor: 'reader',
          source: createFixtureSource(),
        })
        element.store = store
        rootElement.append(element)
        store.dispatch({ type: 'refill' })
        return {
          root: element,
          settle: async () => {
            await store.whenSettled()
            await new Promise((resolve) => setTimeout(resolve, 0))
          },
          destroy: () => {
            element.remove()
            store.close()
          },
        }
      },
    },
    { firstTitle: 'First card', secondTitle: 'Second card' },
  )
