import express from "express"
import {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    updateDocument
} from "../controllers/documentController.ts"
import protect from "../middleware/auth.ts"
import upload from "../config/multer.ts"

const router = express.Router()

// All routes are protected
router.use(protect)

router.post('/upload', upload.single('file'), uploadDocument)
router.get('/', getDocuments)

router.get('/:id', getDocument)
router.delete('/:id', deleteDocument)
router.put('/:id', updateDocument)

// router.route('/:id')
//     .get(getDocument)
//     .put(updateDocument)
//     .delete(deleteDocument);

export default router
