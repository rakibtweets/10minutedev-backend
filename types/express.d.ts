import { ICourse } from '../src/domains/course/schema';
import { IUser } from '../src/domains/user/schema';

declare global {
  namespace Express {
    interface User extends IUser {
      _id: string;
    }
    interface Request {
      body: ICourse; // Extend the `body` property with `ICourse`
    }
  }
}
