import { Client } from 'pg';

async function createDb() {
  const client = new Client({
    connectionString: 'postgresql://chinmayk@localhost:5432/postgres'
  });
  await client.connect();
  try {
    await client.query('CREATE DATABASE deploywatch');
    console.log('Database deploywatch created');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('Database deploywatch already exists');
    } else {
      console.error('Error creating database:', err);
    }
  } finally {
    await client.end();
  }
}

createDb();
