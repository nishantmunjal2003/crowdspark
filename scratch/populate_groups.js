const path = require('path');
const mongoose = require(path.join(__dirname, '../server/node_modules/mongoose'));
require(path.join(__dirname, '../server/node_modules/dotenv')).config({ path: path.join(__dirname, '../server/.env') });

async function autoTagExistingQuizzes() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const Quiz = require('../server/models/Quiz');
  const quizzes = await Quiz.find();
  console.log(`Found ${quizzes.length} quizzes to check...`);

  for (const q of quizzes) {
    if (!q.group || q.group === 'General') {
      const lowerTitle = q.title.toLowerCase();
      let assignedGroup = 'General';

      if (lowerTitle.includes('linux') || lowerTitle.includes('firewall') || lowerTitle.includes('system admin') || lowerTitle.includes('user account')) {
        assignedGroup = 'Linux Administration';
      } else if (lowerTitle.includes('javascript') || lowerTitle.includes('js') || lowerTitle.includes('react') || lowerTitle.includes('node')) {
        assignedGroup = 'JavaScript & Web';
      } else if (lowerTitle.includes('python') || lowerTitle.includes('django') || lowerTitle.includes('data')) {
        assignedGroup = 'Python Programming';
      } else if (lowerTitle.includes('cloud') || lowerTitle.includes('aws') || lowerTitle.includes('docker')) {
        assignedGroup = 'Cloud & DevOps';
      }

      await Quiz.findByIdAndUpdate(q._id, { group: assignedGroup });
      console.log(`Quiz "${q.title}" -> Group: "${assignedGroup}"`);
    }
  }

  console.log('Groups auto-categorization complete!');
  await mongoose.disconnect();
}

autoTagExistingQuizzes();
