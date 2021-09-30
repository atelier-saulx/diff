"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execCreatePartialDiff = void 0;
const utils_1 = require("@saulx/utils");
const _1 = __importDefault(require("."));
const execCreatePartialDiff = (fn, currentValue, ctx) => {
    const r = fn(currentValue);
    if (r === false) {
        return undefined;
    }
    // 0 insert
    // 1 remove
    // 2 array
    if (r.type === 'array') {
        const patch = [];
        if (!Array.isArray(currentValue)) {
            patch[0] = 0;
            // handle it special
            // also need to do something....
            console.log('no current value do something...');
            return patch;
            // return pat
        }
        patch[0] = 2;
        const patches = [currentValue.length];
        patch[1] = patches;
        // 0 = insert, value
        // 1 = from , amount, index (can be a copy a well)
        // 2 = index, patches[] (apply patch to a nested object or array)
        // can be done way more efficient but ok...
        r.values.sort((a, b) => {
            return a.index < b.index ? -1 : a.index === b.index ? 0 : 1;
        });
        let lastIndex = 0;
        let prevDel;
        let lastAdded = 0;
        let total = 0;
        let lastUpdate = true;
        for (const v of r.values) {
            const op = v.type;
            let index = v.index;
            if (lastAdded) {
                if (index + lastAdded > lastIndex + 1) {
                    const a = index - lastIndex - 1;
                    if (a > 0) {
                        total += a;
                        patches.push([1, index - lastIndex - 1, lastIndex + 1]);
                    }
                }
            }
            else if (prevDel ? index > lastIndex : index > lastIndex + 1) {
                if (prevDel) {
                    const a = index - lastIndex;
                    if (a > 0) {
                        total += a;
                        patches.push([1, index - lastIndex, lastIndex + 1]);
                    }
                }
                else {
                    const a = index - lastIndex;
                    if (a > 0) {
                        total += a;
                        patches.push([1, index - lastIndex, lastIndex]);
                    }
                }
            }
            if (op === 'delete') {
                lastAdded = 0;
                patches[0]--;
                prevDel = true;
                lastUpdate = false;
            }
            else {
                if (op === 'update' || op === 'merge') {
                    lastUpdate = true;
                    // lastAdded++
                    let isMerge = false;
                    let val = v.value;
                    if (op === 'merge') {
                        const from = v.fromIndex || index;
                        if (!currentValue[from] || typeof currentValue[from] !== 'object') {
                            // do nothing special
                        }
                        else {
                            const x = utils_1.deepMerge(utils_1.deepCopy(currentValue[from]), val);
                            val = [2, from, _1.default(currentValue[from], x)];
                            isMerge = true;
                        }
                    }
                    const p = patches[patches.length - 1];
                    if (!isMerge && patches.length > 1 && p[0] === 0) {
                        p.push(val);
                        total++;
                        index++;
                    }
                    else {
                        if (lastIndex === 0 && index === 1 && !prevDel) {
                            patches.push([1, 1, 0]);
                            total++;
                        }
                        total++;
                        if (isMerge) {
                            patches.push(val);
                        }
                        else {
                            patches.push([0, val]);
                        }
                        index++;
                    }
                }
                else if (op === 'insert') {
                    lastUpdate = false;
                    const pLen = patches.length;
                    let p;
                    if (pLen > 1) {
                        p = patches[pLen - 1];
                    }
                    if (pLen > 1 && p[0] === 0) {
                        if (v.values) {
                            lastAdded = v.values.length;
                            patches[0] += v.values.length;
                            p.push(...v.values);
                        }
                        else {
                            patches[0]++;
                            lastAdded = 1;
                            p.push(v.value);
                        }
                    }
                    else {
                        if (v.values) {
                            lastAdded = v.values.length;
                            patches[0] += v.values.length;
                            patches.push([0].concat(v.values));
                        }
                        else {
                            patches[0]++;
                            lastAdded = 1;
                            patches.push([0, v.value]);
                        }
                    }
                    total += lastAdded;
                }
                prevDel = false;
            }
            lastIndex = index;
        }
        if (total < patches[0]) {
            const a = patches[0] - total;
            if (prevDel || lastUpdate) {
                if (a > 0) {
                    patches.push([1, a, lastIndex + 1]);
                }
            }
            else {
                if (a > 0) {
                    patches.push([1, a, lastIndex]);
                }
            }
        }
        return patch;
    }
    else if (r.type === 'update') {
        return [0, r.value];
    }
    else if (r.type === 'delete') {
        return [1];
    }
};
exports.execCreatePartialDiff = execCreatePartialDiff;
//# sourceMappingURL=partialDiff.js.map