"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PesaPalError = void 0;
class PesaPalError extends Error {
    constructor(err) {
        super(err.message);
        this.name = 'PesaPalError';
    }
}
exports.PesaPalError = PesaPalError;
//# sourceMappingURL=error-handler.js.map