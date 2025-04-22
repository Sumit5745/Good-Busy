module.exports = {
  apps: [
    {
      name: "api-gateway",
      script: "./api/index.ts",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "auth-ms",
      script: "./auth-ms/index.ts",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "user-ms",
      script: "./user-ms/index.ts",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "notification-ms",
      script: "./notification-ms/index.ts",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "contact-us-ms",
      script: "./contact-us-ms/index.ts",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "privacy-policy-ms",
      script: "./privacy-policy-ms/index.ts",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "terms-condition-ms",
      script: "./terms-condition-ms/index.ts",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "about-us-ms",
      script: "./about-us-ms/index.ts",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "changelogs-ms",
      script: "./changelogs-ms/index.ts",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "mail-ms",
      script: "./mail-ms/index.ts",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "chat-ms",
      script: "./chat-ms/index.ts",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "goal-ms",
      script: "./goal-ms/index.ts",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "social-ms",
      script: "./social-ms/index.ts",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
