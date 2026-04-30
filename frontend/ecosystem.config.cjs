module.exports = {
  apps: [
    {
      name: "url-front",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
