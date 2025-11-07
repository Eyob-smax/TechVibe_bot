module.exports = {
  apps: [
    {
      // Process name in pm2
      name: 'techvibe-bot',

      // Entry file of your bot
      script: './dist/main.js', // change if needed

      // Use cluster mode to scale on multiple CPU cores

      // Restart automatically if crash
      autorestart: true,

      // Restart if memory usage exceeds 300MB (optional)
      max_memory_restart: '300M',

      // Number of restart attempts before giving up
      max_restarts: 50,

      // Delay restarts (prevents restart loop)
      restart_delay: 4000,

      // Folder to watch for changes (dev only)
      watch: true,
      ignore_watch: ['node_modules', 'logs', '.git', 'temp', 'uploads'],

      // Merge logs in one file
      merge_logs: true,

      // Timestamp logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // Log file paths (optional)
      error_file: './logs/error.log',
      out_file: './logs/output.log',

      // ENVIRONMENT VARIABLES (dev)
      env: {
        NODE_ENV: 'development',
        BOT_TOKEN: 'your-dev-key-here',
        PORT: 5000,
      },

      // ENVIRONMENT VARIABLES (production)
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

      // Timezone for logs (optional)
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
