import fs from 'fs';
import path from 'path';

const FILE_PATH = "./src/data/user.json";

export const readSubscribers = () => {
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify({ subscribers: [] }, null, 2));
  }

  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('❌ Failed to read users.json:', err);
    return null;
  }
};

export const saveSubscribers = (subscribers) => {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify({ subscribers }, null, 2));
  } catch (err) {
    console.error('❌ Failed to write to users.json:', err);
  }
};
