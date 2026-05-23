import { Router } from 'express';
import { getUsersCache } from '../controllers/usersController';
import { getKeys } from '../controllers/keysController';
import { syncEvents, getSyncStatus } from '../controllers/syncController';

const router = Router();

router.get('/users/cache', getUsersCache);
router.get('/keys', getKeys);
router.post('/sync', syncEvents);
router.get('/sync/status/:deviceId', getSyncStatus);

export default router;