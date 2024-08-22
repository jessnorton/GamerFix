const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const itemsController = require('../controllers/itemsController');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware to check item ownership
const isOwner = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).render('error', { message: 'Item not found' });
        if (item.seller.toString() !== req.session.userId) {
            return res.status(401).render('error', { message: 'Unauthorized access' });
        }
        next();
    } catch (error) {
        return res.status(500).render('error', { message: 'Server error' });
    }
};

// Display all items
router.get('/', itemsController.listItems);

// Form to add a new item
router.get('/new', itemsController.showNewItemForm);
router.post('/', upload.single('image'), (req, res, next) => {
    itemsController.createNewItem(req, res).then(() => {
        req.flash('success_msg', 'Item successfully added.');
        res.redirect('/items');
    }).catch(error => {
        req.flash('error_msg', 'Failed to add item.');
        res.redirect('/items/new');
    });
});

// Display, edit, update, and delete a single item
router.get('/:id', itemsController.showItemDetails);
router.get('/:id/edit', isOwner, itemsController.showEditItemForm);
router.put('/:id', upload.single('image'), (req, res, next) => {
    itemsController.updateItem(req, res).then(() => {
        req.flash('success_msg', 'Item successfully updated.');
        res.redirect(`/items/${req.params.id}`);
    }).catch(error => {
        req.flash('error_msg', 'Failed to update item.');
        res.redirect(`/items/${req.params.id}/edit`);
    });
});
router.delete('/:id', isOwner, (req, res, next) => {
    itemsController.deleteItem(req, res).then(() => {
        req.flash('success_msg', 'Item successfully deleted.');
        res.redirect('/items');
    }).catch(error => {
        req.flash('error_msg', 'Failed to delete item.');
        res.redirect(`/items/${req.params.id}`);
    });
});

module.exports = router;
