import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user: {
        _id: string;
        email: string;
        role: string;
      };
      __: (phrase: string, ...args: any[]) => string;
    }
  }
} 