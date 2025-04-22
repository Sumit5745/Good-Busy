# Good-Busy: Goal Setting & Social Accountability App

Good-Busy is a modern, mobile-friendly goal management application that helps users set, track, and achieve their goals with social accountability features. The app is built using a microservices architecture with Node.js, Express, MongoDB, and React Native.

## Key Features

- **User Authentication**: Secure registration and login with email verification
- **Goal Management**: Create, update, track, and delete personal goals
- **Social Accountability**: Follow other users and view their public goals
- **Interaction**: Like, comment, and provide encouragement on goals
- **Notifications**: Real-time notifications for goal updates and social interactions
- **User Profiles**: Customizable profiles with stats and goal history
- **Privacy Controls**: Set goals as public or private
- **Goal Analytics**: Track completion rates and progress over time

## Recent Enhancements

The following improvements have been made to enhance the user experience and security:

1. **Enhanced OTP Verification System**: 
   - Implemented rate limiting for OTP requests to prevent abuse
   - Added resend functionality with a cooldown period
   - Maximum 5 OTP requests per day for security

2. **Standardized API Response Handling**:
   - Consistent response format across all microservices
   - Improved error handling with detailed feedback
   - Integrated with client-side toast notification system

3. **Goal Privacy Controls**:
   - Full implementation of privacy settings (public, followers-only, private)
   - UI components for easy privacy management
   - Backend permission verification for data security

4. **User Feedback System**:
   - Toast notifications for API operation feedback
   - Consistent messaging across the application
   - Internationalization support for error messages

For more details on UI components, see the [UI Components Documentation](./UI-COMPONENTS.md).

## Microservices Architecture

The application is structured as multiple microservices:

- **Authentication Service** (auth-ms): Handles user registration, login, and account verification
- **User Service** (user-ms): Manages user profiles, preferences, and settings
- **Goal Service** (goal-ms): Handles goal creation, updates, completion tracking
- **Social Service** (social-ms): Manages following relationships between users
- **Notification Service** (notification-ms): Handles in-app notifications and alerts
- **Mail Service** (mail-ms): Manages email sending for verification and notifications
- **About Us Service** (about-us-ms): Handles about us page content
- **Privacy Policy Service** (privacy-policy-ms): Manages privacy policy content
- **Terms & Conditions Service** (terms-condition-ms): Manages terms of service content
- **Contact Us Service** (contact-us-ms): Handles user inquiries and support requests
- **Chat Service** (chat-ms): Enables real-time messaging between users (future feature)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4.4 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/good-busy.git
cd good-busy
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

To start all microservices in development mode:

```bash
npm run dev
```

To start individual microservices:

```bash
# Authentication service
npm run start:auth

# User service
npm run start:user

# Goal service
npm run start:goal

# Social service
npm run start:social

# Notification service
npm run start:notification

# Mail service
npm run start:mail
```

### Production Mode

To build and start all microservices for production:

```bash
# Build the project
npm run build

# Start in production mode
npm start
```

## Project Structure

The project follows a microservices architecture with each service having its own responsibility:

```
good-busy/
├── shared/              # Shared resources across microservices
│   ├── config.json      # Common configuration
│   ├── db.ts            # Database connection
│   ├── middleware/      # Shared middleware
│   ├── models/          # Shared models
│   └── services/        # Shared services
│
├── api/                 # API gateway and documentation
├── auth-ms/             # Authentication microservice
├── user-ms/             # User microservice
├── goal-ms/             # Goal microservice
├── social-ms/           # Social microservice
├── notification-ms/     # Notification microservice
├── mail-ms/             # Mail microservice
├── about-us-ms/         # About Us microservice
├── privacy-policy-ms/   # Privacy Policy microservice
├── terms-condition-ms/  # Terms & Conditions microservice
└── contact-us-ms/       # Contact Us microservice
```

Each microservice follows a similar structure:

```
microservice/
├── index.ts             # Entry point
├── src/
│   ├── controller/      # Business logic
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Services
│   ├── validator/       # Request validators
│   └── locales/         # Internationalization
```

## User Flows

### Registration & Authentication

1. User registers with email, password, and profile details
2. System sends a verification email with OTP
3. User verifies account with OTP
4. User can then login with verified credentials

### Goal Management

1. User creates goals with title, description, and frequency (daily/weekly/monthly)
2. Goals can be marked complete or incomplete
3. Users can track progress over time
4. Goals can be edited or deleted

### Social Features

1. Users can search for and follow other users
2. Public goals are visible to followers
3. Users can like and comment on others' goals for encouragement
4. Notification system alerts users to social interactions

## Mobile Application Features

The mobile application provides a user-friendly interface for all functionality:

- Clean, intuitive UI with purple theme
- Profile customization including image upload
- Goal tracking dashboard
- Social feed of followed users' goals
- Push notifications for important updates
- Account management settings

## API Documentation

API documentation is available through Swagger UI when the services are running:

```
http://localhost:3000/api-docs
```

## Configuration

The application uses a centralized configuration approach with environment-specific settings in `shared/config.json`.

To modify the configuration, edit the `shared/config.json` file and update the values for the appropriate environment.

## Security Features

- Email verification for new accounts
- JWT authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting

## Contributing

Please read our contribution guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.