import http from 'http';
import app from './app';

const port: number = 3000;

const server: http.Server = http.createServer(app);

server.listen(port, () => {
    console.log("Server is running..."+port);
});