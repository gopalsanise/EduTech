const express = require('express');
const Branch = require('../models/Branch');
const { auth, authorize } = require('../middleware/auth');
const { validateRequired } = require('../utils/validation');
const router = express.Router();

// Get all branches
router.get('/', auth, async (req, res) => {
    try {
        const branches = await Branch.find().sort('name');
        res.send(branches);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Create branch (Admin only)
router.post('/', auth, authorize(['admin']), async (req, res) => {
    try {
        const requiredFields = ['name', 'code'];
        const missing = validateRequired(requiredFields, req.body);
        if (missing.length > 0) {
            return res.status(400).send({ error: `Missing field(s): ${missing.join(', ')}` });
        }

        const branch = new Branch(req.body);
        await branch.save();
        res.status(201).send(branch);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Update branch (Admin only)
router.patch('/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!branch) return res.status(404).send({ error: 'Branch not found' });
        res.send(branch);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Delete branch (Admin only)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        const branch = await Branch.findByIdAndDelete(req.params.id);
        if (!branch) return res.status(404).send({ error: 'Branch not found' });
        res.send({ message: 'Branch deleted successfully' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

module.exports = router;
