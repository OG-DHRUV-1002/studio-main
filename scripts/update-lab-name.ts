
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

import { updateLabConfig } from '../src/lib/db';

async function main() {
    console.log("Updating Lab 3 (lab_003_general) name...");
    try {
        const result = await updateLabConfig('lab_003_general', { displayName: 'Niriksha Pathology' });
        console.log("Success! Updated config:", result);
    } catch (error) {
        console.error("Error updating lab config:", error);
    }
    process.exit(0);
}

main();
