const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const validateRequest = require('../middlewares/validateRequest');
const {
  createLar,
  getLares,
  getLarById,
  updateLar,
  deleteLar
} = require('../controllers/laresController');

// Validações
const larValidation = require('../middlewares/validateRequest').larValidation;

router.post('/', upload.single('image'), larValidation, createLar);
router.get('/', getLares);
router.get('/:id', getLarById);
router.put('/:id', upload.single('image'), updateLar);
router.delete('/:id', deleteLar);

module.exports = router;