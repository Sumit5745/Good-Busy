#!/bin/bash

# Start Sea Escape Microservices
# This script starts all microservices sequentially
# Usage: ./start-services.sh [environment]
# Example: ./start-services.sh development

# Set default environment if not provided
ENV=${1:-dev}
echo "Using environment: $ENV"

echo "************************************************************"
echo "********************** SEA ESCAPE **************************"
echo "************************************************************"

# Function to start a service in a new terminal
start_service() {
  local service_name=$1
  local service_dir=$2
  
  # For macOS
  if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/$service_dir && npm run dev\""
  # For Linux
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v gnome-terminal &> /dev/null; then
      gnome-terminal -- bash -c "cd $(pwd)/$service_dir && npm run dev; exec bash"
    elif command -v xterm &> /dev/null; then
      xterm -e "cd $(pwd)/$service_dir && npm run dev" &
    else
      echo "No supported terminal emulator found"
    fi
  else
    echo "Unsupported OS"
  fi
  
  echo "Started $service_name service"
}

# Build the project first
npm run build

# Start API Gateway
start_service "API Gateway" "api"

# Start Auth service
start_service "Auth" "auth-ms"

# Start User service
start_service "User" "user-ms"

# Start Notification service
start_service "Notification" "notification-ms"

# Start Contact Us service
start_service "ContactUs" "contact-us-ms"

# Start Privacy Policy service
start_service "PrivacyPolicy" "privacy-policy-ms"

# Start Terms & Conditions service
start_service "TermsCondition" "terms-condition-ms"

# Start About Us service
start_service "AboutUs" "about-us-ms"

# Start Changelogs service
start_service "Changelogs" "changelogs-ms"

# Start Mail service
start_service "Mail" "mail-ms"

# Start Chat service
start_service "Chat" "chat-ms"

# Start Goal service
start_service "Goal" "goal-ms"

# Start Social service
start_service "Social" "social-ms"

echo "All services have been started."
echo "API Gateway: http://localhost:3000"
echo "Swagger Documentation: http://localhost:3000/api-docs"

echo ""
echo "All Sea Escape Microservices have been started with environment: $ENV"
echo "Check individual logs for any errors."
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to press Ctrl+C
wait 