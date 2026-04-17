# Plan: Containerized Deployment

## Objective
Enable full-stack containerized deployment using Docker Compose for local and production environments.

## 1. Backend Containerization
- [x] Review root `Dockerfile` (Spring Boot + Maven Build)
- [x] Review `docker-compose.yml`

## 2. Frontend Containerization
- [x] Create `frontend/Dockerfile` (Node.js Build + Nginx Runtime)
- [x] Create `frontend/nginx.conf` (SPA Routing + API Proxy)

## 3. Environment & Orchestration
- [x] Configure `.env` from `.env.example`
- [x] Update `docker-compose.yml` to include the new frontend service (already present in the draft)

## 4. Verification
- [ ] Build and start the containers using `docker-compose up -d --build`
- [ ] Verify database connectivity
- [ ] Verify backend health via `/actuator/health`
- [ ] Verify frontend accessibility at `http://localhost:3000`
- [ ] Verify end-to-end connectivity (Frontend -> Nginx -> Backend)
