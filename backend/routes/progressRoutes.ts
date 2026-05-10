import express from "express"
import { getDashboard, getProgress, updateProgress } from "../controllers/progressController.ts";
import protect from "../middleware/auth.ts";


const router = express.Router();
router.use(protect);

router.get('/dashboard', getDashboard);
// router.get('/:documentId', getProgress);
// router.put('/:documentId', updateProgress);

export default router; 