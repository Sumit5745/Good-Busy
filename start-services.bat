@echo off
setlocal enabledelayedexpansion

:: Start Sea Escape Microservices Script for Windows
:: This batch file starts all microservices sequentially
:: Usage: start-services.bat [environment]
:: Example: start-services.bat development

:: Set default environment if not provided
set ENV=dev
if not "%~1"=="" set ENV=%~1
echo Using environment: %ENV%

echo Starting Sea Escape Microservices...
echo -----------------------------------

echo ************************************************************
echo *********************** SEA ESCAPE *************************
echo ************************************************************

:: Kill all node processes
taskkill /f /im node.exe >nul 2>&1

:: Build before starting services
call npm run build

:: Start with API gateway
start "api-gateway" cmd /k "npm run start:api"

:: Start auth microservice
start "auth-ms" cmd /k "cd auth-ms && npm run dev"

:: Start user microservice
start "user-ms" cmd /k "cd user-ms && npm run dev"

:: Start notification microservice
start "notification-ms" cmd /k "cd notification-ms && npm run dev"

:: Start contact-us microservice
start "contact-us-ms" cmd /k "cd contact-us-ms && npm run dev"

:: Start privacy-policy microservice
start "privacy-policy-ms" cmd /k "cd privacy-policy-ms && npm run dev"

:: Start terms-condition microservice
start "terms-condition-ms" cmd /k "cd terms-condition-ms && npm run dev"

:: Start about-us microservice
start "about-us-ms" cmd /k "cd about-us-ms && npm run dev"

:: Start changelogs microservice
start "changelogs-ms" cmd /k "cd changelogs-ms && npm run dev"

:: Start mail microservice
start "mail-ms" cmd /k "cd mail-ms && npm run dev"

:: Start chat microservice
start "chat-ms" cmd /k "cd chat-ms && npm run dev"

:: Start goal microservice
start "goal-ms" cmd /k "cd goal-ms && npm run dev"

:: Start social microservice
start "social-ms" cmd /k "cd social-ms && npm run dev"

REM Add other services as needed
echo Starting boat service...
start "boat-ms" cmd /k "cd boat-ms && npm run dev"

echo Starting booking service...
start "booking-ms" cmd /k "cd booking-ms && npm run dev"

echo Starting wishlist service...
start "wishlist-ms" cmd /k "cd wishlist-ms && npm run dev"

echo Starting affiliate service...
start "affiliate-ms" cmd /k "cd affiliate-ms && npm run dev"

echo Starting newsletter service...
start "newsletter-ms" cmd /k "cd newsletter-ms && npm run dev"

echo Starting faq service...
start "faq-ms" cmd /k "cd faq-ms && npm run dev"

echo Starting card service...
start "card-ms" cmd /k "cd card-ms && npm run dev"

echo Starting social-media service...
start "social-media-ms" cmd /k "cd social-media-ms && npm run dev"

echo Starting payment service...
start "payment-ms" cmd /k "cd payment-ms && npm run dev"

echo Starting wallet service...
start "wallet-ms" cmd /k "cd wallet-ms && npm run dev"

echo Starting reviews service...
start "reviews-ms" cmd /k "cd reviews-ms && npm run dev"

echo.
echo All Sea Escape Microservices have been started with environment: %ENV%
echo Check individual console windows for any errors.
echo.
echo Press any key to exit this window (services will continue running)...
pause > nul

endlocal 