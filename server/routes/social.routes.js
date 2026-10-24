import { Router } from 'express';
import * as socialController from '../controllers/social.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/guestMiddleware.js';

const router = Router();
const membersOnly = [authenticateToken, requireRole('student', 'professor', 'admin')];

router.get('/people', ...membersOnly, socialController.listPeople);
router.post('/people/:userId/follow', ...membersOnly, socialController.followPerson);
router.delete('/people/:userId/follow', ...membersOnly, socialController.unfollowPerson);

router.post('/friends/request/:userId', ...membersOnly, socialController.sendFriendRequest);
router.post('/friends/accept/:requestId', ...membersOnly, socialController.acceptFriendRequest);
router.post('/friends/reject/:requestId', ...membersOnly, socialController.rejectFriendRequest);
router.delete('/friends/request/:userId', ...membersOnly, socialController.cancelFriendRequest);
router.delete('/friends/:userId', ...membersOnly, socialController.removeFriend);

router.get('/posts', ...membersOnly, socialController.listPosts);
router.post('/posts', ...membersOnly, socialController.createPost);
router.patch('/posts/:postId/like', ...membersOnly, socialController.setPostLike);

export default router;
