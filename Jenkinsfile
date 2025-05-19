pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                // Check out code from GitHub repository
                checkout scm
            }
        }
        
        stage('Build and Deploy') {
            steps {
                // Use Docker Pipeline plugin to interact with Docker
                script {
                    // Stop any existing containers from previous builds
                    sh 'docker-compose -p pixelvault-jenkins -f docker-compose.jenkins.yml down || true'
                    
                    // Build and start the containers with a unique project name
                    sh 'docker-compose -p pixelvault-jenkins -f docker-compose.jenkins.yml up -d --build'
                    
                    // Display running containers
                    sh 'docker ps'
                }
            }
        }
    }
    
    post {
        always {
            // Clean up workspace
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
