import { deepCopy } from '@saulx/utils'

const nestedApplyPatch = (
  value: { [key: string]: any } | Array<any>,
  key: string,
  patch: any
): void | null => {
  if (patch.constructor === Array) {
    const type = patch[0]
    // 0 - insert
    // 1 - remove
    // 2 - array
    if (type === 0) {
      // @ts-ignore
      value[key] = patch[1]
    } else if (type === 1) {
      // @ts-ignore
      delete value[key]
    } else if (type === 2) {
      // @ts-ignore
      const r = applyArrayPatch(value[key], patch[1])
      if (r === null) {
        return null
      }
      // @ts-ignore
      value[key] = r
    }
  } else {
    // @ts-ignore
    if (patch.___$toObject && value[key] && value[key].constructor === Array) {
      const v = {}
      // @ts-ignore
      for (let i = 0; i < value[key].length; i++) {
        // @ts-ignore
        v[i] = value[key][i]
      }
      // @ts-ignore
      value[key] = v
    }

    // @ts-ignore
    if (value[key] === undefined) {
      console.warn(
        'Diff apply patch: Cannot find key in original object',
        key,
        JSON.stringify(patch, null, 2)
      )
      return null
      // lets throw
    } else {
      for (const nkey in patch) {
        if (
          nkey !== '___$toObject' &&
          // @ts-ignore
          nestedApplyPatch(value[key], nkey, patch[nkey]) === null
        ) {
          return null
        }
      }
    }
  }
}

const applyArrayPatch = (value: any[], arrayPatch: any): any[] | null => {
  const patchLength = arrayPatch.length
  const newArray = new Array(arrayPatch[0])
  let aI = -1

  const patches: any = []
  const used: any = {}

  for (let i = 1; i < patchLength; i++) {
    // 0 - insert, value
    // 1 - from , index, amount (can be a copy a well)
    // 2 - amount, index
    const operation = arrayPatch[i]
    const type = operation[0]
    if (type === 0) {
      for (let j = 1; j < operation.length; j++) {
        newArray[++aI] = operation[j]
      }
    } else if (type === 1) {
      const piv = operation[2]
      const range = operation[1] + piv
      for (let j = piv; j < range; j++) {
        const t = typeof value[j]
        if (t === 'object' && j in used) {
          const copy = deepCopy(value[j])
          newArray[++aI] = copy
        } else {
          if (t === 'object') {
            used[j] = true
          }
          newArray[++aI] = value[j]
        }
      }
    } else if (type === 2) {
      const piv = operation[1]
      const range = operation.length - 2 + piv
      for (let j = piv; j < range; j++) {
        const op = [++aI, j, operation[j - piv + 2]]
        patches.push(op)
      }
    }
  }

  const len = patches.length

  for (let i = 0; i < len; i++) {
    const [aI, j, patch] = patches[i]
    const x = j in used ? deepCopy(value[j]) : value[j]
    const newObject = applyPatch(x, patch)
    if (newObject === null) {
      return null
    }
    newArray[aI] = newObject
  }

  return newArray
}

const applyPatch = (value: any, patch: any): any | null => {
  if (patch) {
    if (patch.constructor === Array) {
      const type = patch[0]
      // 0 - insert
      // 1 - remove
      // 2 - array
      if (type === 0) {
        return patch[1]
      } else if (type === 1) {
        return undefined
      } else if (type === 2) {
        return applyArrayPatch(value, patch[1])
      }
    } else {
      if (patch.___$toObject && value && value.constructor === Array) {
        const v = {}
        for (let i = 0; i < value.length; i++) {
          // @ts-ignore
          v[i] = value[i]
        }
        value = v
      }
      for (const key in patch) {
        if (key !== '___$toObject') {
          const r = nestedApplyPatch(value, key, patch[key])
          if (r === null) {
            return null
          }
        }
      }
      return value
    }
  } else {
    return value
  }
}

export default applyPatch
