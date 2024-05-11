pipeline {
    agent any
    stages{
        stage('Clone App'){
            steps{
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: 'github-credentials', url: 'git@github.com:Benuka-Punchihewa/herbal-app-auth-service.git']]])
            }
        }

        stage('Build auth service docker images'){
            agent { label 'copper' }
            steps{
                script{
                    dockerImage = docker.build("benukapunchihewa/auth-service:latest")
                }
            }
        }
        stage('Push auth service image to Hub'){
            agent { label 'copper' }
            steps{
                script{
                   withDockerRegistry([ credentialsId: "dockerHub", url: "" ]) {
                    dockerImage.push()
                    }
                }
            }
        }
        stage('Deploy auth service to k8s') {
            agent { label 'zink' }
            steps {
                script {
                    withKubeConfig([credentialsId: 'google-cloud-service-account', serverUrl: 'https://104.196.35.11']) {
                        dir('kubernetes_config') {
                            sh 'kubectl apply -f auth-config.yaml'
                            sh 'kubectl apply -f auth.yaml'
                        }
                    }
                }
            }
        }
    }
}