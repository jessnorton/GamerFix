const { User, Item } = require('../models/model');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

exports.listItems = async (req, res) => {
    try {
        const searchQuery = req.query.search;
        let query = Item.find({ active: true });

        if (searchQuery) {
            query = query.where({
                $or: [
                    { title: { $regex: searchQuery, $options: 'i' } },
                    { details: { $regex: searchQuery, $options: 'i' } }
                ]
            });
        }

        const items = await query.sort('price');
        res.render('items', { items });
    } catch (err) {
        res.status(500).send('Error retrieving items from the database.');
    }
};

exports.showNewItemForm = (req, res) => {
    res.render('new');
};

exports.createNewItem = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/user/login');
    }
    try {
        const newItemData = {
            ...req.body,
            image: req.file ? req.file.path.replace('public', '') : '/images/default-image.jpg',
            seller: req.session.userId
        };
        const newItem = await Item.create(newItemData);
        res.redirect('/items');
    } catch (err) {
        console.error(err);
        res.status(400).render('error', { message: 'Error creating item: ' + err.message });
    }
};


exports.showItemDetails = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('seller', 'firstName lastName');
        
        if (!item) {
            return res.status(404).render('error', { message: 'Item not found' });
        }
        res.render('item', { item });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error fetching item details' });
    }
};

exports.showEditItemForm = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
                               .populate('seller', 'firstName lastName');
        if (!item) {
            return res.status(404).render('error', { message: 'Item not found' });
        }

        const sellerName = item.seller.firstName + ' ' + item.seller.lastName;
        res.render('edit', { item, sellerName });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error fetching item for editing' });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const updateData = {
            title: req.body.title,
            condition: req.body.condition,
            price: req.body.price,
            details: req.body.details
        };

        if (req.file) {
            updateData.image = req.file.path;
        }

        const updatedItem = await Item.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.redirect('/items/' + updatedItem._id);
    } catch (err) {
        console.error("Error updating item:", err);
        res.status(500).render('error', { message: 'Error updating item' });
    }
};

exports.deleteItem = async (req, res) => {
    const itemId = req.params.id;
    const item = await Item.findById(itemId);
    if (!item) {
        return res.status(404).send("Item not found.");
    }
    if (item.seller.toString() !== req.session.userId) {
        return res.status(401).send("Unauthorized: You can only delete your own items.");
    }
    try {
        await Item.findByIdAndDelete(itemId);
        res.redirect('/items');
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to delete item: " + err.message);
    }
};