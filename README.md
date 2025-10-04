# EchoStream

EchoStream is a real-time chat and event streaming platform built with a modern event-driven architecture. Think WhatsApp/Slack, but powered by Kafka and Redis for scalable, event-sourced messaging.

## Development Roadmap

### **Phase 1: Authentication & User Management**
- ✅ One-to-one chat functionality
- ☐ User registration with email
- ☐ Email verification with OTP (6-digit code)
- ☐ User profile management
- ☐ JWT authentication & refresh tokens
- ☐ Password reset functionality
- ☐ User search by username/email

### **Phase 2: Friend System**
- ☐ Send friend requests by username
- ☐ Accept/decline friend requests
- ☐ Friend list management
- ☐ Block/unblock users
- ☐ Online/offline status for friends
- ☐ Friend request notifications

### **Phase 3: Enhanced Chat Features**
- ☐ Chat only with friends
- ☐ Message persistence & history loading
- ☐ Message delivery status (sent/delivered/read)
- ☐ Typing indicators
- ☐ Message reactions (emoji)
- ☐ Message editing & deletion
- ☐ File/image attachments (MinIO object storage)

### **Phase 4: Group Chat**
- ☐ Create group chats
- ☐ Add/remove group members
- ☐ Group admin permissions
- ☐ Group settings & info
- ☐ Kafka topic per group chat

### **Phase 5: Real-time Features (Redis Pub/Sub)**
- ☐ Real-time friend status updates
- ☐ Real-time notifications
- ☐ Typing indicator (Redis Pub/Sub)
- ☐ Read receipts
- ☐ Push notifications

### **Phase 6: Advanced Features**
- ☐ Message search & filtering
- ☐ Chat themes & customization
- ☐ Voice messages
- ☐ Video calls (WebRTC)
- ☐ Screen sharing
- ☐ Message scheduling

### **Phase 7: Kafka Event Replay & Analytics**
- ☐ Message replay mechanism
- ☐ Historical message retrieval
- ☐ Event sourcing implementation
- ☐ User activity analytics
- ☐ Chat statistics dashboard

### **Phase 8: Moderation & Security**
- ☐ Moderation microservice
- ☐ Profanity filter
- ☐ Content filtering
- ☐ Spam detection
- ☐ Rate limiting per user
- ☐ Report & block system

### **Phase 9: Performance & Scalability**
- ☐ Redis caching strategy
- ☐ Database indexing optimization
- ☐ Message queue optimization

---

## Tech Stack

### Backend

- **NestJS** - Main application framework
- **Apache Kafka** - Event streaming & message queues
- **Redis** - Caching, sessions, pub/sub, rate limiting
- **MongoDB** - User data, messages, friendships
- **MinIO** - Object storage for file attachments
- **WebSocket (Socket.IO)** - Real-time communication
- **JWT** - Authentication & authorization
- **Nodemailer** - Email service for OTP verification
- **Bcrypt** - Password hashing
- **Class-validator** - Input validation

### Frontend

- **Angular 18+** - Modern frontend framework
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming
- **Socket.IO Client** - WebSocket connection
- **Angular Material** - UI components (planned)
- **PWA Support** - Progressive web app features

**Application Flow:**

### Authentication Flow
1. User registers with email → OTP sent to email
2. User enters OTP → Account verified & JWT tokens issued
3. User logs in → JWT authentication & session management

### Friend System Flow
1. User searches for friends by username
2. Sends friend request → Stored in database
3. Recipient gets notification → Accepts/declines request
4. Friends can now chat with each other

### Messaging Flow
1. User sends message via WebSocket (only to friends)
2. Backend validates friendship → Publishes to Kafka topic
3. Kafka distributes message events to consumers
4. MongoDB stores message permanently
5. Redis updates real-time status & typing indicators
6. Message delivered to recipient via WebSocket

### Real-time Updates
- Friend requests & status changes via Redis Pub/Sub
- Typing indicators via Redis (temporary data)
- Online/offline status via Redis sessions
- Push notifications for offline users

---

## Getting Started

### Prerequisites

- **Docker & Docker Compose**
- **Node.js** (v18+ recommended)
- **npm** or **yarn**

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/eyuppastirmaci/echo-stream.git
   cd echo-stream
   ```

2. **Create environment file:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```

3. **Configure environment variables in `.env`**

### Running the Project

#### 1. Start Infrastructure Services (Docker)

```bash
# Start MongoDB, Kafka, and Zookeeper
docker-compose up -d

# Check if services are running
docker-compose ps
```

#### 2. Start the Backend Services

**User Service:**
```bash
# Navigate to user service directory
cd apps/backend/user-service

# Install dependencies
npm install

# Build and start the service
npm run build && npm start
```

**Chat Service:**
```bash
# Navigate to chat service directory
cd apps/backend/chat-service

# Install dependencies
npm install

# Build and start the service
npm run build && npm start
```

### Running Tests

```bash
# Navigate to chat service directory
cd apps/backend/chat-service

# Run the test suite
npm test
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Authors & Contributors

- **Eyüp Pastırmacı** - [@eyuppastirmaci](https://github.com/eyuppastirmaci)

---

## Acknowledgments

- Inspired by modern chat platforms like WhatsApp and Slack