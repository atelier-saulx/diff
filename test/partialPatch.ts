import test from 'ava'
import diff, { applyPatch, createPatch } from '../src'
import { deepCopy, deepEqual } from '@saulx/utils'
import { CreatePartialDiff } from '../src/partialDiff'

test('partialPatch', async (t) => {
  // pass a function option
  // path

  // ------------------

  const x = { flap: ['a', 'b', 'c', 'd'] }

  const y = { flap: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }

  const z = { flap: ['x', 'a', 'b', 'c', 'd'] }

  const p = createPatch(x, y)

  const pDiff: CreatePartialDiff = (v) => {
    if (!v) {
      return { type: 'update', value: ['e'] }
    }
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

  const p2 = createPatch(x, {
    flap: pDiff,
  })

  console.log('----------------------')

  console.log('real', JSON.stringify(p, null, 2))
  console.log('partial', JSON.stringify(p2, null, 2))

  console.log('----------------------')

  const p3 = createPatch(x, z)

  const pDiff2: CreatePartialDiff = (v) => {
    if (!v) {
      return { type: 'update', value: ['e'] }
    }
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

  const p4 = createPatch(x, {
    flap: pDiff2,
  })

  console.log('real', JSON.stringify(p3, null, 2))
  console.log('partial', JSON.stringify(p4, null, 2))

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
