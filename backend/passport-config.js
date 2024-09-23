const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require('./db'); // Assuming you use `pool` for database queries

// Function to configure passport
function initialize(passport) {
    // Define Passport local strategy
    const authenticateUser = async (username, password, done) => {
        try {
            const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            if (result.rows.length === 0) {
                console.log('Incorrect username:', username);
                return done(null, false, { message: 'Incorrect username.' });
            }
    
            const user = result.rows[0];
            console.log('User found:', user);

            try {
                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
            } catch (error) {
                console.error('Bcrypt compare error:', error);
                return done(error);
            }
            
        } catch (err) {
            console.error('Error during authentication:', err);
            return done(err);
        }
    };
    

    passport.use(new LocalStrategy(authenticateUser));

    // Serialize user (store user ID in session)
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user (retrieve user from session)
    passport.deserializeUser(async (id, done) => {
        try {
            const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            done(null, result.rows[0]);
        } catch (err) {
            done(err);
        }
    });
}

module.exports = initialize;
