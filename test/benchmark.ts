import test from 'ava'
import diff, { applyPatch } from '../src/index.js'
// @ts-ignore
// import deepdiff, { applyChange } from 'deep-diff'
import { deepCopy, deepEqual } from '@saulx/utils'
// import { updatedDiff } from 'deep-object-diff'

test('Simple benchmark', async (t) => {
  const start = {
    a: 'hello',
    b: 'shurf',
    c: 'snurx',
    d: { e: 'x' },
    f: [1, 2, 3, 4, 5],
  }
  const dest = {
    a: 'BLARF',
    z: true,
    f: [6, 1, 2, 8, 9, 4, 5],
    snurkypants: { a: true, b: false },
    d: { e: { x: true } },
  }

  const patch = diff(start, dest)

  const copies: any = []
  for (let i = 0; i < 1000e3; i++) {
    copies.push(deepCopy(start))
  }

  const d = Date.now()

  for (let i = 0; i < 1000e3; i++) {
    applyPatch(copies[i], patch)
  }

  console.info(Date.now() - d, 'ms')

  t.pass()
})

// test('Benchmark', async (t) => {
//   const a: any = { a: true, b: false, z: [1, 3, 5], x: [] }
//   const b: any = { a: true, b: { x: true }, z: [1, 2, 3, 4, 5], x: [] }

//   for (let i = 0; i < 100; i++) {
//     if (i % 2) {
//       a.x.push({ i, bla: true, snurkypants: true, flapper: true, gurken: true })
//     }
//     b.x.push({ bla: true, i, flapper: false, snurkypants: true })
//   }

//   const copiesD: any = []
//   const copiesS: any = []
//   const copiesX: any = []

//   for (let i = 0; i < 10000; i++) {
//     copiesS.push(deepCopy(a))
//     copiesD.push(deepCopy(a))
//     copiesX.push(deepCopy(a))
//   }

//   const xx: any = []
//   const xxx: any = []
//   const xxxx: any = []

//   let d = Date.now()
//   for (let i = 0; i < 10000; i++) {
//     const y = updatedDiff(copiesX[i], b)
//     xxxx.push(y)
//   }
//   console.info('Deep-diff-object create patch', Date.now() - d, 'ms')

//   d = Date.now()
//   for (let i = 0; i < 10000; i++) {
//     const y = deepdiff(copiesD[i], b)
//     xxx.push(y)
//   }
//   console.info('Deep-diff create patch', Date.now() - d, 'ms')

//   d = Date.now()
//   for (let i = 0; i < 10000; i++) {
//     const y = diff(copiesS[i], b)
//     xx.push(y)
//   }
//   console.info('Saulx-diff create patch', Date.now() - d, 'ms')

//   // console.dir(xx[xx.length - 1], { depth: 10 })

//   // console.dir(xxxx[xxxx.length - 1], { depth: 10 })

//   const ratio =
//     JSON.stringify(xx[xx.length - 1]).length /
//     JSON.stringify(xxx[xxx.length - 1]).length

//   //   console.info(JSON.stringify(xxx[xxx.length - 1]))

//   console.info(`Saulx diff is ${~~(ratio * 100)}% smaller then deep-diff`)

//   d = Date.now()
//   for (let i = 0; i < 10000; i++) {
//     const y = applyPatch(copiesS[i], xx[i])

//     if (i === 10000 - 1) {
//       console.info('Saulx diff creates equal', deepEqual(y, b))
//     }
//   }
//   console.info('Saulx diff application', Date.now() - d, 'ms')

//   d = Date.now()
//   for (let i = 0; i < 10000; i++) {
//     for (let j = 0; j < xxx[i].length; j++) {
//       applyChange(copiesD[i], xxx[i][j])
//     }
//     if (i === 10000 - 1) {
//       console.info('Deep diff creates equal', deepEqual(copiesD[i], b))
//     }
//   }

//   console.info('Deep diff application', Date.now() - d, 'ms')

//   t.pass()
// })
