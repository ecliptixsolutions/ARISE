// generate-secrets.js
// Run once on the Hostinger server to generate the two required secrets.
// Copy the output into your .env file.
// Usage: node generate-secrets.js
import { randomBytes } from 'crypto';

const ariseApiSecret = randomBytes(48).toString('hex');
const sessionSecret  = randomBytes(48).toString('hex');

console.log('\n========================================');
console.log(' ARISE API SECRETS — copy into .env');
console.log('========================================');
console.log(`ARISE_API_SECRET=${ariseApiSecret}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log('========================================');
console.log('\nAlso copy ARISE_API_SECRET and SESSION_SECRET');
console.log('to your Cloudflare Worker environment variables.');
console.log('Run: wrangler secret put ARISE_API_SECRET');
console.log('     wrangler secret put SESSION_SECRET\n');
