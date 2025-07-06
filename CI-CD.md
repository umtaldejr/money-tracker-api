# CI/CD Pipeline Documentation

This document describes the comprehensive CI/CD pipeline implemented for the Money Tracker API project using GitHub Actions.

## 🚀 Overview

The CI/CD pipeline consists of multiple workflows that handle:

- **Continuous Integration**: Automated testing, linting, and security scanning
- **Docker Management**: Building and pushing container images
- **Deployment**: Automated deployments to staging and production
- **Security**: Vulnerability scanning and compliance checks
- **Dependency Management**: Automated dependency updates
- **Release Management**: Semantic versioning and automated releases

## 📋 Workflows

### 1. Continuous Integration (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**
- **Code Quality & Linting**: ESLint checks and code formatting
- **Test Suite**: Multi-version Node.js testing (18, 20, 21)
- **Security Audit**: NPM audit and vulnerability scanning
- **Docker Build Test**: Build and test Docker images
- **Integration Tests**: Test with PostgreSQL and Redis services
- **Performance Tests**: Basic load testing for PRs
- **Deployment Readiness**: Check if ready for deployment

**Features:**
- Parallel job execution for faster builds
- Multi-platform Docker builds
- Code coverage reporting
- Performance benchmarking

### 2. Docker Build & Push (`docker.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Tags matching `v*` pattern
- Pull requests to `main`

**Jobs:**
- **Build Images**: Multi-platform Docker builds (amd64, arm64)
- **Security Scan**: Trivy vulnerability scanning
- **Image Testing**: Test container startup and health checks
- **Multi-Registry Push**: Push to multiple registries
- **Release Notes**: Generate automated release notes

**Features:**
- Multi-stage builds (development and production)
- Security scanning integration
- Multi-registry support (GitHub Container Registry, Docker Hub)
- Automated release notes generation

### 3. Deployment (`deploy.yml`)

**Triggers:**
- Repository dispatch events
- Manual workflow dispatch

**Jobs:**
- **Staging Deployment**: Automated deployment to staging
- **Production Deployment**: Manual approval required
- **Smoke Tests**: Post-deployment validation
- **Rollback**: Automatic rollback on failure

**Features:**
- Zero-downtime deployments
- Environment-specific configurations
- Automated rollback capabilities
- Slack notifications

### 4. Security Scanning (`security.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests
- Daily scheduled runs (2 AM UTC)
- Manual trigger

**Jobs:**
- **Dependency Scan**: NPM audit and vulnerability checks
- **CodeQL Analysis**: GitHub's semantic code analysis
- **SAST Scan**: Static application security testing with Semgrep
- **Secret Scan**: Detect exposed secrets with TruffleHog
- **Container Scan**: Docker image vulnerability scanning
- **License Compliance**: Check for license violations
- **Infrastructure Scan**: Dockerfile and docker-compose security
- **Security Policy**: Verify security best practices

**Features:**
- Comprehensive security coverage
- SARIF report integration
- Automated security reporting
- Security team notifications

### 5. Dependency Management (`dependency-update.yml`)

**Triggers:**
- Weekly scheduled runs (Monday 9 AM UTC)
- Manual workflow dispatch

**Jobs:**
- **Check Outdated**: Identify outdated dependencies
- **Security Updates**: Auto-apply security patches
- **Minor Updates**: Update minor and patch versions
- **Major Updates**: Report available major updates
- **Auto-merge**: Automatically merge safe updates

**Features:**
- Automated security patching
- Smart update categorization
- Comprehensive dependency reporting
- Auto-merge capabilities for safe updates

### 6. Release Management (`release.yml`)

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Jobs:**
- **Analyze Commits**: Semantic version analysis
- **Create Release**: Generate releases with changelogs
- **Build Images**: Tagged Docker images
- **Publish NPM**: Publish to npm registry
- **Update Documentation**: Automated doc updates
- **Deploy Production**: Trigger production deployment
- **Notifications**: Team notifications
- **Rollback Preparation**: Create rollback instructions

**Features:**
- Semantic versioning based on conventional commits
- Automated changelog generation
- Multi-registry Docker publishing
- Production deployment automation
- Comprehensive release notifications

## 🔧 Setup & Configuration

### Repository Secrets

Configure the following secrets in your GitHub repository:

#### Deployment Secrets
```
# Staging Environment
STAGING_HOST=staging.yourdomain.com
STAGING_USER=deploy
STAGING_SSH_KEY=<private-key>
STAGING_PORT=22
STAGING_ALLOWED_ORIGINS=https://staging.yourdomain.com
STAGING_DB_NAME=money_tracker_staging
STAGING_DB_USER=postgres
STAGING_DB_PASSWORD=<password>
STAGING_REDIS_PASSWORD=<password>
STAGING_JWT_SECRET=<jwt-secret>

# Production Environment
PRODUCTION_HOST=api.yourdomain.com
PRODUCTION_USER=deploy
PRODUCTION_SSH_KEY=<private-key>
PRODUCTION_PORT=22
PRODUCTION_ALLOWED_ORIGINS=https://yourdomain.com
PRODUCTION_DB_NAME=money_tracker_production
PRODUCTION_DB_USER=postgres
PRODUCTION_DB_PASSWORD=<password>
PRODUCTION_REDIS_PASSWORD=<password>
PRODUCTION_JWT_SECRET=<jwt-secret>
```

#### Registry Secrets
```
# Docker Hub (optional)
DOCKER_USERNAME=<username>
DOCKER_PASSWORD=<password>

# NPM Publishing (optional)
NPM_TOKEN=<npm-token>
```

#### Integration Secrets
```
# Slack Notifications
SLACK_WEBHOOK_URL=<webhook-url>
SECURITY_SLACK_WEBHOOK_URL=<security-webhook-url>

# Monitoring
MONITORING_WEBHOOK_URL=<monitoring-webhook>

# Security Tools
SEMGREP_APP_TOKEN=<semgrep-token>
```

### Environment Setup

#### 1. GitHub Environments

Create the following environments in your repository:

**Staging Environment:**
- Name: `staging`
- URL: `https://staging-api.yourdomain.com`
- No approval required

**Production Environment:**
- Name: `production`
- URL: `https://api.yourdomain.com`
- Require approval from team leads
- Restrict to `main` branch

#### 2. Branch Protection Rules

Configure branch protection for `main`:
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes to administrators

#### 3. Server Setup

**Staging Server:**
```bash
# Install Docker and Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose

# Create deployment directory
sudo mkdir -p /opt/money-tracker-api
sudo chown $USER:$USER /opt/money-tracker-api

# Setup SSH key for GitHub Actions
# Add the public key to ~/.ssh/authorized_keys
```

**Production Server:**
```bash
# Same as staging, plus:
# - Configure firewall rules
# - Set up SSL certificates
# - Configure monitoring
# - Set up backup procedures
```

## 📊 Monitoring & Observability

### Workflow Monitoring

Monitor your CI/CD pipeline health:

1. **GitHub Actions Tab**: View workflow runs and logs
2. **Status Badges**: Add badges to your README
3. **Slack Notifications**: Receive alerts for failures
4. **Email Notifications**: GitHub notifications for critical failures

### Metrics & Dashboards

Track important metrics:

- **Build Success Rate**: Percentage of successful builds
- **Deployment Frequency**: How often deployments occur
- **Lead Time**: Time from commit to production
- **Recovery Time**: Time to recover from failures
- **Security Scan Results**: Number of vulnerabilities found

### Alerting

Set up alerts for:
- Build failures on `main` branch
- Security vulnerabilities
- Deployment failures
- Performance degradation
- Dependency vulnerabilities

## 🔄 Usage Guide

### Making Changes

1. **Create Feature Branch:**
   ```bash
   git checkout -b feature/new-feature
   # Make your changes
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

2. **Create Pull Request:**
   - CI workflow runs automatically
   - Security scans execute
   - Code review required
   - Status checks must pass

3. **Merge to Main:**
   - CI workflow runs again
   - Docker images built and pushed
   - Staging deployment triggered
   - Release analysis performed

### Deployments

#### Manual Staging Deployment
```bash
# Trigger via GitHub CLI
gh workflow run deploy.yml -f environment=staging -f version=latest
```

#### Manual Production Deployment
```bash
# Trigger via GitHub CLI
gh workflow run deploy.yml -f environment=production -f version=v1.2.3
```

#### Rollback
```bash
# Find previous version
gh release list

# Deploy previous version
gh workflow run deploy.yml -f environment=production -f version=v1.2.2
```

### Releases

#### Automatic Releases
Releases are triggered automatically based on conventional commits:

- `feat:` → Minor version bump
- `fix:` → Patch version bump
- `feat!:` or `fix!:` → Major version bump

#### Manual Releases
```bash
# Trigger manual release
gh workflow run release.yml -f release_type=minor

# Create prerelease
gh workflow run release.yml -f release_type=prerelease -f prerelease_id=beta
```

### Security Management

#### Viewing Security Reports
1. Go to **Security** tab in GitHub
2. View **Security advisories**
3. Check **Code scanning** results
4. Review **Dependabot alerts**

#### Handling Security Issues
1. Review the alert details
2. Update dependencies if needed
3. Test the changes
4. Deploy the fix

### Dependency Updates

#### Automated Updates
- Security updates are applied automatically
- Minor updates are proposed via PR
- Major updates require manual review

#### Manual Updates
```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all packages
npm update
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Build Failures
- Check the logs in GitHub Actions
- Verify all dependencies are installed
- Ensure tests are passing locally

#### 2. Deployment Failures
- Check server connectivity
- Verify secrets are configured
- Check deployment logs

#### 3. Security Scan Failures
- Review the security findings
- Update vulnerable dependencies
- Check for exposed secrets

#### 4. Docker Build Issues
- Verify Dockerfile syntax
- Check base image availability
- Ensure all files are included

### Debug Commands

```bash
# Local testing
npm test
npm run lint
npm audit

# Docker testing
docker build -t money-tracker-api .
docker run -p 3000:3000 money-tracker-api

# Security testing
npm audit --audit-level high
```

## 📚 Best Practices

### Commit Messages
Use conventional commits:
```
feat: add user authentication
fix: resolve memory leak in parser
docs: update API documentation
style: fix code formatting
refactor: simplify user service
test: add unit tests for auth
chore: update dependencies
```

### Security
- Keep secrets in GitHub secrets
- Use least privilege principles
- Regularly update dependencies
- Monitor security advisories
- Use environment-specific configurations

### Testing
- Write comprehensive tests
- Use integration tests
- Test Docker containers
- Validate deployments
- Monitor application health

### Documentation
- Keep documentation up to date
- Document breaking changes
- Provide clear setup instructions
- Include troubleshooting guides
- Use clear commit messages

## 🔗 Resources

### GitHub Actions Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Marketplace](https://github.com/marketplace?type=actions)

### Security Resources
- [GitHub Security](https://github.com/security)
- [Dependabot](https://docs.github.com/en/code-security/dependabot)
- [CodeQL](https://codeql.github.com/)

### Docker Resources
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Multi-stage Builds](https://docs.docker.com/develop/dev-best-practices/)

### Node.js Resources
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [NPM Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)

## 🤝 Contributing

When contributing to this project:

1. Follow the conventional commit format
2. Ensure all tests pass
3. Add tests for new features
4. Update documentation
5. Review security implications
6. Test deployment locally

## 📞 Support

For issues with the CI/CD pipeline:

1. Check the workflow logs
2. Review this documentation
3. Search existing issues
4. Create a new issue with details
5. Contact the DevOps team

---

**Note**: This CI/CD pipeline is designed to be production-ready but may need customization based on your specific requirements and infrastructure setup. 