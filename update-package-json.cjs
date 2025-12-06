const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update test script
packageJson.scripts.test = 'jest';
packageJson.scripts['test:watch'] = 'jest --watch';
packageJson.scripts['test:coverage'] = 'jest --coverage';
packageJson.scripts['test:ci'] = 'jest --ci --coverage --maxWorkers=2';

// Add testing dependencies if not present
const devDeps = packageJson.devDependencies || {};

const requiredDeps = {
  'jest': '^29.7.0',
  'ts-jest': '^29.1.1',
  '@testing-library/react': '^14.1.2',
  '@testing-library/jest-dom': '^6.1.5',
  '@testing-library/user-event': '^14.5.1',
  'identity-obj-proxy': '^3.0.0',
  'jest-environment-jsdom': '^29.7.0',
};

// Merge required deps (don't overwrite existing versions)
Object.keys(requiredDeps).forEach(dep => {
  if (!devDeps[dep]) {
    devDeps[dep] = requiredDeps[dep];
  }
});

packageJson.devDependencies = devDeps;

// Write back to file
fs.writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJson, null, 2) + '\n',
  'utf8'
);

console.log('✅ package.json updated successfully!');
console.log('\nAdded test scripts:');
console.log('  - npm test');
console.log('  - npm run test:watch');
console.log('  - npm run test:coverage');
console.log('  - npm run test:ci');
console.log('\nAdded/verified dev dependencies:');
Object.keys(requiredDeps).forEach(dep => {
  console.log(`  - ${dep}`);
});
console.log('\nNext steps:');
console.log('  1. Run: npm install');
console.log('  2. Run: npm test');