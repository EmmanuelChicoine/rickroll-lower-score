const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

async function run() {
  try {
    const currentScore = core.getInput('new_score');
    const previousScore = core.getInput('previous_score');
    
    var message;
    
    // Si le score a diminué, afficher le rickroll
    if (currentScore < previousScore) {
      const rickrollUrl = 'https://user-images.githubusercontent.com/37572049/90699500-0cc3ec00-e2a1-11ea-8d13-989526e86b0e.gif';
      console.log('\n========================================');
      console.log('⚠️  MUTATION SCORE DECREASED! ⚠️');
      console.log(`Previous: ${previousScore}% → Current: ${currentScore}%`);
      console.log('\n' + rickrollUrl);
      console.log('========================================\n');
      
      message = `![rickroll](${rickrollUrl})\n\n**Mutation score decreased!** ${previousScore}% → ${currentScore}%`;
    } 

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();