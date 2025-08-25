module.exports = {
  apps: [
    {
      name: 'becas-backend',
      cwd: 'C:/proyectos/beca-municipal-system/backend',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      log_file: '../logs/backend-combined.log',
      time: true,
      restart_delay: 4000
    },
    {
      name: 'becas-frontend',
      cwd: 'C:/proyectos/beca-municipal-system/frontend',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        BROWSER: 'none'
      },
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log', 
      log_file: '../logs/frontend-combined.log',
      time: true,
      restart_delay: 4000
    }
  ]
};