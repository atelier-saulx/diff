import test from 'ava'
import diff, { applyPatch, createPatch } from '../src'
import { deepCopy, deepEqual } from '@saulx/utils'
import { CreatePartialDiff } from '../src/partialDiff'

const x = { flap: ['a', 'b', 'c', 'd'] }
const y = { flap: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }
const z = { flap: ['x', 'a', 'b', 'c', 'd'] }
const a = { flap: ['a', 'b', 'd'] }
const b = { flap: ['a', 'b', 'x', 'y', 'd', 'e'] }
const c = { flap: ['b', 'c', 'd'] }

test('PartialPatch value exists - insert at end (array)', async (t) => {
  const normalPatch = createPatch(x, y)
  const pDiff: CreatePartialDiff = (v) => {
    return {
      type: 'array',
      values: [
        {
          index: v.length,
          type: 'insert',
          value: 'e',
        },
        {
          index: v.length + 1,
          type: 'insert',
          values: ['f', 'g'],
        },
      ],
    }
  }
  const partialPatch = createPatch(
    x,
    {
      flap: pDiff,
    },
    { parseDiffFunctions: true }
  )
  t.true(deepEqual(normalPatch, partialPatch))
})

test('PartialPatch value exists - insert at start (array)', async (t) => {
  const normalPatch = createPatch(x, z)
  const pDiff: CreatePartialDiff = (v) => {
    return {
      type: 'array',
      values: [
        {
          index: 0,
          type: 'insert',
          value: 'x',
        },
      ],
    }
  }
  const partialPatch = createPatch(
    x,
    {
      flap: pDiff,
    },
    { parseDiffFunctions: true }
  )
  t.true(deepEqual(normalPatch, partialPatch))
})

test('PartialPatch value exists - delete at index 2 (array)', async (t) => {
  const normalPatch = createPatch(x, a)
  const pDiff: CreatePartialDiff = (v) => {
    return {
      type: 'array',
      values: [
        {
          index: 2,
          type: 'delete',
        },
      ],
    }
  }
  const partialPatch = createPatch(
    x,
    {
      flap: pDiff,
    },
    { parseDiffFunctions: true }
  )
  t.true(deepEqual(normalPatch, partialPatch))
})

test('PartialPatch value exists - delete at index end (array)', async (t) => {
  const normalPatch = createPatch(x, { flap: ['a', 'b', 'c'] })
  const pDiff: CreatePartialDiff = (c) => {
    return {
      type: 'array',
      values: [
        {
          index: c.length - 1,
          type: 'delete',
        },
      ],
    }
  }
  const partialPatch = createPatch(
    x,
    {
      flap: pDiff,
    },
    { parseDiffFunctions: true }
  )

  t.true(deepEqual(normalPatch, partialPatch))
})

test('PartialPatch value exists - delete at index 0 (array)', async (t) => {
  const normalPatch = createPatch(x, c)
  const pDiff: CreatePartialDiff = () => {
    return {
      type: 'array',
      values: [
        {
          index: 0,
          type: 'delete',
        },
      ],
    }
  }
  const partialPatch = createPatch(
    x,
    {
      flap: pDiff,
    },
    { parseDiffFunctions: true }
  )

  t.true(deepEqual(normalPatch, partialPatch))
})

test('PartialPatch value exists - delete at index 0 (array), update index 2', async (t) => {
  const d = { flap: ['b', 'd', 'd'] }

  const normalPatch = createPatch(x, d)
  const pDiff: CreatePartialDiff = () => {
    return {
      type: 'array',
      values: [
        {
          index: 0,
          type: 'delete',
        },
        {
          index: 1,
          type: 'update',
          value: 'd',
        },
      ],
    }
  }
  const partialPatch = createPatch(
    x,
    {
      flap: pDiff,
    },
    { parseDiffFunctions: true }
  )

  t.true(
    deepEqual(
      applyPatch(deepCopy(x), partialPatch),
      applyPatch(deepCopy(x), normalPatch)
    )
  )
})

test('PartialPatch value exists - delete and insert (array)', async (t) => {
  const normalPatch = createPatch(x, b)
  const pDiff: CreatePartialDiff = (v) => {
    return {
      type: 'array',
      values: [
        {
          index: 2,
          type: 'delete',
        },
        {
          index: 2,
          type: 'insert',
          values: ['x', 'y'],
        },
        {
          index: v.length,
          type: 'insert',
          value: 'e',
        },
      ],
    }
  }
  const partialPatch = createPatch(
    x,
    {
      flap: pDiff,
    },
    { parseDiffFunctions: true }
  )
  t.true(deepEqual(normalPatch, partialPatch))
})

test('PartialPatch value exists - merge (array)', async (t) => {
  const snur = {
    flap: ['a', 'b', 'c', 'd', { x: true, z: false }, 'x'],
  }
  const c = {
    flap: ['a', 'JURK!', 'JURK!', { flappie: true, z: true, x: true }, 'x'],
  }
  const p = createPatch(snur, c)
  const pDiff: CreatePartialDiff = (v) => {
    return {
      type: 'array',
      values: [
        {
          index: 1,
          value: 'JURK!',
          type: 'update',
        },
        {
          index: 2,
          value: 'JURK!',
          type: 'update',
        },
        {
          index: 3,
          type: 'delete',
        },
        {
          index: 3,
          fromIndex: 4,
          type: 'merge',
          value: { flappie: true, z: true },
        },
      ],
    }
  }
  const p2 = createPatch(
    snur,
    {
      flap: pDiff,
    },
    { parseDiffFunctions: true }
  )
  t.true(
    deepEqual(applyPatch(deepCopy(snur), p), applyPatch(deepCopy(snur), p2))
  )
})

test('Partial diff without target existing', (t) => {
  const pDiff5: CreatePartialDiff = (v) => {
    if (!v) {
      return {
        type: 'update',
        value: [1],
      }
    }

    return {
      type: 'array',
      values: [
        {
          index: 1,
          value: 'JURK!',
          type: 'update',
        },
        {
          index: 2,
          value: 'JURK!',
          type: 'update',
        },
        {
          index: 3,
          type: 'delete',
        },
        {
          index: 3,
          fromIndex: 4,
          type: 'merge',
          value: { flappie: true, z: true },
        },
      ],
    }
  }

  const p12 = createPatch(
    {},
    {
      flap: pDiff5,
    },
    { parseDiffFunctions: true }
  )
  console.log('partial', p12, JSON.stringify(p12, null, 2))
  console.log('result', applyPatch({}, p12))

  //   __$diffOperation: { type: 'array', values: [{ index: 1, value: 'xxx' }] }
  //   const patch = createPatchFromPartial(a, {
  //     flap: {
  //       flur: (currentValue) => {
  //         // can also be a field
  //         // { delete: true } // will delete it
  //         return { type: 'array', values: [{ index: 1, value: 'xxx' }] }
  //       },
  //     },
  //     x: () => ({ type: 'number', value: 5 }),
  //     y: 10, // will just set the value in place
  //     z: {
  //       a: 1,
  //       b: 2,
  //       c: 3,
  //     },
  //     flurp: {
  //       flur: (currentValue) => {
  //         return { type: 'array', values: [{ index: 1, merge: { x: true } }] }
  //       },
  //     },
  //     gurk: () => {
  //       return { type: 'object', properties: {} }
  //     },
  //   })

  t.pass()
})
