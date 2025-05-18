import { IpesaPalError } from '../types/core-types';

export class PesaPalError extends Error {
  code: string;
  type: string;

  constructor(err: IpesaPalError) {
    super(err.message);
    this.name = 'PesaPalError';
  }
}
