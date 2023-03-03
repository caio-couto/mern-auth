const Note = require('../models/Note');
const User = require('../models/User');

// @desc Get all notes 
// @route GET /notes
// @access Private
async function getAllNotes(req, res) 
{
    try 
    {
        const notes = await Note.find().lean();

        if (!notes?.length)
        {
            return res.status(400).json({ message: 'No notes found' });
        }
    
        const notesWithUser = await Promise.all(notes.map(async (note) => 
        {
            const user = await User.findById(note.user).lean().exec();
            return { ...note, username: user.username };
        }));
    
        return res.status(200).json(notesWithUser);
    } 
    catch(error) 
    {
        console.error(error);
        return res.status(500).json({message: 'Server error'});
    }

}

// @desc Create new note
// @route POST /notes
// @access Private
async function createNewNote(req, res)  
{
    try 
    {
        const { user, title, text } = req.body;

        if(!user || !title || !text) 
        {
            return res.status(400).json({ message: 'All fields are required' });
        }
    
        const duplicate = await Note.findOne({ title }).lean().exec();
    
        if(duplicate) 
        {
            return res.status(409).json({ message: 'Duplicate note title' });
        }
    
        const note = await Note.create({ user, title, text });
    
        if(note) 
        {
            return res.status(201).json({ message: 'New note created' });
        } 
        else 
        {
            return res.status(400).json({ message: 'Invalid note data received' });
        }
    } 
    catch(error) 
    {
        console.error(error);
        return res.status(500).json({message: 'Server error'});
    }


}

// @desc Update a note
// @route PATCH /notes
// @access Private
async function updateNote(req, res)
{
    try 
    {
        const { id, user, title, text, completed } = req.body;

        if (!id || !user || !title || !text || typeof completed !== 'boolean') 
        {
            return res.status(400).json({ message: 'All fields are required' });
        }
    
        const note = await Note.findById(id).exec();
    
        if (!note) 
        {
            return res.status(400).json({ message: 'Note not found' });
        }
    
        const duplicate = await Note.findOne({ title }).lean().exec();
    
        if (duplicate && duplicate?._id.toString() !== id) 
        {
            return res.status(409).json({ message: 'Duplicate note title' });
        }
    
        note.user = user;
        note.title = title;
        note.text = text;
        note.completed = completed;
    
        const updatedNote = await note.save();
    
        res.json(`'${updatedNote.title}' updated`);
    } 
    catch(error) 
    {
        console.error(error);
        return res.status(500).json({message: 'Server error'});
    }

}

// @desc Delete a note
// @route DELETE /notes
// @access Private
async function deleteNote(req, res)
{
    const { id } = req.body;

    if(!id) 
    {
        return res.status(400).json({ message: 'Note ID required' });
    }

    const note = await Note.findById(id).exec();

    if(!note) 
    {
        return res.status(400).json({ message: 'Note not found' });
    }

    const result = await note.deleteOne();

    res.json(`Note '${result.title}' with ID ${result._id} deleted`);
}

module.exports = 
{
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
};