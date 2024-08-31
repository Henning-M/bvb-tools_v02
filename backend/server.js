const express = require('express');
const app = express();
const pool = require('./db');
const port = 5000;
const cors = require('cors');

// Enable CORS
app.use(cors());

app.use(express.json());


// PLAYERS TABLE OPERATIONS ///////////////////////////////////////////////////////////////

// PUT - Create a New Player
app.put('/players', async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO players (name) VALUES ($1) RETURNING id, name',
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET - Retrieve a Player by ID
app.get('/players/id/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT id, name FROM players WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET - Retrieve a Player by Name
app.get('/players/name/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const result = await pool.query(
            'SELECT id, name FROM players WHERE name = $1',
            [name]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET - Retrieve All Players
app.get('/players', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name FROM players');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE - Remove a Player (and their teammate if they're in a team)
app.delete('/players/id/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Start a transaction
        await pool.query('BEGIN');

        // Find the team of the player
        const teamResult = await pool.query(
            'SELECT player1, player2 FROM teams WHERE player1 = $1 OR player2 = $1',
            [id]
        );

        if (teamResult.rows.length > 0) {
            const team = teamResult.rows[0];
            const otherPlayerId = team.player1 == id ? team.player2 : team.player1;

            // Delete the other player
            await pool.query('DELETE FROM players WHERE id = $1', [otherPlayerId]);
        }

        // Delete the original player
        // This will automatically delete the team due to ON DELETE CASCADE
        await pool.query('DELETE FROM players WHERE id = $1', [id]);

        // Commit the transaction
        await pool.query('COMMIT');

        res.json({ message: 'Player and associated data deleted successfully' });
    } catch (err) {
        // If there's an error, roll back the transaction
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// TEAMS TABLE OPERATIONS ///////////////////////////////////////////////////////////////

// PUT - Create a New Team
app.put('/teams', async (req, res) => {
    const { name, player1, player2 } = req.body;

    if (!name || !player1 || !player2) {
        return res.status(400).json({ error: 'Name, player1, and player2 are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO teams (name, player1, player2) VALUES ($1, $2, $3) RETURNING id, name, player1, player2',
            [name, player1, player2]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET - Retrieve a Team by ID
app.get('/teams/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT id, name, player1, player2 FROM teams WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET - Retrieve All Teams
app.get('/teams', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, player1, player2 FROM teams');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE - Remove a Team by ID
app.delete('/teams/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Start a transaction
        await pool.query('BEGIN');

        // Query to get player1 and player2 IDs of the team to be deleted
        const playerResult = await pool.query(
            'SELECT player1, player2 FROM teams WHERE id = $1',
            [id]
        );

        if (playerResult.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: 'Team not found' });
        }

        const { player1, player2 } = playerResult.rows[0];

        // Delete the team
        const teamDeleteResult = await pool.query(
            'DELETE FROM teams WHERE id = $1 RETURNING id',
            [id]
        );

        // Delete both players
        await pool.query(
            'DELETE FROM players WHERE id = $1 OR id = $2',
            [player1, player2]
        );

        // Commit the transaction
        await pool.query('COMMIT');

        res.json({ message: 'Team and associated players deleted', id: teamDeleteResult.rows[0].id });
    } catch (err) {
        // If there's an error, roll back the transaction
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
