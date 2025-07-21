import { userOperations, quizResultOperations, calculateStreak } from './database.js';

const targetEmail = 'rutu@vishwa.com';

console.log('🔍 Searching for user data...');
console.log(`📧 Email: ${targetEmail}`);
console.log('=' .repeat(50));

try {
  // Find user by email
  const user = userOperations.findByEmail(targetEmail);
  
  if (!user) {
    console.log('❌ User not found in database');
    console.log('💡 Make sure the user has logged in at least once');
    process.exit(1);
  }
  
  console.log('✅ User found!');
  console.log('📋 User Details:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Avatar: ${user.avatarUrl || 'None'}`);
  console.log(`   Created: ${user.createdAt}`);
  console.log(`   Last Login: ${user.lastLogin}`);
  
  // Get quiz results for this user
  const quizResults = quizResultOperations.findByUserId(user.id);
  
  console.log('\n📊 Quiz Results:');
  console.log(`   Total Quizzes: ${quizResults.length}`);
  
  if (quizResults.length === 0) {
    console.log('   No quiz results found');
  } else {
    // Calculate stats
    const totalScore = quizResults.reduce((sum, result) => sum + result.score, 0);
    const averageScore = Math.round(totalScore / quizResults.length);
    const passedQuizzes = quizResults.filter(result => result.passed).length;
    const passRate = Math.round((passedQuizzes / quizResults.length) * 100);
    const totalTimeSpent = quizResults.reduce((sum, result) => sum + result.timeSpent, 0);
    const streak = calculateStreak(quizResults);
    
    console.log(`   Average Score: ${averageScore}%`);
    console.log(`   Pass Rate: ${passRate}%`);
    console.log(`   Total Time Spent: ${Math.floor(totalTimeSpent / 60)} minutes ${totalTimeSpent % 60} seconds`);
    console.log(`   Current Streak: ${streak} days`);
    
    console.log('\n📝 Recent Quiz Results:');
    quizResults.slice(0, 5).forEach((result, index) => {
      const date = new Date(result.completedAt).toLocaleDateString();
      const time = new Date(result.completedAt).toLocaleTimeString();
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      
      console.log(`   ${index + 1}. ${result.lessonTitle} (${result.subjectId})`);
      console.log(`      Score: ${result.score}/${result.totalQuestions} (${Math.round(result.score/result.totalQuestions*100)}%)`);
      console.log(`      Time: ${Math.floor(result.timeSpent / 60)}:${(result.timeSpent % 60).toString().padStart(2, '0')}`);
      console.log(`      Status: ${status}`);
      console.log(`      Date: ${date} ${time}`);
      console.log(`      Type: ${result.quizType}`);
      console.log('');
    });
    
    if (quizResults.length > 5) {
      console.log(`   ... and ${quizResults.length - 5} more results`);
    }
    
    // Subject breakdown
    const subjectStats = {};
    quizResults.forEach(result => {
      if (!subjectStats[result.subjectId]) {
        subjectStats[result.subjectId] = { total: 0, passed: 0, totalScore: 0 };
      }
      subjectStats[result.subjectId].total++;
      subjectStats[result.subjectId].totalScore += result.score;
      if (result.passed) {
        subjectStats[result.subjectId].passed++;
      }
    });
    
    console.log('📚 Subject Breakdown:');
    Object.entries(subjectStats).forEach(([subject, stats]) => {
      const avgScore = Math.round(stats.totalScore / stats.total);
      const passRate = Math.round((stats.passed / stats.total) * 100);
      console.log(`   ${subject}: ${stats.total} quizzes, ${avgScore}% avg, ${passRate}% pass rate`);
    });
  }
  
  console.log('\n✅ Data retrieval complete!');
  
} catch (error) {
  console.error('❌ Error retrieving user data:', error);
  process.exit(1);
} 