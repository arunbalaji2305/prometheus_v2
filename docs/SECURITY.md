# Security Policy

## Overview

This document outlines the security measures, best practices, and vulnerability reporting procedures for the Natural Language to PromQL project.

## Security Features Implemented

### 1. Backend Security

#### HTTP Security Headers (Helmet)
- **Content Security Policy (CSP)**: Prevents XSS attacks
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Additional XSS protection

#### CORS (Cross-Origin Resource Sharing)
- Configurable allowed origins
- Credentials support
- Preflight request handling

#### Rate Limiting
- **Default**: 100 requests per 15 minutes per IP
- **Development**: 200 requests per 15 minutes
- Prevents brute force and DoS attacks
- Returns 429 status when exceeded

#### Input Validation
- **Zod schemas** validate all request payloads
- Field length limits (3-500 characters for queries)
- Type checking (strings, numbers, enums)
- Sanitization of special characters

#### Secret Management
- **Redaction**: API keys never logged
- **Environment variables**: Secrets stored in .env files
- **Validation**: Required secrets checked on startup

#### Timeout Protection
- **10-second timeout** for external API calls (Gemini, Prometheus)
- Prevents hanging requests
- Proper error handling for timeouts

### 2. Frontend Security

#### Environment Variable Isolation
- Build-time variable injection (VITE_*)
- No secrets exposed to client-side code

#### XSS Prevention
- React's automatic escaping
- No `dangerouslySetInnerHTML` usage
- Content Security Policy enforcement

#### API Communication
- All requests go through backend proxy
- No direct client access to Gemini or Prometheus

### 3. Network Security

#### Docker Network Isolation
- Services communicate on internal network
- Only necessary ports exposed to host
- No direct external access to Prometheus or backend containers

## Threat Model

### Identified Threats

| Threat | Risk Level | Mitigation |
|--------|-----------|------------|
| API Key Exposure | **HIGH** | Environment variables, log redaction |
| Injection Attacks (XSS, SQLi) | **MEDIUM** | Input validation, sanitization, CSP |
| DoS/DDoS | **MEDIUM** | Rate limiting, timeouts |
| CORS Attacks | **LOW** | Strict origin policy |
| MITM (Man-in-the-Middle) | **HIGH** | Recommend HTTPS in production |
| Unauthorized Access | **MEDIUM** | Add authentication (not implemented) |

### Not Currently Addressed

⚠️ **Authentication**: No user authentication implemented. Suitable for internal/demo use only.

⚠️ **Authorization**: No role-based access control.

⚠️ **HTTPS**: Application uses HTTP. **Must** add HTTPS for production (see recommendations below).

⚠️ **Audit Logging**: Logs exist but not centralized or monitored.

## Security Best Practices

### For Developers

1. **Never commit secrets**
   - Use `.env` files (git-ignored)
   - Use `.env.example` with placeholder values
   - Rotate API keys regularly

2. **Validate all inputs**
   - Use Zod schemas for backend validation
   - Sanitize user input before processing
   - Never trust client-side data

3. **Keep dependencies updated**
   ```bash
   # Check for vulnerabilities
   npm audit
   
   # Fix automatically
   npm audit fix
   ```

4. **Review security headers**
   - Test with https://securityheaders.com/
   - Adjust CSP as needed

5. **Sanitize logs**
   - Never log sensitive data (API keys, passwords)
   - Use pino's `redact` feature

### For Deployers

#### Production Deployment Checklist

- [ ] **Enable HTTPS**
  - Use reverse proxy (nginx, Caddy) with SSL
  - Obtain certificates (Let's Encrypt)
  - Redirect HTTP → HTTPS

- [ ] **Change default passwords**
  - Grafana: Change from admin/admin
  - Add authentication to Prometheus (if exposed)

- [ ] **Restrict CORS origins**
  - Set `CORS_ORIGIN` to specific domains
  - Remove wildcard (`*`) if present

- [ ] **Use secrets management**
  - Docker secrets, Kubernetes secrets, HashiCorp Vault
  - Avoid plain text .env files in production

- [ ] **Enable firewall rules**
  - Only expose ports 80, 443 publicly
  - Restrict backend, Prometheus to internal network

- [ ] **Monitor logs**
  - Centralized logging (ELK, Splunk, Datadog)
  - Set up alerts for errors, rate limit hits

- [ ] **Regular updates**
  - Schedule dependency updates (monthly)
  - Subscribe to security advisories

- [ ] **Backup data**
  - Prometheus data volumes
  - Grafana dashboards

#### Reverse Proxy Setup (nginx example)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Known Vulnerabilities

### None Currently Reported

Last security audit: 2024-11-09

## Reporting a Vulnerability

### How to Report

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email: security@your-domain.com
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 7 days
- **Fix timeline**: Depends on severity
  - Critical: Immediate hotfix
  - High: Within 14 days
  - Medium: Next minor release
  - Low: Next major release

### Disclosure Policy

- We follow responsible disclosure
- Fix deployed before public announcement
- Credit given to reporter (unless requested otherwise)

## Security Update History

### Version 1.0.0 (2024-11-09)

Initial release with:
- Helmet security headers
- CORS protection
- Rate limiting
- Input validation and sanitization
- Secret redaction in logs
- Request timeouts

## Dependencies Security

### Automated Scanning

We use:
- **npm audit**: Checks for known vulnerabilities
- **Dependabot** (GitHub): Automated dependency updates
- **Snyk** (optional): Continuous monitoring

### Manual Review

Critical dependencies reviewed:
- `express`: ^4.21.1 (no known vulnerabilities)
- `@google/generative-ai`: ^0.21.0 (official Google SDK)
- `react`: ^18.3.1 (no known vulnerabilities)

Run security checks:

```bash
# Backend
cd backend
npm audit

# Frontend
cd frontend
npm audit

# Fix vulnerabilities
npm audit fix

# Force fixes (may break compatibility)
npm audit fix --force
```

## Compliance

### GDPR Considerations

This application:
- ✅ Does **NOT** collect personal data
- ✅ Does **NOT** use cookies
- ✅ Logs contain only technical data (no PII)
- ⚠️ Gemini API sends queries to Google (review Google's privacy policy)

If you add user authentication:
- Implement data protection by design
- Add privacy policy
- Provide data export/deletion mechanisms
- Log consent for data processing

### OWASP Top 10 (2021)

| Risk | Status | Mitigation |
|------|--------|------------|
| A01: Broken Access Control | ⚠️ Partial | No auth implemented; add for production |
| A02: Cryptographic Failures | ✅ Addressed | Secrets in env vars, HTTPS recommended |
| A03: Injection | ✅ Addressed | Input validation, sanitization |
| A04: Insecure Design | ✅ Addressed | Defense in depth, fail securely |
| A05: Security Misconfiguration | ⚠️ Partial | Review CSP, CORS for your deployment |
| A06: Vulnerable Components | ✅ Monitored | npm audit, Dependabot |
| A07: Identification & Authentication | ❌ Not Implemented | Add for production |
| A08: Software & Data Integrity | ✅ Addressed | Validated inputs, no eval() |
| A09: Security Logging & Monitoring | ⚠️ Partial | Logs exist; add centralized monitoring |
| A10: Server-Side Request Forgery | ✅ Addressed | Limited external requests, validated URLs |

## Security Recommendations by Environment

### Development
- ✅ Use `.env.example` templates
- ✅ Never commit `.env` files
- ✅ Use relaxed CORS for localhost
- ⚠️ Rate limiting can be generous

### Staging
- ✅ Match production config
- ✅ Test with SSL certificates
- ✅ Use separate API keys
- ✅ Enable full logging

### Production
- ✅ HTTPS only
- ✅ Strict CORS
- ✅ Aggressive rate limiting
- ✅ Secrets management (not plain .env)
- ✅ Monitoring and alerting
- ✅ Regular backups
- ✅ Add authentication
- ✅ WAF (Web Application Firewall) optional

## Security Testing

### Manual Testing

1. **Test rate limiting**:
   ```bash
   for i in {1..101}; do curl http://localhost:4000/api/health; done
   # Should return 429 after 100 requests
   ```

2. **Test input validation**:
   ```bash
   # Empty query
   curl -X POST http://localhost:4000/api/nl2promql \
     -H "Content-Type: application/json" \
     -d '{"query": ""}'
   # Should return 400
   
   # Very long query
   curl -X POST http://localhost:4000/api/nl2promql \
     -H "Content-Type: application/json" \
     -d "{\"query\": \"$(printf 'A%.0s' {1..501})\"}"
   # Should return 400
   ```

3. **Test CORS**:
   ```bash
   curl -H "Origin: http://evil.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://localhost:4000/api/nl2promql
   # Should not allow unauthorized origin
   ```

### Automated Testing (Future)

Consider adding:
- **ZAP (OWASP Zed Attack Proxy)**: Dynamic security testing
- **Bandit** (Python) / **eslint-plugin-security** (JS): Static analysis
- **Trivy**: Container image scanning

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Security Best Practices](https://react.dev/learn/thinking-in-react#step-5-add-inverse-data-flow)
- [Helmet.js Documentation](https://helmetjs.github.io/)

## Contact

Security Team: security@your-domain.com

For non-security issues, use GitHub Issues.

---

**Last Updated**: 2024-11-09

**Version**: 1.0.0

