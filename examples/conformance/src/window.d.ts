import type { BindingReport } from '@swipeline/binding-testkit'

declare global {
  interface Window {
    /** Set by each fixture page; Playwright calls it to run the shared suite. */
    __swipelineConformance?: () => Promise<BindingReport>
  }
}
