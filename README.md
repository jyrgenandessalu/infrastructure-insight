# Infrastructure Insight

A containerized diagnostic web application designed to visualize infrastructure metrics across distributed servers.  
The project demonstrates a full-stack deployment including a load balancer, web servers, application server, and backup automation.

---

## 🚀 Project Overview

**Goal:**  
To develop and deploy a containerized multi-tier infrastructure where a frontend and backend application communicate securely through a load balancer.

**Architecture:**
- **Load Balancer (lb-server):** Routes HTTPS traffic between web1 and web2 using NGINX.
- **Web Servers (web1, web2):** Host the frontend container displaying metrics.
- **Application Server (app-server):** Runs the backend `/metrics` API (Node.js).
- **Backup Server:** Automates daily and weekly backups for configuration and app data.

---

## 🧩 Application Features

### Frontend
- Responsive metrics dashboard built with HTML, CSS, and vanilla JS.
- Auto-refresh every 10 seconds.
- Displays real-time server data: hostname, OS, CPU, memory, uptime.

### Backend
- Node.js + Express API exposing `/metrics`.
- Provides live infrastructure information via JSON.
- Ready for containerization with a lightweight Docker image.

Example API Response:
```json
{
  "hostname": "app-server",
  "osType": "Linux",
  "cpu_model": "AMD Ryzen 7",
  "cpu_count": 8,
  "total_memory_mb": 16384,
  "free_memory_mb": 9341,
  "uptime_minutes": 42750.4
}
```

---

## 🐳 Containerization

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

### Commands
```bash
# Build and run containers
docker build -t infra-backend .
docker run -d -p 5000:5000 infra-backend

docker build -t infra-frontend .
docker run -d -p 8080:8080 infra-frontend

# Check running containers
docker ps
```

---

## ⚙️ Infrastructure Setup

### Firewall Rules
| Host | Allowed Ports | Purpose |
|------|----------------|----------|
| lb-server | 22, 80, 443 | Public access |
| web1, web2 | 22, 8080 | Frontend |
| app-server | 22, 5000 | Backend |
| backup-server | 22 | SSH only |

Check status:
```bash
sudo ufw status verbose
```

### Load Balancer (NGINX)
```nginx
upstream frontend_servers {
    server 192.168.56.11:8080 weight=2;
    server 192.168.56.12:8080 weight=1;
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

## 🔁 Backup Automation

**Tool:** `rsync` over SSH  
**Cron schedule:** Daily and weekly backups

```bash
rsync -a --delete /home/devops/ /backups/home/
rsync -a --delete /etc/ /backups/etc/
```

Verify backups:
```bash
ls /backups/home/
crontab -l
```

---

## ✅ Verification Commands

```bash
# Connectivity
ping <server_ip>
curl <load_balancer_ip>

# Test backend API
curl http://192.168.56.13:5000/metrics

# Check containers
docker ps

# Verify backups
ls /backups/home/app-server/
```

---

## 🌟 Extra Features
- Weighted HTTPS load balancing
- Responsive UI for metrics visualization
- Automated backups for `/home` and `/etc`

---

## 📦 Repository Structure
```
infrastructure-insight/
├── backend/
│   ├── server.js
│   ├── Dockerfile
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── scripts.js
│   ├── Dockerfile
├── docs.md
├── README.md
```

---

## 💬 Summary

Infrastructure Insight demonstrates how to design, containerize, secure, and automate a distributed system.  
All mandatory and extra requirements are fulfilled — including HTTPS, weighted load balancing, and backup automation.

---

© 2025 Infrastructure Insight – Created by Merly Käblik
