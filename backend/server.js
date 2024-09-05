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

        // Delete all fixtures (fixtures need team-id as foreign key)
        await pool.query('DELETE FROM fixtures');

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

// FIXTURES TABLE OPERATIONS ///////////////////////////////////////////////////////////////

//PUT - initialize tournament schedule
app.put('/fixtures', async (req, res) => {
    const { schedule } = req.body;
    
    try {
      await pool.query('BEGIN');
  
      // Clear existing fixtures
      await pool.query('DELETE FROM fixtures');
  
      // Insert new fixtures
      for (let roundIndex = 0; roundIndex < schedule.length; roundIndex++) {
        const round = schedule[roundIndex];
        const roundNumber = roundIndex + 1;
  
        for (let groupIndex = 0; groupIndex < round.groups.length; groupIndex++) {
          const group = round.groups[groupIndex];
          const groupNumber = groupIndex + 1;
  
          for (const team of group) {
            await pool.query(
              'INSERT INTO fixtures (round, "group", team, points) VALUES ($1, $2, $3, $4)',
              [roundNumber, groupNumber, team.id, 0]
            );
          }
        }
      }
  
      await pool.query('COMMIT');
      res.status(200).json({ message: 'Schedule successfully saved to fixtures' });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error saving fixtures:', error);
      res.status(500).json({ error: 'An error occurred while saving the fixtures' });
    }
  });

//GET - fetch fixtures and scores IS THIS IN USE?!
app.get('/fixtures', async (req, res) => {
});

// GET - fetch distinct rounds from fixtures - used for the Nav on KotcHFixtures
app.get('/fixtures/rounds', async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT round FROM fixtures ORDER BY round');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching rounds from fixtures:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET - fetch fixtures for a specific round
app.get('/fixtures/round/:roundNumber', async (req, res) => {
    const { roundNumber } = req.params;
    try {
        const result = await pool.query(`
            SELECT f."group", f.team AS team_id, t.name AS team, f.points
            FROM fixtures f
            JOIN teams t ON f.team = t.id
            WHERE f.round = $1
            ORDER BY f."group", t.name
        `, [roundNumber]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching fixtures for round:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT - update points for a specific team in a specific round
app.put('/fixtures/round/:roundNumber/team/:teamId', async (req, res) => {
    const { roundNumber, teamId } = req.params;
    const { points } = req.body; // Expect points to be sent in the request body

    try {
        const result = await pool.query(`
            UPDATE fixtures
            SET points = $1
            WHERE round = $2 AND team = $3
        `, [points, roundNumber, teamId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Fixture not found for the specified round and team' });
        }

        res.status(200).json({ message: 'Points updated successfully' });
    } catch (error) {
        console.error('Error updating points:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET - fetch submitted points for a specific round
app.get('/fixtures/round/:roundNumber/points', async (req, res) => {
    const { roundNumber } = req.params;
    try {
        const result = await pool.query(`
            SELECT team, points 
            FROM fixtures
            WHERE round = $1
        `, [roundNumber]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching submitted points:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET - fetch the current state of acceptingInput for a specific round
app.get('/fixtures/round/:roundNumber/acceptingInput', async (req, res) => {
    const { roundNumber } = req.params;
    try {
        const result = await pool.query(`
            SELECT acceptinginput
            FROM fixtures 
            WHERE round = $1 
            LIMIT 1
        `, [roundNumber]);

        if (result.rows.length > 0) {
            res.json({ acceptingInput: result.rows[0].acceptinginput });
        } else {
            res.status(404).json({ error: 'Round not found' });
        }
    } catch (error) {
        console.error('Error fetching acceptingInput state:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT - toggle the acceptingInput state for a specific round
app.put('/fixtures/round/:roundNumber/acceptingInput', async (req, res) => {
    const { roundNumber } = req.params;
    try {
        const result = await pool.query(`
            UPDATE fixtures 
            SET acceptingInput = NOT acceptingInput 
            WHERE round = $1
        `, [roundNumber]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Round not found' });
        }

        res.status(200).json({ message: 'acceptingInput state toggled successfully' });
    } catch (error) {
        console.error('Error toggling acceptingInput state:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


//DELETE - remove all fixtures / clear the table
app.delete('/fixtures', async (req, res) => {
    try {
        await pool.query('DELETE FROM fixtures');
        res.json({ message: 'Schedule cleared'});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// FEATURE_STATE TABLE OPERATIONS ///////////////////////////////////////////////////////////////

// Get the current state of the registration-open feature
app.get('/feature_states/registration-open', async (req, res) => {
    try {
        const result = await pool.query('SELECT is_enabled FROM feature_states WHERE feature_name = $1', ['registration-open']);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Feature not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching feature state:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Toggle the state of the registration-open feature
app.post('/feature_states/registration-open/toggle', async (req, res) => {
    try {
        const result = await pool.query('UPDATE feature_states SET is_enabled = NOT is_enabled WHERE feature_name = $1 RETURNING is_enabled', ['registration-open']);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Feature not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error toggling feature state:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get the current state of the isFixturesInDb feature
app.get('/feature_states/fixturesindb', async (req, res) => {
    try {
        const result = await pool.query('SELECT is_enabled FROM feature_states WHERE feature_name = $1', ['fixturesInDb']);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Feature not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching feature state:', error);
        res.status(500).json({ error: 'Server error' });
    }
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
