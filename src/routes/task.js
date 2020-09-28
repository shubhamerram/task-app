const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

router.post('/tasks',auth, async (req, res) => {
    let task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        const result = await task.save();
        res.status(201).send(result);
    } catch(e) {
        res.status(500).send();
    }
})

router.get('/tasks', auth, async (req, res) => {
    try {
        const match = {};
        const sort = {};
        if(req.query.completed) {
            match.completed = (req.query.completed === 'true')
        }
        if(req.query.sortBy) {
            const part = req.query.sortBy.split(':');
            sort[part[0]] = (part[1] === 'desc') ? -1 : 1
        }
        await req.user.populate({
            'path':'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks) 
    } catch(e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    let _id = req.params.id;
    try {
        const task = await Task.findOne({_id, 'owner':req.user.id});
        if(!task) return res.status(404).send();
        res.send(task);
    } catch(e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    try {
        const task = await Task.findOne({'_id': req.params.id, 'owner': req.user._id});
        if(!task) return res.status(404).send();
        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch(e) {
        res.status(500).send();
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({'_id':req.params.id, 'owner': req.user._id});
        if(!task) return res.status(404).send();
        res.send(task);
    } catch(e) {
        res.status(500).send();
    }
})

module.exports = router;
