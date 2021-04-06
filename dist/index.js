"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPatch = exports.applyPatch = exports.arrayDiff = void 0;
const applyPatch_1 = __importDefault(require("./applyPatch"));
exports.applyPatch = applyPatch_1.default;
const createPatch_1 = require("./createPatch");
Object.defineProperty(exports, "createPatch", { enumerable: true, get: function () { return createPatch_1.createPatch; } });
Object.defineProperty(exports, "arrayDiff", { enumerable: true, get: function () { return createPatch_1.arrayDiff; } });
exports.default = createPatch_1.createPatch;
//# sourceMappingURL=index.js.map