import { Router, Request, Response } from 'express';
import { register, login, getProfile } from './controllers';
import { authenticateToken } from './middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);

export default router;

// Add the missing property 'user' with 'userId' to the 'Request' type
declare global {
  namespace Express {
	interface Request {
	  user: {
		userId: number;
	  };
	}
  }
}
