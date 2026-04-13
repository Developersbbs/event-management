import mongoose from 'mongoose';
import Participant from './registration-form/models/Participant';
import dbConnect from './registration-form/lib/db';

async function migrate() {
    try {
        await dbConnect();
        console.log('Connected to database');

        // Note: Using any because schema might have already been updated to remove groupNumber
        const participants = await (Participant as any).find({ 
            $or: [
                { location: { $exists: false } },
                { location: "" },
                { location: null }
            ],
            groupNumber: { $exists: true, $ne: "" }
        });

        console.log(`Found ${participants.length} participants to migrate`);

        for (const p of participants) {
            console.log(`Migrating participant ${p.name || p.mobileNumber}: group ${p.groupNumber} -> location`);
            p.location = p.groupNumber;
            await p.save();
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
