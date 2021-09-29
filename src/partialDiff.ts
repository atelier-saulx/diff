type Operation = 'delete' | 'insert' | 'update' | 'merge'

// false do nothing

//  | 'delete' | 'update'

// export type DiffDescriptor = {
//   type?: Types
//   operator?: Operator
// }

/*
  // can also be a field
  //         // { delete: true } // will delete it
  //         return { type: 'array', values: [{ index: 1, operation: 'insert', value: 'xxx' }] }
*/

export type ArrayDiffDescriptor = {
  type: 'array'
  values: { index: number; type: Operation; value?: any; values?: any[] }[]
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
  currentValue?: any
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

      return patch
      // return pat
    }

    patch[0] = 2
    console.log(currentValue.length)

    const patches: any[] = [currentValue.length]

    // patch[1] == ;en

    patch[1] = patches
    // 0 = insert, value
    // 1 = from , amount, index (can be a copy a well)
    // 2 = index, patches[] (apply patch to a nested object or array)

    // can be done way more efficient but ok...
    r.values.sort((a, b) => {
      return a.index < b.index ? -1 : a.index === b.index ? 0 : 1
    })

    // put

    let lastIndex = 0
    for (const v of r.values) {
      const op = v.type
      const index = v.index

      if (index > lastIndex + 1) {
        patches.push([1, index - lastIndex, lastIndex])
      }
      lastIndex = index

      if (op === 'delete') {
        // currentValue.splice(index, 0)
      } else if (op === 'update') {
        const len = currentValue.length - 1
        if (index > len) {
          for (let i = len; i < index; i++) {}
        } else {
          // currentValue.splice(index, 1, v.value)
        }
      } else if (op === 'merge') {
        const len = currentValue.length - 1
        if (index > len) {
          for (let i = len; i < index; i++) {
            // currentValue.push(null)
          }
        } else {
          // currentValue.splice(index, 1, v.value)
        }
      } else if (op === 'insert') {
        const pLen = patches.length
        let p
        if (pLen > 1) {
          p = patches[pLen - 1]
        }
        if (pLen > 1 && p[0] === 0) {
          if (v.values) {
            patches[0] += v.values.length
            p.push(...v.values)
          } else {
            patches[0]++
            p.push(v.value)
          }
        } else {
          if (v.values) {
            patches[0] += v.values.length
            patches.push([0].concat(v.values))
          } else {
            patches[0]++
            patches.push([0, v.value])
          }
        }
      }
    }

    if (lastIndex < patches[0]) {
      // if (patches[pa])
      patches.push([1, patches[0] - (lastIndex + 1), lastIndex])
    }

    return patch
  } else if (r.type === 'update') {
    return [0, r.value]
  } else if (r.type === 'delete') {
    return [1]
  }
}
