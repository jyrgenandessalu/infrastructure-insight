# 🧾 Infrastructure Insight – Review & Testing Checklist

Use this file during your review or presentation.  
Each testing point includes:
- 
🖥️ **Show** → commands or files to demonstrate  
- 
💬 **Explain** → what to say to the reviewer  
- 
✅ **Verify** → what result confirms success  


---


## 1. Documentation Completeness

🖥️ **Show:**  
- `documentation.md` and `README.md`  


💬 **Explain:**  
The documentation clearly defines project objectives, scope, requirements, and procedures.  
It describes the five VMs (load balancer, web1, web2, app-server, backup-server).  


✅ **Verify:**  
Both documents include objectives, scope, and roles of each server.


---


## 2. Servers Prepared for Containerized Hosting

🖥️ **Show:**  
- Oracle VirtualBox → all VMs running (lb, web1, web2, app, backup)  


💬 **Explain:**  
Each Ubuntu VM is prepared for container hosting and networked in 192.168.56.x range.  
- **Load Balancer:** NGINX routing traffic between web servers  
- **Web Servers:** Host frontend containers  
- **App Server:** Hosts backend container  
- **Backup Server:** Performs automated rsync backups  


✅ **Verify:**  
All servers are powered on, reachable, and configured for their role.


---


## 3. Containerization Tools Installed

🖥️ **Show (on each VM):**


```
bash
docker --version
systemctl status docker --no-pager

```



💬 **Explain:**  
Docker is installed and enabled on all servers. The `devops` user is in the docker group for non-root container management.


✅ **Verify:**  
Docker returns a valid version and is `active (running)`.


---


## 4. Firewall Rules Configuration

🖥️ **Show (on each server):**


```
bash
sudo ufw status verbose
sudo ss -tulpn | grep -E "22|80|443|5000|8080|51820|19999"

```

🔐 **Summary Table:**
- lb-server	Load balancing, VPN, monitoring	22/tcp, 80/tcp, 443/tcp, 51820/udp, 19999/tcp	SSH admin, HTTP/HTTPS, - - -  
- WireGuard VPN, Netdata monitoring
- web1-server	Frontend hosting	22/tcp, 8080/tcp, 51820/udp, 19999/tcp	SSH, frontend container, VPN, Netdata
- web2-server	Frontend hosting	22/tcp, 8080/tcp, 51820/udp, 19999/tcp	SSH, frontend container, VPN, Netdata
- app-server	Backend API	22/tcp, 5000/tcp (from web1/web2 only)	SSH + API communication
- backup-server	Backups	22/tcp	SSH for rsync pulls/pushes

22/tcp – SSH (Secure Shell)
Used for remote administration and secure command access between servers.

🖥️ Demonstrate:

sudo ss -tuln | grep :22



✅ Output should show sshd → proves SSH is running.
To test connection from another VM:

ssh devops@192.168.56.10


80/tcp & 443/tcp – NGINX Web Traffic (HTTP/HTTPS)
Used by NGINX to serve web requests and route traffic to frontend servers.

🖥️ Demonstrate:

sudo ss -tuln | grep -E ":80|:443"
curl -I http://localhost
curl -I https://localhost -k



✅ Returns HTTP headers (200 OK) confirming NGINX is active.

5000/tcp – Node.js Backend API
Used by the backend container to serve the /metrics endpoint.

🖥️ Demonstrate (on app-server):

sudo ss -tuln | grep :5000
curl http://localhost:5000/metrics



✅ Returns JSON with hostname, OS, CPU, and memory info.

8080/tcp – Frontend Container Port
Used by the frontend container to serve the web UI that fetches backend metrics.

🖥️ Demonstrate (on web1/web2):

sudo ss -tuln | grep :8080
curl http://localhost:8080



✅ Returns HTML (index page) → confirms frontend is reachable.

51820/udp – WireGuard VPN
Used for encrypted communication between internal servers (VPN tunnel).

🖥️ Demonstrate:

sudo ss -u -lpn | grep :51820
sudo wg show



✅ Output shows active WireGuard interface (wg0) with peers connected.

19999/tcp – Netdata Monitoring Dashboard
Used by Netdata to display real-time server metrics on the web interface.

🖥️ Demonstrate:

sudo ss -tuln | grep :19999
curl http://localhost:19999 -I



✅ Returns HTTP 200 response → proves Netdata dashboard is running.
You can also visit in browser:
http://192.168.56.10:19999



✅ **Verify:**  
UFW active; no unnecessary open ports.


---


## 5. Server Connectivity

🖥️ **Show:**


```
bash
ping 192.168.56.10 -c 2
ping 192.168.56.11 -c 2
ping 192.168.56.12 -c 2
ping 192.168.56.13 -c 2

```

Optionally test specific ports:


```
bash
nc -vz 192.168.56.13 5000

```



💬 **Explain:**  
All servers can communicate within the network.


✅ **Verify:**  
Pings successful; ports open only where expected.


---


## 6. Frontend and Backend Developed

🖥️ **Show:**  
Open `backend/server.js` and `frontend/scripts.js` or `index.html`.  


💬 **Explain:**  
- Backend: Node.js API serving metrics at `/metrics`.  
- Frontend: Fetches and displays metrics via responsive dashboard.  


✅ **Verify:**  
Code modular, structured, and clear.


---


## 7. Application Displays Infrastructure Metrics

🖥️ **Show:**


```
bash
curl http://192.168.56.13:5000/metrics

```



💬 **Explain:**  
The API outputs hostname, OS type, memory usage, CPU model & count, uptime.


✅ **Verify:**  
JSON output matches infrastructure details.


---


## 8. Application Designed for Containerization

🖥️ Show:
Open the Dockerfile in both backend/ and frontend/ folders.


💬 Explain:

“Each component has its own Dockerfile. Both use the official Node.js base image (node:18) for consistency across environments.
The image copies the application files, installs dependencies via npm install, exposes the necessary port (5000 for backend, 8080 for frontend), and starts the respective Node.js server.
This ensures both the frontend and backend can run as isolated, reproducible containers on any machine or VM.”


✅ Verify:
Run:

- docker ps

“Here you can see my backend container running from the backend-app image, exposing port 5000.
It’s up and healthy — this confirms that my application is containerized and active on the app-server.”

- docker logs backend

Test backend API from within the VM
- curl http://localhost:5000/metrics


✅ Expected output:
A JSON response similar to:

{
  "hostname": "app-server",
  "platform": "linux",
  "cpu_count": 2,
  "total_memory_mb": 2048,
  "uptime_minutes": 105,
  "timestamp": "2025-10-12T12:30:00Z"
}



✅ Explain:

“This verifies that the container responds correctly to requests and provides live infrastructure metrics.”

Confirm container networking
sudo ss -tuln | grep 5000



✅ Explain:

“Port 5000 is open and listening, confirming that Docker has mapped it properly between the host and container.”


---


## 9 Backend and Frontend Separation

🖥️ **Show:**


```
bash
docker images
docker inspect <image_id>

```



💬 **Explain:**  
Backend and frontend built as separate images.


✅ **Verify:**  
Distinct images: `backend-app`


---


## 10. Backend Container on Application Server

🖥️ **Show (on app-server):**


```
bash
docker ps
curl http://localhost:5000/metrics

```



💬 **Explain:**  
Backend container is running and serving metrics.


✅ **Verify:**  
Container “Up”; curl returns JSON.


---


## 11. Frontend Containers on Web Servers

🖥️ **Show (on web1 & web2):**


```
bash
docker ps
curl http://localhost:8080

```



💬 **Explain:**  
Frontend containers running on ports 8080 on both web servers.


✅ **Verify:**  
Containers “Up” and serving frontend HTML.


---


## 12. Load Balancer Configuration

🖥️ Show (on lb-server):


```
bash
sudo cat /etc/nginx/conf.d/load-balancer.conf
sudo systemctl status nginx

```



💬 Explain:
Weighted round-robin load balancing configured — web1 (weight=2) and web2 (weight=1).
HTTP (port 80) redirects to HTTPS (port 443) using a self-signed SSL certificate.
All HTTPS traffic is proxied to the frontend containers on web1 and web2.


✅ Verify:


```
bash
curl http://localhost
curl -k https://localhost

```



💬 Expected Output:

HTTP shows 301 Moved Permanently → confirms redirect to HTTPS.

HTTPS alternates between Served by: web1 and Served by: web2 → confirms load balancing works.


✅ Explain:
Nginx service is running, configuration matches setup, and requests are distributed correctly between both web servers.

## 13. Load Balancer Working


🖥️ Show (on lb-server):


```
bash
- curl -I https://192.168.56.10 -k
- curl -k https://192.168.56.10
- curl -k https://192.168.56.10

```



💬 Explain:
The load balancer forwards HTTPS traffic to web1 and web2 using a weighted round-robin setup.
Each time I run curl, the request alternates between servers, confirming that NGINX load balancing works correctly.


✅ Verify:
Headers show:

HTTP/1.1 200 OK
Server: nginx/1.18.0 (Ubuntu)


and the body alternates between:

<p>Served by: web1</p>
<p>Served by: web2</p>



💬 Explain:
“This confirms that the load balancer at 192.168.56.10 is active, distributing traffic between both web servers, and HTTPS redirection is functioning correctly.”

## 14. Component Communication (Frontend ↔ Backend)


🖥️ Show (on web1):


```
bash
docker exec -it 25f161e4d0d4 sh
exit
- curl http://192.168.56.13:5000/metrics

```




🖥️ Show (on web2):


```
bash
docker exec -it 58aebc462bb3 sh
exit
- curl http://192.168.56.13:5000/metrics

```



💬 Explain:
Each frontend container (running on web1 and web2) connects to the backend API on the app-server (192.168.56.13) to fetch live infrastructure metrics.


✅ Verify:
JSON output similar to:

{
  "hostname": "app-server",
  "platform": "linux",
  "cpu_count": 2,
  "total_memory_mb": 3912,
  "uptime_minutes": 79.2
}



💬 Explain:
“This confirms that both frontend containers can successfully communicate with the backend container.
All components — backend, frontend, and load balancer — are now fully connected and functional.”

## 15. Application Accessible via Load Balancer

🖥️ **Show (in browser):**
`https://192.168.56.10`


💬 **Explain:**  
Dashboard displays real-time metrics fetched from backend.


✅ **Verify:**  
UI visible, metrics accurate.

🧩 Verify from Each VM

On lb-server:


```
bash
curl -I -k https://192.168.56.10
curl -k https://192.168.56.10
curl -k https://192.168.56.10

```


Each request should alternate between:

<p>Served by: web1</p>
<p>Served by: web2</p>


On web1:


```
bash
docker ps
curl http://192.168.56.13:5000/metrics

```


Confirms that:

The frontend container is running.

The web1 frontend can reach the backend on the app-server.

On web2:

docker ps
curl http://192.168.56.13:5000/metrics


Confirms that:

The frontend container is running.

The web2 frontend can reach the backend on the app-server.


✅ Verify:

Browser shows the dashboard correctly via HTTPS (https://192.168.56.10).

JSON metrics update every 10 seconds.

“Served by” alternates between web1 and web2, confirming load balancing.

All three VMs (lb-server, web1, web2) and the app-server communicate successfully over the internal network.


💬 Explain:
This confirms that the entire 3-tier system is operational:

lb-server → load balances HTTPS traffic

web1 and web2 → serve the frontend from Docker containers

app-server → provides live backend metrics
All components work together to deliver a secure, dynamically updated dashboard through the load balancer.


---


## 16. Backup VM Exists

🖥️ **Show:**


```
bash
hostname
ip a
rsync --version
sudo systemctl status rsync

```



💬 Explain:
A dedicated backup-server VM (192.168.56.14) is deployed as part of the infrastructure for data protection and redundancy.
It runs rsync version 3.2.7, allowing efficient incremental file synchronization from the application and web servers.
The rsync service is installed and loaded, ready to be enabled or used in daemon mode for automated backups.


✅ **Verify:**  
VM reachable and configured.

🧩 Verify from Web Servers

From web1-server:

ping -c 3 192.168.56.14


From web2-server:

ping -c 3 192.168.56.14


Both commands return successful replies, confirming network connectivity between the web servers and the backup VM.


---


## 17. Automated Backups Scheduled

🖥️ Show:

crontab -l
ls -lh /home/devops/backup/



💬 Explain:
A cron job is configured on the backup-server to automatically run daily at 02:00 AM, using rsync to synchronize data from /home/devops/ to /home/devops/backup/.
This setup ensures that important files are backed up regularly to a dedicated directory on the backup VM (192.168.56.14).
By running backups centrally on a separate VM, data integrity and redundancy are maintained even if the web servers fail.


✅ Verify:

Cron job appears when running crontab -l

Backup directory /home/devops/backup/ exists and contains copied files

File timestamps confirm regular updates after cron execution

---


## 18. Data Restoration from Backup


🖥️ Show:

# create a temporary restore directory
sudo mkdir -p /tmp/restore-test/home /tmp/restore-test/etc

# restore files from backup to test location
sudo rsync -a /backups/home/app-server/ /tmp/restore-test/home/
sudo rsync -a /backups/etc/app-server/ /tmp/restore-test/etc/

# verify restored data
sudo ls -lh /tmp/restore-test/home/
sudo ls -lh /tmp/restore-test/etc/



💬 Explain:
This step verifies that backed-up data can be successfully recovered.
The restoration process uses rsync to copy data from /backups/ into /tmp/restore-test/, preserving ownership, permissions, and timestamps.
This demonstrates that in case of data loss, files can be fully restored from backup to any location.


✅ Verify:
Files and directories appear under /tmp/restore-test/home/ and /tmp/restore-test/etc/, confirming successful restoration.

🔁 Deletion and Restoration Simulation


🖥️ Show:

# verify the backup contains the file
ls -lh /backups/home/app-server/

# simulate data loss (delete original file)
rm /home/devops/testfile

# confirm deletion
ls -lh /home/devops/testfile

# restore the file from backup
sudo rsync -a /backups/home/app-server/testfile /home/devops/

# verify restoration
ls -lh /home/devops/testfile



💬 Explain:
A single-file recovery test confirms that data can be restored after accidental deletion.
testfile is removed from /home/devops/, then restored from /backups/home/app-server/ using rsync -a.
The restored file retains its original size, timestamp, and permissions, proving that the backup system ensures reliable recovery.


✅ Verify:
ls -lh /home/devops/testfile confirms the file reappears exactly as before deletion, demonstrating successful restoration from backup.

## 19. Improved UI/UX

🖥️ **Show:**  
Open metrics dashboard in browser.


💬 **Explain:**  
Responsive, modern, auto-refreshing UI with consistent design.


✅ **Verify:**  
Layout adjusts smoothly and updates automatically.



✅ How to Explain It During the Review

“The Linux VMs in VirtualBox simulate the production environment where the backend and NGINX load balancer run.
I developed and tested the UI in Visual Studio Code on my Windows host, which connects directly to the backend metrics API running inside the VM.
This setup accurately demonstrates end-to-end functionality — backend data collection, API exposure, and a responsive frontend dashboard.”

🧭 Summary
Component	Platform	Role
Linux VM (VirtualBox)	Ubuntu	Runs backend metrics API and NGINX load balancer
Windows Host	VS Code	Runs frontend dashboard (UI/UX) for testing and presentation

---


## 20. Advanced Load Balancing / Extra Features

🖥️ Show:

sudo nano /etc/nginx/conf.d/load-balancer.conf


and the Extras section of your project’s README.


💬 Explain (say this during the review):

“This NGINX configuration implements a weighted round-robin load-balancing algorithm.
I have two frontend servers — one with weight 2 and the other with 1 — so the first handles about twice as many requests, which balances traffic according to their performance.

I also added HTTPS support using a self-signed certificate, and all HTTP requests on port 80 automatically redirect to HTTPS.
This ensures secure communication between users and the application.

The configuration also includes an /api block that forwards requests to the backend metrics service running at 192.168.56.13:5000.

Beyond load balancing, I’ve implemented backup automation with rsync and cron, and the improved frontend UI/UX provides a real-time dashboard that refreshes automatically every 10 seconds.”


✅ Verify:

Refreshing the page shows requests alternating between servers according to weights.

HTTP → HTTPS redirect works correctly.

The dashboard loads live data via the /api proxy.

Backups and restoration tested successfully in Step 18.

🎯 Summary (say this to conclude your review):

“To sum up, I’ve configured an NGINX load balancer using a weighted round-robin method, secured it with HTTPS, connected it to my backend API, and automated backups on the server side.
These improvements make the system more reliable, secure, and production-ready, covering both advanced load balancing and additional features beyond the core requirements.”

Round robin makes the the one with more weight appear more when curling them.

🎯 **End of Review – All Mandatory and Extra Requirements Covered**
