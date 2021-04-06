# Diff

Deep diff packages works on arrays and order changes. Creates very small patches for atomic changes. Big difference with other diffing packages is the handling of arrays and similarities in objects, works very well for patching of a few objects in a large array.

```javascript
import diff, { applyPatch } from '@saulx/diff'

const a = { x: true, b: [1, 5, 6] }
const b = { x: true, b: [1, 3, 4] }

const patch = diff(a, b)

applyPatch(a, patch)
```

### Benchmark

<img src="https://user-images.githubusercontent.com/5682524/113746757-f4f18900-9706-11eb-9e49-d44f6c411383.png" width="400">
