const express = require('express');
const {
    getAllCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany
} = require('../controllers/companyController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public route - anyone can view companies
router.get('/', getAllCompanies);
router.get('/:id', getCompany);

// Temporarily allow anyone to manage companies (for testing)
router.post('/', createCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

// Original admin-only routes (commented out for now)
// router.post('/', auth, adminOnly, createCompany);
// router.put('/:id', auth, adminOnly, updateCompany);
// router.delete('/:id', auth, adminOnly, deleteCompany);

module.exports = router;