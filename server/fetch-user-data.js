import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';
const targetEmail = 'rutu@vishwa.com';

console.log('🔍 Fetching user data via API...');
console.log(`📧 Email: ${targetEmail}`);
console.log('=' .repeat(50));

async function fetchUserData() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/user/${encodeURIComponent(targetEmail)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('❌ User not found');
        console.log('💡 Make sure the user has logged in at least once');
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ User found!');
    console.log('📋 User Details:');
    console.log(`   ID: ${data.user.id}`);
    console.log(`   Name: ${data.user.name}`);
    console.log(`   Email: ${data.user.email}`);
    console.log(`   Role: ${data.user.role}`);
    console.log(`   Avatar: ${data.user.avatarUrl || 'None'}`);
    console.log(`   Created: ${data.user.createdAt}`);
    console.log(`   Last Login: ${data.user.lastLogin}`);
    
    console.log('\n📊 Quiz Statistics:');
    console.log(`   Total Quizzes: ${data.stats.totalQuizzes}`);
    console.log(`   Average Score: ${data.stats.averageScore}%`);
    console.log(`   Pass Rate: ${data.stats.passRate}%`);
    console.log(`   Total Time Spent: ${Math.floor(data.stats.totalTimeSpent / 60)} minutes ${data.stats.totalTimeSpent % 60} seconds`);
    console.log(`   Current Streak: ${data.stats.streak} days`);
    
    if (data.quizResults.length > 0) {
      console.log('\n📝 Recent Quiz Results:');
      data.quizResults.slice(0, 5).forEach((result, index) => {
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
      
      if (data.quizResults.length > 5) {
        console.log(`   ... and ${data.quizResults.length - 5} more results`);
      }
      
      // Subject breakdown
      const subjectStats = {};
      data.quizResults.forEach(result => {
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
    console.error('❌ Error fetching user data:', error.message);
    console.log('💡 Make sure the server is running on port 3001');
  }
}

fetchUserData(); 