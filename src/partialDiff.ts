import { deepCopy, deepMerge } from '@saulx/utils'
import createPatch, { Options } from '.'

type Operation = 'delete' | 'insert' | 'update' | 'merge'

export type ArrayDiffDescriptor = {
  type: 'array'
  values: {
    index: number
    fromIndex?: number
    type: Operation
    value?: any
    values?: any[]
  }[]
}

export type ValueUpdate = {
  type: Operation
  value?: any
}

export type CreatePartialDiff = (
  currentValue?: any
) => ArrayDiffDescriptor | ValueUpdate | false

export const execCreatePartialDiff = (
  fn: CreatePartialDiff,
  currentValue?: any,
  ctx?: Options
) => {
  const r = fn(currentValue)

  if (r === false) {
    return undefined
  }
  // 0 insert
  // 1 remove
  // 2 array
  if (r.type === 'array') {
    const patch: any[] = []

    if (!Array.isArray(currentValue)) {
      patch[0] = 0

      // handle it special

      // also need to do something....

      console.log('no current value do something...')

      return patch
      // return pat
    }

    patch[0] = 2

    const patches: any[] = [currentValue.length]

    patch[1] = patches
    // 0 = insert, value
    // 1 = from , amount, index (can be a copy a well)
    // 2 = index, patches[] (apply patch to a nested object or array)

    // can be done way more efficient but ok...
    r.values.sort((a, b) => {
      return a.index < b.index ? -1 : a.index === b.index ? 0 : 1
    })

    let lastIndex = 0
    let prevDel
    let lastAdded = 0
    let total = 0
    let lastUpdate = true

    for (const v of r.values) {
      const op = v.type
      let index = v.index

      if (lastAdded) {
        if (index + lastAdded > lastIndex + 1) {
          const a = index - lastIndex - 1
          if (a > 0) {
            total += a
            patches.push([1, index - lastIndex - 1, lastIndex + 1])
          }
        }
      } else if (prevDel ? index > lastIndex : index > lastIndex + 1) {
        if (prevDel) {
          if (op === 'insert') {
            const a = index - lastIndex - 1

            patches[0]++

            if (a > 0) {
              total += a

              patches.push([1, a, lastIndex + 1])
            }
          } else {
            const a = index - lastIndex

            if (a > 0) {
              total += a

              patches.push([1, a, lastIndex + 1])
            }
          }
        } else {
          const a = index - lastIndex
          if (a > 0) {
            total += a

            patches.push([1, a, lastIndex])
          }
        }
      }

      if (op === 'delete') {
        patches[0]--
        prevDel = true
        lastUpdate = false
        if (
          lastAdded &&
          patches.length > 1 &&
          patches[patches.length - 1][0] === 1
        ) {
          patches[patches.length - 1][2]--
          // patches[0]++
        }
        lastAdded = 0
      } else {
        if (op === 'update' || op === 'merge') {
          lastUpdate = true

          // lastAdded++
          let isMerge = false
          let val = v.value
          if (op === 'merge') {
            const from = v.fromIndex || index
            if (!currentValue[from] || typeof currentValue[from] !== 'object') {
              // do nothing special
            } else {
              const x = deepMerge(deepCopy(currentValue[from]), val)
              val = [2, from, createPatch(currentValue[from], x)]
              isMerge = true
            }
          }
          const p = patches[patches.length - 1]
          if (!isMerge && patches.length > 1 && p[0] === 0) {
            p.push(val)
            total++
            index++
          } else {
            if (lastIndex === 0 && index === 1 && !prevDel) {
              patches.push([1, 1, 0])
              total++
            }
            total++
            if (isMerge) {
              patches.push(val)
            } else {
              patches.push([0, val])
            }
            index++
          }
        } else if (op === 'insert') {
          lastUpdate = false
          const pLen = patches.length
          let p
          if (pLen > 1) {
            p = patches[pLen - 1]
          }
          if (pLen > 1 && p[0] === 0) {
            if (v.values) {
              lastAdded = v.values.length
              patches[0] += v.values.length
              p.push(...v.values)
            } else {
              patches[0]++
              lastAdded = 1
              p.push(v.value)
            }
          } else {
            if (v.values) {
              lastAdded = v.values.length
              patches[0] += v.values.length
              patches.push([0].concat(v.values))
            } else {
              patches[0]++
              lastAdded = 1
              patches.push([0, v.value])
            }
          }
          total += lastAdded
        }
        prevDel = false
      }
      lastIndex = index
    }

    if (total < patches[0]) {
      const a = patches[0] - total
      if (prevDel || lastUpdate) {
        if (a > 0) {
          patches.push([1, a, lastIndex + 1])
        }
      } else {
        if (a > 0) {
          patches.push([1, a, lastIndex])
        }
      }
    }

    return patch
  } else if (r.type === 'update') {
    return [0, r.value]
  } else if (r.type === 'delete') {
    return [1]
  }
}
