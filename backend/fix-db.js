const db = require('better-sqlite3')('./database.sqlite');
db.prepare("UPDATE projects SET tenant_id = 'instituto-mcs' WHERE tenant_id = 'mcs'").run();
console.log('Fixed tenant_id in projects.');
