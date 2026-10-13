import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const isBackendPackage = (directory: string): boolean => {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
    return packageJson.name === 'talentflow-backend';
  } catch {
    return false;
  }
};

const candidates = [
  __dirname,
  path.resolve(__dirname, '..'),
  path.resolve(__dirname, '../..'),
  process.cwd(),
];
const backendRoot = candidates.find(isBackendPackage);

if (!backendRoot) {
  throw new Error('Could not locate the TalentFlow backend package to load its local environment file.');
}

// A platform-provided environment takes precedence; dotenv does not override existing values.
dotenv.config({ path: path.join(backendRoot, '.env') });
