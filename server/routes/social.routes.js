import { Router } from 'express';
import * as socialController from '../controllers/social.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/guestMiddleware.js';

const router = Router();
const membersOnly = [authenticateToken, requireRole('student', 'professor', 'admin')];

router.get('/people', ...membersOnly, socialController.listPeople);
router.post('/people/:userId/follow', ...membersOnly, socialController.followPerson);
router.delete('/people/:userId/follow', ...membersOnly, socialController.unfollowPerson);
router.get('/posts', ...membersOnly, socialController.listPosts);
router.post('/posts', ...membersOnly, socialController.createPost);
router.patch('/posts/:postId/like', ...membersOnly, socialController.setPostLike);

export default router;
