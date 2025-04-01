# 🌐 NGINX Balancer Chat

The `nginx-balancer-chat` project demonstrates a WebSocket-based chat system built using the `agent-swarm-kit` framework. It includes a **server** that handles WebSocket connections, a **client** for interacting with the server, and an **NGINX reverse proxy** for load balancing across multiple WebSocket servers.

---

## 📂 Folder Structure

---

## ✨ Features

- **WebSocket Communication**: Real-time communication between clients and servers using WebSocket.
- **Agent-Swarm Integration**: Leverages `agent-swarm-kit` to manage agents, swarms, and tools.
- **NGINX Load Balancing**: Distributes WebSocket connections across multiple servers using NGINX.
- **Dynamic Agent Responses**: Agents respond to user messages based on predefined prompts and tools.
- **Dockerized Deployment**: Includes Docker and Docker Compose configurations for easy deployment.

---

## 🚀 Getting Started

### 1. **Install Dependencies**
Navigate to the `nginx-balancer-chat` directory and install the required dependencies:
```bash
cd demo/nginx-balancer-chat
bun install
```
2. Set Up Environment Variables
Create a .env file in the nginx-balancer-chat directory and add your OpenAI API key:
```
OPENAI_API_KEY=your-openai-api-key
```
**3. Run the Server Start**

 Start the WebSocket server:
 ```
 npm run start:server.ts
  ```
You can start multiple instances of the server on different ports (e.g., `8082`, `8083`) for load balancing.

**4. Run the Client**
In a separate terminal, start the WebSocket client:
```
npm run start:client.ts
```
5. Run NGINX
Start the NGINX reverse proxy using Docker Compose:
```
docker-compose up -d
```

**🌟 How It Works**

Server `(src/server.ts)`
The server is implemented in src/server.ts. It:

**1. Initializes a WebSocket Server:**

- Uses `Bun.serve` to create a WebSocket server that listens on a specified port.
- Assigns a unique `clientId` to each client connection.

**2.Manages Agents and Swarms:**

- Defines an agent `(TestAgent)` with a specific prompt and tools.
- Adds the agent to a swarm `(TestSwarm)` to coordinate its behavior.

**3. Processes Incoming Messages:**

- When a message is received from a client, the server processes it using the swarm and agent logic.
- The response is sent back to the client.

**4. Tool Integration:**

- Includes tools for extending agent functionality.

**Key Components:**

**Agent:**
```
addAgent({
  agentName: "test_agent",
  completion: COHERE_COMPLETION,
  prompt: "You are a test agent for NGINX Upstream. Tell the user the server port from the chat history.",
});
```
**Swarm:**
```
addSwarm({
  swarmName: "test_swarm",
  agentList: [TEST_AGENT],
  defaultAgent: TEST_AGENT,
});
```
**Client `(src/client.ts)`**
The client is implemented in src/client.ts. It:

**1.Connects to the WebSocket Server:**

- Establishes a WebSocket connection to the server at `http://127.0.0.1:80`.

**2.Sends User Messages:**

- Reads user input from the terminal and sends it to the server via WebSocket.

**3.Receives and Displays Responses:**

- Listens for responses from the server 
and displays them in the terminal.

**4.Handles Connection Events:**

- Logs connection status, errors, and disconnections.

**NGINX Configuration `(config/nginx.conf)`**

The NGINX configuration file defines a reverse proxy for WebSocket connections. It:

**1.Load Balances WebSocket Servers:**

- Distributes connections across multiple WebSocket servers using the `least_conn method`.

**2.Handles WebSocket-Specific Headers:**

- Sets headers like `Upgrade` and `Connection` to support WebSocket connections.

**3.Optimizes Performance:**

- Configures buffering, timeouts, and connection settings for long-lived WebSocket connections.

Example:
``` 
upstream local_websocket_servers {
    server host.docker.internal:8081;
    server host.docker.internal:8082;
    server host.docker.internal:8083;
    least_conn;
}

server {
    listen 80;

    location / {
        proxy_pass http://local_websocket_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }
}
``` 
**📖 Example Interaction**

1. Start the server and client as described in the setup instructions.
2. Type a message in the client terminal:
``` 
pharma-bot => What is the server port?
``` 
3. The agent responds:
``` 
[test_agent]: The server port is 8081.
``` 
**🔧 Configuration**

**Server Configuration**

The server listens on a specified port. You can change the port by modifying the `--port` argument when starting the server:
```
bun [server.ts]
```
**NGINX Configuration**

The NGINX configuration file is located at `config/nginx.conf.` You can modify the upstream servers or other settings as needed.

**📜 Scripts**

The following scripts are defined in `package.json`:
- Start the client:
```
npm run start:client
c
```
- Start the Server with PM2:
```
npm run start:pm2
```
- Start NGINX:
```
npm run start:nginx
```
**🌍 Use Cases**

- **Load-Balanced WebSocket Chat:**
Distribute WebSocket connections across multiple servers for scalability.

- **Real-Time Communication:** Build dynamic chat systems with intelligent agents.
- **Reverse Proxying:** Use NGINX to manage and optimize WebSocket connections.

**🤝 Contributing**

Contributions are welcome! If you’d like to improve this project, feel free to submit a pull request.

**📜 License**
This project is licensed under the MIT License.

**📬 Contact**
For questions or support, email tripolskypetr@gmail.com.