require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const SystemSetting = require('../models/SystemSetting');

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Initialize SystemSetting defaultAiTokens = 50 if not present
        const setting = await SystemSetting.findOneAndUpdate(
            { key: 'defaultAiTokens' },
            {
                $setOnInsert: {
                    key: 'defaultAiTokens',
                    value: 50,
                    description: 'Default number of AI tokens allocated to newly registered users (1 token = 1 AI question)'
                }
            },
            { upsert: true, new: true }
        );
        console.log('SystemSetting initialized:', setting);

        // 2. Backfill existing users without aiTokens
        const usersToUpdate = await User.find({
            $or: [
                { aiTokens: { $exists: false } },
                { aiTokens: null }
            ]
        });

        console.log(`Found ${usersToUpdate.length} users needing AI tokens backfill`);

        for (const user of usersToUpdate) {
            user.aiTokens = 50;
            user.aiTokensUsed = 0;
            user.aiTokensTotal = 50;
            await user.save();
            console.log(`Updated user ${user.email} with 50 AI tokens`);
        }

        console.log('AI token backfill complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error in backfill script:', err);
        process.exit(1);
    }
}

run();
