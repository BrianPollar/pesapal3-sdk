"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PesaPalInvalidConfigError = exports.PesaPalError = void 0;
class PesaPalError extends Error {
    constructor(err) {
        super(err.message);
        this.name = 'PesaPalError';
    }
}
exports.PesaPalError = PesaPalError;
class PesaPalInvalidConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PesaPalInvalidConfigError';
    }
}
exports.PesaPalInvalidConfigError = PesaPalInvalidConfigError;
//# sourceMappingURL=error-handler.js.map