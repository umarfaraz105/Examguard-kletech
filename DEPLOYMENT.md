# ExamGuard Deployment Guide

Complete guide for deploying the ExamGuard examination management system.

## System Requirements

### Production Environment

- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **Memory**: 8GB RAM minimum, 16GB recommended
- **Storage**: 50GB minimum, SSD recommended
- **CPU**: 4 cores minimum, 8 cores recommended
- **Network**: Stable internet connection for external dependencies

### Software Dependencies

- **Docker**: 24.0+ and Docker Compose v2
- **PostgreSQL**: 15+ (if not using Docker)
- **Node.js**: 18+ (for local frontend development)
- **Python**: 3.11+ (for local backend development)

## Quick Start (Docker Compose)

The fastest way to deploy ExamGuard is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd examguard

# Copy environment configuration
cp backend/.env.example backend/.env

# Edit configuration
nano backend/.env

# Start all services
docker-compose up -d

# Initialize database
docker-compose exec backend python -m app.utils.init_db

# Check service status
docker-compose ps
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Environment Configuration

### Backend Environment (.env)

```bash
# Database
DATABASE_URL=postgresql://examguard:password123@db:5432/examguard

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
APP_NAME=ExamGuard
APP_VERSION=1.0.0
ENVIRONMENT=production

# CORS (adjust for your frontend domain)
ALLOWED_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]

# Email (optional - for notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend Environment (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=ExamGuard
```

## Manual Deployment

If you prefer to deploy without Docker:

### 1. Database Setup (PostgreSQL)

```sql
-- Create database and user
CREATE DATABASE examguard;
CREATE USER examguard WITH ENCRYPTED PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE examguard TO examguard;
```

### 2. Backend Deployment

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Initialize database with default data
python -m app.utils.init_db

# Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3. Frontend Deployment

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

## Production Deployment

### Using NGINX as Reverse Proxy

```nginx
# /etc/nginx/sites-available/examguard
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Documentation
    location /docs {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/examguard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
sudo certbot renew --dry-run
```

### Process Management with Systemd

#### Backend Service

```ini
# /etc/systemd/system/examguard-backend.service
[Unit]
Description=ExamGuard Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/examguard/backend
Environment=PATH=/opt/examguard/backend/venv/bin
ExecStart=/opt/examguard/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Frontend Service

```ini
# /etc/systemd/system/examguard-frontend.service
[Unit]
Description=ExamGuard Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/examguard/frontend
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start services:
```bash
sudo systemctl enable examguard-backend examguard-frontend
sudo systemctl start examguard-backend examguard-frontend
sudo systemctl status examguard-backend examguard-frontend
```

## Database Management

### Backup

```bash
# Create backup
docker-compose exec db pg_dump -U examguard examguard > backup.sql

# Or without Docker
pg_dump -h localhost -U examguard examguard > backup.sql
```

### Restore

```bash
# Restore backup
docker-compose exec -T db psql -U examguard examguard < backup.sql

# Or without Docker
psql -h localhost -U examguard examguard < backup.sql
```

### Migrations

```bash
# Create new migration
cd backend
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Monitoring and Logging

### Application Logs

```bash
# Docker Compose logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Systemd logs
sudo journalctl -u examguard-backend -f
sudo journalctl -u examguard-frontend -f
```

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Frontend health
curl http://localhost:3000/api/health
```

### Database Monitoring

```bash
# Connection count
docker-compose exec db psql -U examguard -c "SELECT count(*) FROM pg_stat_activity;"

# Database size
docker-compose exec db psql -U examguard -c "SELECT pg_database_size('examguard');"
```

## Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use strong, unique passwords
- Rotate secrets regularly

### 2. Database Security

```sql
-- Create read-only user for reports
CREATE USER examguard_readonly WITH ENCRYPTED PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE examguard TO examguard_readonly;
GRANT USAGE ON SCHEMA public TO examguard_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO examguard_readonly;
```

### 3. Firewall Configuration

```bash
# UFW rules
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 4. Regular Updates

```bash
# Update Docker images
docker-compose pull
docker-compose up -d

# Update system packages
sudo apt update && sudo apt upgrade
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_scheduled_exam_plan_id ON scheduled_exams(plan_id);
CREATE INDEX idx_seat_assignment_exam_id ON seat_assignments(scheduled_exam_id);
CREATE INDEX idx_invigilator_assignment_exam_id ON invigilator_assignments(scheduled_exam_id);
```

### 2. Frontend Optimization

```bash
# Build with optimizations
cd frontend
npm run build

# Enable GZIP in NGINX
gzip on;
gzip_types text/plain application/json application/javascript text/css;
```

### 3. Caching

```nginx
# Static assets caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

```bash
# Check database status
docker-compose exec db pg_isready -U examguard

# Check connection from backend
docker-compose exec backend python -c "from app.core.database import engine; print(engine.execute('SELECT 1').scalar())"
```

#### 2. Frontend API Connection Issues

```bash
# Check CORS settings
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS http://localhost:8000/api/plans
```

#### 3. Permission Errors

```bash
# Fix file permissions
sudo chown -R www-data:www-data /opt/examguard
sudo chmod -R 755 /opt/examguard
```

#### 4. Memory Issues

```bash
# Check memory usage
docker stats

# Increase Docker memory limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Log Analysis

```bash
# Find errors in backend logs
docker-compose logs backend | grep ERROR

# Monitor API response times
docker-compose logs backend | grep "completed_in"

# Check for database deadlocks
docker-compose logs db | grep deadlock
```

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.override.yml
version: '3.8'
services:
  backend:
    deploy:
      replicas: 3
    depends_on:
      - db
      - redis

  frontend:
    deploy:
      replicas: 2

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
      - frontend
```

### Database Connection Pooling

```python
# backend/app/core/database.py
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True
)
```

## Backup and Recovery

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/examguard"
mkdir -p $BACKUP_DIR

# Database backup
docker-compose exec -T db pg_dump -U examguard examguard | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Application backup
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" -C /opt examguard --exclude="examguard/backend/__pycache__" --exclude="examguard/frontend/.next"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Cron Job Setup

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/scripts/backup.sh >> /var/log/examguard-backup.log 2>&1
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Review application logs, check disk space
2. **Monthly**: Update Docker images, review security patches
3. **Quarterly**: Full system backup test, performance review
4. **Yearly**: Security audit, dependency updates

### Monitoring Setup

```yaml
# monitoring/docker-compose.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

For additional support or deployment assistance, refer to the technical documentation or contact the development team.