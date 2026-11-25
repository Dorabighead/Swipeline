import { describe, expect, it } from 'vitest'
import { SwipeDeckElement } from '../src/index.js'

describe('swipe-deck without a DOM', () => {
  // The module must be importable in Node: registration is guarded, so an SSR
  // build can load the binding without touching `customElements`.
  it('imports without registering a custom element', () => {
    expect(typeof SwipeDeckElement).toBe('function')
    expect(typeof customElements).toBe('undefined')
  })
})
