import { IUser } from 'src/payment/interfaces';

export interface IRequestWithUser extends Request {
  user?: IUser;
}
