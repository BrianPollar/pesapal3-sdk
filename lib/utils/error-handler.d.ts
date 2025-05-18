import { IpesaPalError } from '../types/core-types';
export declare class PesaPalError extends Error {
    code: string;
    type: string;
    constructor(err: IpesaPalError);
}
