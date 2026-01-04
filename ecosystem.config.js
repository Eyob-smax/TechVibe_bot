module.exports = {
  apps: [
    {
      name: 'techvibe-bot',
      script: './dist/main.js',
      autorestart: true,

      max_memory_restart: '300M',
      max_restarts: 50,

      restart_delay: 4000,

      watch: true,
      ignore_watch: ['node_modules', 'logs', '.git', 'temp', 'uploads'],

      merge_logs: true,

      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      error_file: './logs/error.log',
      out_file: './logs/output.log',

      env: {
        NODE_ENV: 'development',
        BOT_TOKEN: 'your-dev-key-here',
        PORT: 5000,
      },

      env_production: {
        NODE_ENV: 'production',
        BOT_TOKEN: '8316897803:AAFjkJlx9259j2k0CKphT3oaIrZZVfZTAFA',
        GEMINI_API_KEY: 'AIzaSyDIx3pswYdXs-1-en9SuJMrmhkOhIv-k1E',
        AI_MODEL: 'gemini-2.5-pro',
        BOT_ADMIN_ID: 1259654531,
        EMAIL_RECIPIENT: 'eyobsmax@gmail.com',
        EMAIL_USER: 'eyobsmax@gmail.com',
        CHANNEL_ID: -1002058435516,
        NEWS_API_KEY: 'a1f18105ff6bb4ed4ebe77b19404f5c5',
        EMAIL_PASS: 'zsou gfta tngh wbnz',
        PORT: 9000,
        DATABASE_URL:
          'postgresql://neondb_owner:npg_vLq7tW2DZQIa@ep-restless-firefly-ahjh9u0v-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
        DIRECT_URL:
          'postgresql://neondb_owner:npg_vLq7tW2DZQIa@ep-restless-firefly-ahjh9u0v.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      },

      time: true,
    },
  ],

  deploy: {
    production: {
      user: 'root',
      host: 'YOUR_SERVER_IP',
      ref: 'origin/main',
      repo: 'https://github.com/your/repo.git',
      path: '/var/www/techvibe-bot',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
    },
  },
};
