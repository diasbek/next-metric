# Animation data attributes (Metric public site)

Active suite is wired from `initAnimations` in `index.ts`:
hero entrance, scroll reveals, CTA hover, before/after sliders, page transitions.

| Attribute | Purpose | Options |
|-----------|---------|---------|
| `data-reveal` | Fade + slide up on scroll | `data-reveal-y`, `data-reveal-delay` |
| `data-reveal-group` | Stagger children | `"pop"` for scale pop, `data-reveal-stagger` |
| `data-before-after` | Draggable before/after compare | via `BeforeAfterSlider` |
| `data-flip-id` | Shared element page transition | e.g. `work-image-{slug}` |
| `data-page-transition-root` | Main content fade target | on `main` |
| `.js-parallax` | Image scrub parallax | desktop only |

Timsol-era logo-flight / section-snap / SplitText modules were removed — they no longer match the Metric header/hero DOM.
