# EchoStream

EchoStream is a real-time chat and event streaming platform built with a modern event-driven architecture. Think WhatsApp/Slack, but powered by Kafka and Redis for scalable, event-sourced messaging.

## Development Roadmap

### **Direct & Group Chat**
- ☐ One-to-one chat functionality
- ☐ Group chat / chat rooms
- ☐ Kafka topic per chat room
- ☐ Event-driven message delivery
- ☐ Message persistence (MongoDB)
- ☐ Attachment support & metadata

### **Real-time Features (Redis Pub/Sub)**
- ☐ Online/offline user status (Redis)
- ☐ Typing indicator (Redis Pub/Sub)
- ☐ Read receipts
- ☐ Message delivery status
- ☐ Real-time UI updates (WebSocket)

### **Kafka Event Replay**
- ☐ Message replay mechanism
- ☐ Historical message retrieval
- ☐ Event sourcing implementation
- ☐ Replay past messages from Kafka

### **Moderation**
- ☐ Moderation microservice
- ☐ Profanity filter
- ☐ Content filtering

### **Performance**
- ☐ Redis rate limiting
- ☐ Cache strategy (temporary cache in Redis)
- ☐ Message queue optimization

---

## Tech Stack

### Backend

- **NestJS**
- **Apache Kafka** - Kafka topic for chat room
- **Redis** - Online user state, rate limiting, temporary cache, Pub/Sub
- **MongoDB** - Message history, attachment metadata
- **WebSocket** - Real-time communication

### Frontend

- **Angular**
- **TypeScript**
- **RxJS** - Reactive state management

### DevOps

- **Docker, Docker Compose**

**Flow:**
1. Users send messages via WebSocket
2. Backend (NestJS) publishes to Kafka topic (chat room)
3. Kafka distributes events to all consumers
4. Redis tracks online status, typing indicators
5. MongoDB stores message history & attachments
6. Messages delivered to clients in real-time

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

#### 2. Start the Backend (Chat Service)

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