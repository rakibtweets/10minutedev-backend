import { IUser } from '../src/domains/user/schema';

declare global {
  namespace Express {
    interface User extends IUser {
      _id: string;
    }
  }
}
