node {
  withEnv(["PATH=${tool 'node'}/bin:${env.PATH}"]) {
    sh 'npm install'
    sh 'npm run build'
    archiveArtifacts artifacts: 'dist/*'
  }
}
