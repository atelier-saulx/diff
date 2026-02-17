import test from 'ava'
import diff, { applyPatch } from '../src/index.js'
import { deepCopy } from '@saulx/utils'

test('Apply patch benchmark', async (t) => {
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

  t.log(Date.now() - d, 'ms')

  t.pass()
})

test('Create patch benchmark', async (t) => {
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

  const d = Date.now()
  let patch
  for (let i = 0; i < 1000e3; i++) {
    patch = diff(start, dest)
  }

  // prevent optimization
  if (patch) {
    t.log(Date.now() - d, 'ms')
  }

  t.pass()
})
