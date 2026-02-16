# 🗺️ Project Roadmap: Infrastructure Insight  

## 1. Preparation  
- Ensure all 4 existing servers are up:  
  - Load Balancer → `192.168.56.10`  
  - Web1 → `192.168.56.11`  
  - Web2 → `192.168.56.12`  
  - App Server → `192.168.56.13`  
- Create **Backup VM** (new) → `192.168.56.14` (2 CPU, 4GB RAM)  
- Update and patch all servers (`sudo apt update && sudo apt upgrade -y`)  

---

## 2. Containerization Setup  
- Install Docker (or Podman) on all servers.  
- Verify installation: `docker --version`.  
- Add `devops` user to `docker` group.  
- Configure UFW rules:  
  - lb-server: allow HTTP/HTTPS + SSH  
  - web1 & web2: allow internal communication from LB and app server  
  - app-server: allow internal communication from web servers  
  - backup-server: allow SSH only  

---

## 3. Application Development  
- **Backend (on app-server)**:  
  - Simple API (Flask, Node.js, or similar)  
  - `/metrics` endpoint shows:  
    - Hostname  
    - OS type  
    - Web server responding  
    - CPU & memory usage  
    - Extra metrics if useful  
- **Frontend (on web servers)**:  
  - Fetch data from backend API  
  - Show metrics in UI  
  - Make it modular + responsive  

---

## 4. Containerization of App  
- Create Dockerfiles:  
  - `Dockerfile.backend` → app-server  
  - `Dockerfile.frontend` → web servers  
- Build and push images (local registry or Docker Hub).  
- Verify with `docker run -p <port>` locally before deployment.  

---

## 5. Deployment  
- **Backend container** → app-server.  
- **Frontend containers** → web1 + web2.  
- **Load Balancer** → configure (NGINX/HAProxy):  
  - Distribute traffic between web1 and web2.  
  - Implement Round Robin (default).  
- Verify:  
  - Access via `http://192.168.56.10` shows frontend pulling metrics from backend.  
  - Refreshing alternates between web1 + web2.  

---

## 6. Backup VM Setup  
- Create backup scripts for:  
  - `/home/devops`  
  - `/etc`  
  - Application data (volumes/logs/configs).  
- Automate with `cron`:  
  - Weekly full backups  
  - Test restore process  

---

## 7. Extra Features (Optional)  
- Improve frontend UI/UX:  
  - Responsive layout, animations, visual consistency.  
- Load balancing algorithms:  
  - Weighted round robin, least connections, or resource-based.  
- Bonus ideas:  
  - System monitoring integration (Prometheus, Netdata).  
  - Feature flags for optional functionality.  

---

## 8. Validation & Testing  
- Show containerization works (`docker ps`, `docker images`).  
- Verify frontend → backend communication.  
- Access app via LB and confirm metrics are correct.  
- Check firewall rules (`sudo ufw status verbose`).  
- Ping between all servers.  
- Backup jobs exist (`crontab -l`).  
- Restore test from backup.  
- Refresh LB several times → responses alternate between web1 + web2.  
