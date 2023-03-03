const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { response } = require('express');
const dotenv = require('dotenv').config();

//@desc Get all users
//@route GET /users
//@accecc Private

async function getAllUsers(req, res) 
{
    try 
    {
        const users = await User.find().select('-password').lean();

        if(!users || !users.length)
        {
            return res.status(400).json({message: 'No users found.'});
        }

        res.status(200).json(users);
    } 
    catch(error) 
    {
        console.error(error);
        return res.status(500).json({message: 'Server error'});
    }
}

//@desc Create new user
//@route POST /users
//@accecc Private

async function createNewUser(req, res) 
{
    try
    {
        const { username, password, roles } = req.body;

        if(!username || !password || !Array.isArray(roles) || !roles.length)
        {
            return res.status(400).json({message: 'All fields are required'});
        }
    
        const duplicate = await User.findOne({username}).lean().exec();

        if(duplicate)
        {
            return res.status(409).json({message: 'Duplicate username'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({username, password: hashedPassword, roles});

        if(user)
        {
            return res.status(201).json({message: `New user ${username} created.`})
        }
        else
        {
            return res.status(400).json({message: 'Invalid user data recived'});
        }
    }
    catch(error)
    {
        console.error(error);
        return res.status(500).json({message: 'Server error'});
    }
}

//@desc Updare a user
//@route PATCH /users
//@accecc Private

async function updateUser(req, res) 
{
    try 
    {
        const { id, username, roles, active, password } = req.body;

        if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean')
        {
            return res.status(400).json({message: 'All fields are required'});
        }

        const user = await User.findById(id).exec();

        if(!user)
        {
            return res.status(400).json({message: 'User not found'});
        }

        const duplicate = await User.findOne({username}).lean().exec();

        if(duplicate && duplicate?._id.toString() !== id)
        {
            return res.status(409).json({message: 'Duplicate username'});
        }

        user.username = username;
        user.roles = roles;
        user.active = active;

        if(password)
        {
            user.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await user.save();

        res.json({message: `${updatedUser.username} updated`});
    } 
    catch(error) 
    {
        console.error(error);
        return res.status(500).json({message: 'Server error'});
    }
}

//@desc Delete a user
//@route DELETE /users
//@accecc Private

async function deleteUser(req, res) 
{
    const { id } = req.body;

    if(!id)
    {
        return res.status(400).json({message: 'User ID required'});
    }

    const note = await Note.findOne({ user: id}).lean().exec();

    if(note)
    {
        return res.status(400).json({message: 'User has assigned notes'});
    }

    const user = await User.findById(id).exec();

    if(!user)
    {
        return res.status(400).json({message: 'User not found'});
    }

    const result = await user.deleteOne();

    return res.json({message: `Username ${result.username} with ID ${result._id} deleted`});
}

module.exports =
{
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}


