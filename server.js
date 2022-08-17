const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET Route for notes page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET request for notes
app.get('/api/notes', (req, res) => {
    // Obtain notes
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            // Convert string into JSON object
            const parsedNotes = JSON.parse(data);
            res.json(parsedNotes);
        }
    });
});

// POST request to add a note
app.post('/api/notes', (req, res) => {
    // Log that a POST request was received
    console.info(`${req.method} request received to add a note`);
  
    // Destructuring assignment for the items in req.body
    const { title, text } = req.body;
  
    // If all the required properties are present
    if (title && text) {
      // Variable for the object we will save
      const newNote = {
        title,
        text,
        id: uuidv4()
      };
  
      // Obtain existing notes
      fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
        } else {
          // Convert string into JSON object
          const parsedNotes = JSON.parse(data);
  
          // Add a new note
          parsedNotes.push(newNote);
  
          // Write updated notes back to the file
          fs.writeFile(
            './db/db.json',
            JSON.stringify(parsedNotes, null, 4),
            (writeErr) =>
              writeErr
                ? console.error(writeErr)
                : console.info('Successfully updated notes!')
          );
        }
      });
  
      const response = {
        status: 'success',
        body: newNote,
      };
  
      console.log(response);
      res.status(201).json(response);
    } else {
      res.status(500).json('Error in posting note');
    }
});

// https://www.tutorialspoint.com/search-by-id-and-remove-object-from-json-array-in-javascript
const removeById = (arr, id) => {
    const requiredIndex = arr.findIndex(el => {
       return el.id === String(id);
    });
    if(requiredIndex === -1){
       return false;
    };
    return !!arr.splice(requiredIndex, 1);
 };

 // Delete route to delete a note based on id
 app.delete('/api/notes/:id', (req, res) => {
    if (req.params.id) {
        const noteId = req.params.id;

        // Obtain existing notes
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                // Convert string into JSON object
                const parsedNotes = JSON.parse(data);
                removeById(parsedNotes, noteId);
                // Write updated notes back to the file
                fs.writeFile(
                    './db/db.json',
                    JSON.stringify(parsedNotes, null, 4),
                    (writeErr) =>
                        writeErr
                        ? console.error(writeErr)
                        : console.info('Successfully updated notes!')
                );
                res.json(parsedNotes);
            }
        });
      } else {
        res.status(400).send('Note ID not provided');
      }
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
