const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

async function run() {
  try {
    const mutationReportPath = core.getInput('mutation_report_path') || 'target/pit-reports/mutations.xml';
    const previousScorePath = core.getInput('previous_score_path') || '.mutation-score';
    
    let currentScore = null;
    let previousScore = null;
    
    // Lire le score actuel depuis le rapport de mutation (si disponible)
    if (fs.existsSync(mutationReportPath)) {
      const reportContent = fs.readFileSync(mutationReportPath, 'utf8');
      // Extraire le score de mutation (adapter selon le format de votre rapport)
      const scoreMatch = reportContent.match(/mutation[Cc]overage[">:\s]+(\d+)/);
      if (scoreMatch) {
        currentScore = parseInt(scoreMatch[1]);
      }
    }
    
    // Lire le score précédent
    if (fs.existsSync(previousScorePath)) {
      previousScore = parseInt(fs.readFileSync(previousScorePath, 'utf8').trim());
    }
    
    var message;
    
    // Si le score a diminué, afficher le rickroll
    if (currentScore !== null && previousScore !== null && currentScore < previousScore) {
      const rickrollUrl = 'https://user-images.githubusercontent.com/37572049/90699500-0cc3ec00-e2a1-11ea-8d13-989526e86b0e.gif';
      console.log('\n========================================');
      console.log('⚠️  MUTATION SCORE DECREASED! ⚠️');
      console.log(`Previous: ${previousScore}% → Current: ${currentScore}%`);
      console.log('\n' + rickrollUrl);
      console.log('========================================\n');
      
      message = `![rickroll](${rickrollUrl})\n\n**Mutation score decreased!** ${previousScore}% → ${currentScore}%`;
    } else {
      console.log('Mutation score check passed.');
      message = core.getInput('message');
      if(message == ''){
        // Sauvegarder le score actuel pour la prochaine fois
        if (currentScore !== null) {
          fs.writeFileSync(previousScorePath, currentScore.toString());
        }
        return;
      }
    }
    
    // Sauvegarder le score actuel
    if (currentScore !== null) {
      fs.writeFileSync(previousScorePath, currentScore.toString());
    }

    const github_token = core.getInput('GITHUB_TOKEN');
    const context = github.context;
    
    if (context.payload.issue == null && context.payload.pull_request == null) {
      console.log('No issue or PR found, skipping comment.');
      return;
    }
    
    const issue_number = context.payload.issue?.number || context.payload.pull_request?.number;
    const octokit = new github.getOctokit(github_token);
    
    await octokit.issues.createComment({
      ...context.repo,
      issue_number: issue_number,
      body: message
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();