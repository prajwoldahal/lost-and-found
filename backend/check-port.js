import net from 'net';

const checkPort = (port) => {
    const server = net.createServer().listen(port, '127.0.0.1');
    server.on('listening', () => {
        console.log(`Port ${port} is FREE`);
        server.close();
        process.exit(1); // Port is free, so backend is NOT running
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is IN USE`);
            process.exit(0); // Port is in use, so backend IS likely running
        } else {
            console.error('Error:', err.message);
            process.exit(2);
        }
    });
};

checkPort(5000);
