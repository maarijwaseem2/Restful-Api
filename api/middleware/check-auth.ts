import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

interface UserRequire {
  email: string;
  userId: string;
}

interface AuthenticatedRequest extends Request {
  userData?: UserRequire;
}

export default (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.authorization) {
      throw new Error('Authorization header is missing');
    }

    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY as Secret) as unknown as UserRequire & JwtPayload;
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Auth failed'
    });
  }
};
