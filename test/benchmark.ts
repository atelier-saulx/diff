import test from 'ava'
import diff, { applyPatch } from '../src'
import deepdiff, { applyChange } from 'deep-diff'
import { deepCopy, deepEqual } from '@saulx/utils'
import { updatedDiff } from 'deep-object-diff'

test('Benchmark', async (t) => {
  const a = { a: true, b: false, z: [1, 3, 5], x: [] }
  const b = { a: true, b: { x: true }, z: [1, 2, 3, 4, 5], x: [] }

  for (let i = 0; i < 100; i++) {
    if (i % 2) {
      a.x.push({ i, bla: true, snurkypants: true, flapper: true, gurken: true })
    }
    b.x.push({ bla: true, i, flapper: false, snurkypants: true })
  }

  const copiesD = []
  const copiesS = []
  const copiesX = []

  for (let i = 0; i < 10000; i++) {
    copiesS.push(deepCopy(a))
    copiesD.push(deepCopy(a))
    copiesX.push(deepCopy(a))
  }

  const xx = []
  const xxx = []
  const xxxx = []

  let d = Date.now()
  for (let i = 0; i < 10000; i++) {
    const y = updatedDiff(copiesX[i], b)
    xxxx.push(y)
  }
  console.log('Deep-diff-object create patch', Date.now() - d, 'ms')

  d = Date.now()
  for (let i = 0; i < 10000; i++) {
    const y = deepdiff(copiesD[i], b)
    xxx.push(y)
  }
  console.log('Deep-diff create patch', Date.now() - d, 'ms')

  d = Date.now()
  for (let i = 0; i < 10000; i++) {
    const y = diff(copiesS[i], b)
    xx.push(y)
  }
  console.log('Saulx-diff create patch', Date.now() - d, 'ms')

  // console.dir(xx[xx.length - 1], { depth: 10 })

  // console.dir(xxxx[xxxx.length - 1], { depth: 10 })

  const ratio =
    JSON.stringify(xx[xx.length - 1]).length /
    JSON.stringify(xxx[xxx.length - 1]).length

  //   console.log(JSON.stringify(xxx[xxx.length - 1]))

  console.log(`Saulx diff is ${~~(ratio * 100)}% smaller then deep-diff`)

  d = Date.now()
  for (let i = 0; i < 10000; i++) {
    const y = applyPatch(copiesS[i], xx[i])

    if (i === 10000 - 1) {
      console.log('Saulx diff creates equal', deepEqual(y, b))
    }
  }
  console.log('Saulx diff application', Date.now() - d, 'ms')

  d = Date.now()
  for (let i = 0; i < 10000; i++) {
    for (let j = 0; j < xxx[i].length; j++) {
      applyChange(copiesD[i], xxx[i][j])
    }
    if (i === 10000 - 1) {
      console.log('Deep diff creates equal', deepEqual(copiesD[i], b))
    }
  }

  console.log('Deep diff application', Date.now() - d, 'ms')

  t.pass()
})
