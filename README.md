# 🩸 LifeLink — Smart Blood Donation & Emergency Finder System

A full-stack blood donation platform connecting donors with patients in real time.

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8.0+ (or use H2 fallback for testing)

---

## ⚙️ Backend Setup

```bash
cd lifelink/backend
```

### Option A — MySQL (recommended)
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/lifelink?createDatabaseIfNotExist=true...
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### Option B — H2 In-Memory (no setup needed)
In `application.properties`, comment out the MySQL block and uncomment the H2 block.

### Run the backend:
```bash
mvn spring-boot:run
```
Backend starts at **http://localhost:8080**

> A default admin user is created automatically:
> - Email: `admin@lifelink.com`
> - Password: `admin123`

---

## 🖥️ Frontend Setup

```bash
cd lifelink/frontend
npm install
npm run dev
```
Frontend starts at **http://localhost:5173**

---

## 🔑 Default Credentials

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@lifelink.com     | admin123   |

Register new accounts directly from the app for Donor / Patient roles.

---

## 🌐 API Endpoints

| Method | Endpoint                     | Auth     | Description              |
|--------|------------------------------|----------|--------------------------|
| POST   | /api/auth/register            | Public   | Register new user        |
| POST   | /api/auth/login               | Public   | Login & get JWT          |
| GET    | /api/donors                   | Public   | List all donors          |
| GET    | /api/donors/search            | Public   | Search with filters      |
| POST   | /api/donors                   | Auth     | Create donor profile     |
| PUT    | /api/donors/{id}              | Auth     | Update donor             |
| PUT    | /api/donors/{id}/toggle-availability | Auth | Toggle availability |
| GET    | /api/requests                 | Public   | List blood requests      |
| GET    | /api/requests/emergency       | Public   | Emergency requests       |
| POST   | /api/requests                 | Auth     | Create blood request     |
| PUT    | /api/requests/{id}/status     | Auth     | Update request status    |
| GET    | /api/dashboard                | Auth     | Dashboard stats          |
| POST   | /api/messages                 | Auth     | Send message             |
| GET    | /api/messages/conversation/{id} | Auth   | Get conversation         |
| GET    | /api/admin/users              | Admin    | All users                |
| DELETE | /api/admin/users/{id}         | Admin    | Delete user              |

---

## 🗄️ Database Schema

Tables: `users`, `donors`, `blood_requests`, `messages`

The schema is auto-created on first run via `spring.jpa.hibernate.ddl-auto=update`.

---

## 🎨 UI Features

- Dark/Light mode toggle
- Glassmorphism card design
- Blood-red gradient theme
- Responsive sidebar layout
- Loading skeletons
- Toast notifications
- Real-time chat polling (5s interval)
- Emergency request alerts

---

## 📦 Build for Production

**Backend:**
```bash
cd backend
mvn clean package
java -jar target/lifelink-backend-1.0.0.jar
```

**Frontend:**
```bash
cd frontend
npm run build
# Output: dist/
```

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Spring Boot 3.2, Spring Security, JWT |
| Database  | MySQL 8 / H2 (testing)              |
| ORM       | JPA + Hibernate                     |
| Frontend  | React 18, Vite, Tailwind CSS        |
| HTTP      | Axios with interceptors             |
| Auth      | JWT Bearer tokens, BCrypt           |

---

## 📁 Project Structure

```
lifelink/
├── backend/
│   ├── src/main/java/com/lifelink/
│   │   ├── controller/     # REST Controllers
│   │   ├── service/        # Business Logic
│   │   ├── repository/     # JPA Repositories
│   │   ├── entity/         # JPA Entities
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── security/       # JWT + Spring Security
│   │   └── config/         # App Configuration
│   └── pom.xml
└── frontend/
    └── src/
        ├── pages/          # Route-level components
        ├── components/     # Shared UI components
        ├── services/       # Axios API calls
        └── context/        # React Context (Auth, Theme)
```
