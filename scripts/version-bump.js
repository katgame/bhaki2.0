const fs = require('fs');
const path = require('path');

// Read package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Parse current version
const versionParts = packageJson.version.split('.');
const major = parseInt(versionParts[0]);
const minor = parseInt(versionParts[1]);
const patch = parseInt(versionParts[2]);

// Increment patch version
const newVersion = `${major}.${minor}.${patch + 1}`;

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

// Update environment files
const envFiles = [
  path.join(__dirname, '..', 'src', 'environments', 'environment.ts'),
  path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts')
];

envFiles.forEach(envPath => {
  let envContent = fs.readFileSync(envPath, 'utf8');
  // Replace version in environment files
  envContent = envContent.replace(/version:\s*['"](.*?)['"]/g, `version: '${newVersion}'`);
  fs.writeFileSync(envPath, envContent);
});

console.log(`Version updated to ${newVersion}`);

