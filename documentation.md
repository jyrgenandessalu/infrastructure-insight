# Infrastructure Insight – Final Documentation

## ✅ Objectives
The goal of this project was to design, deploy, and document a distributed infrastructure that hosts a containerized web application with a separate frontend, backend, and load balancer. The system demonstrates inter-VM communication, containerization, security configurations, and automated backups.

---

## ✅ Scope
The setup includes five virtual machines (VMs):
| Role | Hostname | IP | Description |
|------|-----------|----|--------------|
| Load Balancer | lb-server | 192.168.56.10 | Routes HTTPS traffic between web1 and web2 |
| Web Server 1 | web1-server | 192.168.56.11 | Hosts frontend container |
| Web Server 2 | web2-server | 192.168.56.12 | Hosts frontend container |
| Application Server | app-server | 192.168.56.13 | Hosts backend container with /metrics API |
| Backup Server | backup-server | 192.168.56.14 | Automates full backups of /home and /etc |

---

## ✅ System Configuration Overview

### Load Balancer
- **Purpose:** Routes incoming client requests to both web servers
- **Software:** NGINX with HTTPS redirection and weighted round-robin load balancing
- **Config file:** `/etc/nginx/conf.d/load-balancer.conf`

```nginx
upstream frontend_servers {
    server 192.168.56.11:8080 weight=2;
    server 192.168.56.12:8080 weight=1;
}
server {
    listen 80;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/selfsigned.key;
    location / {
        proxy_pass http://frontend_servers;
    }
}
```

---

### Web Servers
- **Purpose:** Serve the frontend interface and fetch metrics from backend
- **Software:** Node.js + Express frontend running on port 8080
- **Configuration:** Connects to backend API at `http://192.168.56.13:5000/metrics`
- **Validation:**
```bash
curl http://192.168.56.11:8080
curl http://192.168.56.12:8080
```

---

### Application Server
- **Purpose:** Hosts backend Node.js API providing system metrics
- **Endpoint:** `/metrics` returning hostname, OS type, CPU, memory, uptime
- **Example:** `curl http://192.168.56.13:5000/metrics`

```json
{
  "hostname": "app-server",
  "platform": "linux",
  "osType": "Linux",
  "arch": "x64",
  "uptime_minutes": 30836.5,
  "total_memory_mb": 32701,
  "free_memory_mb": 10418,
  "cpu_count": 16,
  "cpu_model": "AMD Ryzen 7 1700X Eight-Core Processor"
}
```

---

### Backup Server
- **Purpose:** Automates daily backups of application and system data
- **Tool:** `rsync` over SSH with cron scheduling
- **Backup script:** `/usr/local/bin/backup-app-server.sh`
- Backups are verified by restoring deleted test data using rsync

```bash
rsync -a --delete --exclude='.cache/' --exclude='.ssh/' -e "ssh" devops@192.168.56.13:/home/devops/ /backups/home/app-server/
rsync -a --delete -e "ssh" devops@192.168.56.13:/etc/ /backups/etc/app-server/
```

- **Scheduled with:** `crontab -l`
- **Restore test:** `sudo rsync -a /backups/etc/app-server/ /tmp/restore-test/etc/`

---

## ✅ Containerization Setup

### Docker Verification
```bash
docker --version
systemctl status docker --no-pager
groups $USER
```

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000
CMD ["node", "server.js"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 8080
CMD ["node", "server.js"]
```

### Validation
```bash
docker images
docker ps
docker inspect <container_id>
```

---

## ✅ Firewall Configuration

| Host | Allowed Ports | Description |
|------|----------------|--------------|
| lb-server | 22, 80, 443 | Public entrypoint |
| web1-server | 22, 8080 (from 192.168.56.10) | Frontend access |
| web2-server | 22, 8080 (from 192.168.56.10) | Frontend access |
| app-server | 22, 5000 (from web1 and web2) | Backend access |
| backup-server | 22 | SSH only |

Example:
```bash
sudo ufw default deny incoming
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow from 192.168.56.10 to any port 8080 proto tcp
sudo ufw allow from 192.168.56.11 to any port 5000 proto tcp
sudo ufw allow from 192.168.56.12 to any port 5000 proto tcp
sudo ufw enable
sudo ufw status verbose
```

---

## ✅ Connectivity Validation

```bash
ping 192.168.56.10 -c 2
ping 192.168.56.11 -c 2
ping 192.168.56.12 -c 2
ping 192.168.56.13 -c 2

nc -vz 192.168.56.11 8080
nc -vz 192.168.56.12 8080
nc -vz 192.168.56.13 5000

traceroute 192.168.56.13
```

---

## ✅ Application Demonstration

- **Frontend URL:** `http://192.168.56.11:8080` or `http://192.168.56.12:8080`
- **Load Balancer URL:** `https://192.168.56.10`
- **Metrics API:** `http://192.168.56.13:5000/metrics`
- **Displayed Metrics:**
  - Hostname
  - OS Type
  - Platform
  - Architecture
  - Memory usage
  - CPU model & count
  - System uptime

---

## ✅ Extra Enhancements

### 1. Weighted Load Balancing & HTTPS
- Prioritized traffic distribution (2:1 ratio for web1:web2)
- Redirects all HTTP to HTTPS using self-signed certificates

### 2. Backup Automation
- Scheduled daily rsync backups of `/home` and `/etc`
- Restore verified through test recovery

### 3. Improved UI/UX
- Modern, responsive metrics dashboard with auto-refresh
- Displays real-time server statistics in card layout

---

## ✅ Verification Commands Summary

```bash
# Check containers
docker ps

# Access container shell
docker exec -it <container_id> sh

# Test load balancing
curl -I http://192.168.56.10

# Test backend API
curl http://192.168.56.13:5000/metrics

# Verify backups
ls /backups/home/app-server
sudo tail -n 50 /var/log/app-server-backup.log

# Check firewall
sudo ufw status verbose
```

---

**Project Completed Successfully – All mandatory and extra requirements met.**
