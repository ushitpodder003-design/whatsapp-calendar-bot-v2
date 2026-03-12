const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('src/db/users.db');

db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Users in database:');
        rows.forEach(row => {
            console.log(`- Phone: ${row.phone}`);
            console.log(`  Access Token: ${row.access_token ? row.access_token.substring(0, 20) + '...' : 'null'}`);
            console.log(`  Refresh Token: ${row.refresh_token ? row.refresh_token.substring(0, 20) + '...' : 'null'}`);
        });
    }
    db.close();
});
