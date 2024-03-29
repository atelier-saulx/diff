// @ts-nocheck

import { hashObject } from '@saulx/hash'
import { execCreatePartialDiff } from './partialDiff.js'

// check faster way - map or this
const parseValue = (v: any) => {
  if (v === null) {
    return '___isNull$'
  }

  if (v === false) {
    return '___isFalse$'
  }

  if (v === true) {
    return '___isTrue$'
  }

  if (typeof v === 'object' && v !== null) {
    return '___obj' + hashObject(v)
  }
  // very long string might be a problem...
  return v
}

// 0 = insert, value
// 1 = from , amount, index (can be a copy a well)
// 2 = index, patches[] (apply patch to a nested object or array)
export const arrayDiff = (a, b, ctx?: Options) => {
  const aLen = a.length
  const bLen = b.length

  const resultA = {}
  const aCalced: any[] = new Array(aLen)

  // can optmize this a little bit more
  for (let j = 0; j < aLen; j++) {
    const v = parseValue(a[j])
    if (!resultA[v]) {
      resultA[v] = []
    }
    resultA[v].push(j)
    aCalced[j] = v
  }

  const r = []
  let rIndex = 0
  r[0] = bLen
  for (let i = 0; i < bLen; i++) {
    const av = aCalced[i]
    const bv = parseValue(b[i])
    const current = r[rIndex]
    const type = r[rIndex] && r[rIndex][0]
    if (av === bv) {
      let f = false
      if (type === 1) {
        const prev = current[2]
        for (let k = 0; k < prev.length; k++) {
          const nr2 = prev[k]
          if (nr2 + current[1] === i) {
            f = nr2
            break
          }
        }
      }
      if (f !== false) {
        current[1]++
        current[2] = [f]
      } else if (f === false) {
        if (type === 1) {
          current[2] = current[2][0]
        }
        rIndex++
        r[rIndex] = [1, 1, [i]]
      }
    } else if (resultA[bv]) {
      let f = false
      if (type === 1) {
        for (let j = 0; j < resultA[bv].length; j++) {
          const nr = resultA[bv][j]
          const prev = current[2]
          let x = false
          for (let k = 0; k < prev.length; k++) {
            const nr2 = prev[k]
            if (nr2 + current[1] === nr) {
              f = nr2
              x = true
              break
            }
          }
          if (x) {
            break
          }
        }
      }
      if (f !== false) {
        current[1]++
        current[2] = [f]
      } else if (f === false) {
        if (type === 1) {
          current[2] = current[2][0]
        }
        rIndex++
        r[rIndex] = [1, 1, resultA[bv]]
      }
    } else {
      if (type === 1) {
        current[2] = current[2][0]
      }
      if (typeof a[i] === 'object' && typeof b[i] === 'object') {
        const patchTime = createPatch(a[i], b[i], ctx)
        if (type === 2) {
          current.push(patchTime)
        } else {
          rIndex++
          r[rIndex] = [2, i, patchTime]
        }
      } else {
        if (type === 0) {
          // bv
          current.push(b[i])
        } else {
          rIndex++
          r[rIndex] = [0, b[i]]
        }
      }
    }
  }
  const last = r[r.length - 1]
  if (last[0] === 1) {
    last[2] = last[2][0]
  }

  if (
    r.length === 2 &&
    r[1][0] === 1 &&
    r[1][1] === r[0] &&
    r[1][2] === 0 &&
    r[0] === aLen
  ) {
    // is equal remove!
    return
  }

  return r
}

// 0 insert
// 1 remove
// 2 array
const compareNode = (
  a: any,
  b: any,
  result: any,
  key: string,
  ctx?: Options
) => {
  const type = typeof b

  if (type === 'function' && ctx && ctx.parseDiffFunctions) {
    const p = execCreatePartialDiff(b, a, ctx)
    if (p) {
      result[key] = p
    }
  } else if (type !== typeof a) {
    result[key] = [0, b]
  } else if (type === 'object') {
    if (b === null) {
      result[key] = [0, null]
    } else {
      let r
      if (b.constructor === Array) {
        if (b.length === 0) {
          if (a && a.constructor === Array && a.length === 0) {
            // is allready empty
          } else {
            r = [0, []]
            result[key] = r
          }
        } else if (a && a.constructor === Array) {
          const isDiff = arrayDiff(a, b, ctx)
          if (isDiff && isDiff.length > 1) {
            r = [2, isDiff]
            result[key] = r
          }
        } else {
          const isDiff = arrayDiff(a, b, ctx)
          if (isDiff && isDiff.length > 1) {
            r = [0, isDiff]
            result[key] = r
          }
        }
      } else {
        r = {}
        if (a && a.constructor === Array && a.length) {
          r.___$toObject = true
        }
        for (const key in b) {
          if (!(key in a)) {
            r[key] = [0, b[key]]
          } else {
            compareNode(a[key], b[key], r, key, ctx)
          }
        }
        for (const key in a) {
          if (!(key in b)) {
            r[key] = [1]
          }
        }
        // check if not empty
        // eslint-disable-next-line
        for (let _x in r) {
          result[key] = r
          break
        }
      }
    }
  } else {
    if (a === b) {
      // no change do nothing
    } else {
      result[key] = [0, b]
      // for now
    }
  }
}

export type Options = {
  parseDiffFunctions?: boolean
}

const walkDiffResults = (b, key, ctx) => {
  const bNode = b[key]
  if (bNode) {
    const t = typeof bNode
    if (t === 'function') {
      const p = execCreatePartialDiff(b[key], undefined, ctx)
      if (p) {
        b[key] = p[1]
      } else {
        delete b[key]
      }
    } else if (t === 'object') {
      for (const key in bNode) {
        walkDiffResults(bNode, key, ctx)
      }
    }
  }
}

export const createPatch = (a: any, b: any, ctx?: Options) => {
  const type = typeof b
  // eslint-disable-next-line
  if (type !== typeof a) {
    return [0, b]
  } else if (type === 'object') {
    if (b === null) {
      return [0, null]
    } else {
      // fastest check
      if (b.constructor === Array) {
        if (b.length === 0) {
          if (a.constructor === Array && a.length === 0) {
            return
          }
          return [0, b]
        } else if (a.constructor === Array) {
          const isDiff = arrayDiff(a, b, ctx)
          if (isDiff && isDiff.length > 1) {
            return [2, arrayDiff(a, b, ctx)]
          }
        } else {
          return [0, b]
        }
      } else {
        // make this result undefined
        const result: { [key: string]: any } = {}

        if (a.constructor === Array) {
          result.___$toObject = true
        }

        for (const key in b) {
          if (!(key in a)) {
            if (ctx && ctx.parseDiffFunctions) {
              walkDiffResults(b, key, ctx)
            }
            result[key] = [0, b[key]]
          } else {
            // same for a need to remove keys if b does not have them
            compareNode(a[key], b[key], result, key, ctx)
          }
        }
        for (const key in a) {
          if (!(key in b)) {
            result[key] = [1]
          }
        }
        // check if not empty
        // eslint-disable-next-line
        for (let _x in result) {
          return result
        }
        // else return undefined
      }
    }
  } else {
    if (a === b) {
      // no change do nothing
    } else {
      return [0, b]
    }
  }
}
