WebSocket-Chat-App
WebSocket-Chat-App is a real-time chat application built with Spring Boot for the backend and ReactJS for the frontend. It leverages SockJS and STOMP protocols for reliable WebSocket-based messaging. The app supports public group chats, private one-on-one messaging, and displays online users in real time.

Features
Real-time messaging using WebSocket (SockJS and STOMP)

Public group chat and private direct messaging

Online user list and presence tracking

Built with Spring Boot backend and ReactJS frontend

Getting Started
Prerequisites
Java 17 or later

Maven 3.x

Node.js and npm/yarn installed (for frontend)

MySQL or any supported database (if persistence enabled)

Backend Setup (Spring Boot)
Clone the repository:

bash
git clone https://github.com/ManojAcharya08/WebSocket-Chat-App.git
cd WebSocket-Chat-App
Navigate to the backend directory (if your backend is within a subfolder, e.g., server or at root):

bash
cd backend
Configure database settings (if applicable) in src/main/resources/application.properties

Build and run the backend:

bash
mvn clean install
mvn spring-boot:run
Backend server will start at http://localhost:8080

Frontend Setup (ReactJS)
Open a new terminal and navigate to the frontend folder:

bash
cd websocket-front-end
Install dependencies:

bash
npm install
# Or if you use yarn
yarn install
Start the development server:

bash
npm start
# Or
yarn start
Frontend will be available at http://localhost:3000

Usage
Open frontend URL in your browser

Connect multiple clients to start real-time chatting

Send messages to the public chat room or privately to users

See online user status updates live

Project Structure
text
WebSocket-Chat-App/
├── backend/                 # Spring Boot backend source code
├── websocket-front-end/     # React frontend source code and configs
├── images/                  # Static images used
├── pom.xml                  # Maven configuration
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation
