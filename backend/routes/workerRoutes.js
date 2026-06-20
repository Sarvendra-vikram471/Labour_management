const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const auth = require('../middleware/auth');

router.post('/', auth, workerController.createWorker);
router.get('/', workerController.getWorkers);
router.get('/search', workerController.searchWorkers);
router.get('/contractor/list', auth, workerController.getContractorWorkers);
router.get('/:id', workerController.getWorkerById);
router.put('/:id', auth, workerController.updateWorker);

module.exports = router;
