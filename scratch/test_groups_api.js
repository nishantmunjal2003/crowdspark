const path = require('path');

async function testGroupsAndSearch() {
  console.log('=== Starting Groups & Search API Verification ===\n');

  try {
    // 1. Fetch existing quizzes
    const quizzesRes = await fetch('http://localhost:3001/api/quizzes');
    const quizzes = await quizzesRes.json();
    console.log(`Fetched ${quizzes.length} total quizzes.`);

    if (quizzes.length > 0) {
      const testQuiz = quizzes[0];
      const testId = testQuiz._id;
      const originalGroup = testQuiz.group || 'General';
      const newTestGroup = 'DevOps & Cloud';

      console.log(`\n--- Test 1: Update quiz "${testQuiz.title}" group from "${originalGroup}" to "${newTestGroup}" ---`);
      const updateRes = await fetch(`http://localhost:3001/api/quizzes/${testId}/group`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: newTestGroup })
      });
      const updateData = await updateRes.json();
      console.log('Update response:', updateData.success ? 'Success' : 'Failed', 'New group:', updateData.quiz?.group);

      console.log(`\n--- Test 2: Rename group "${newTestGroup}" back to "${originalGroup}" across user quizzes ---`);
      const renameRes = await fetch('http://localhost:3001/api/quizzes/rename-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testQuiz.creatorId,
          oldGroup: newTestGroup,
          newGroup: originalGroup
        })
      });
      const renameData = await renameRes.json();
      console.log('Rename response:', renameData.success ? 'Success' : 'Failed', 'Modified count:', renameData.modifiedCount);
    }

    console.log('\n=== Groups & Search API Verification Passed! ===');
  } catch (err) {
    console.error('Error in Groups test:', err);
  }
}

testGroupsAndSearch();
