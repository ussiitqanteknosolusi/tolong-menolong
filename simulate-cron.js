const http = require('http');

function triggerCron() {
    console.log(`[${new Date().toLocaleTimeString()}] Memitu proses Donasi Otomatis...`);
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/cron/process-recurring',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
             try {
                const json = JSON.parse(data);
                console.log(`[${new Date().toLocaleTimeString()}] Hasil:`, JSON.stringify(json, null, 2));
             } catch (e) {
                console.log(`[${new Date().toLocaleTimeString()}] Response:`, data);
             }
        });
    });

    req.on('error', (error) => {
        console.error(`[${new Date().toLocaleTimeString()}] Error: Gagal menghubungi server. Pastikan 'npm run dev' berjalan.`, error.message);
    });

    req.end();
}

// Jalankan pertama kali
triggerCron();

// Jalankan setiap 60 detik
setInterval(triggerCron, 60000);

console.log('Simulasi Cron Job Berjalan (Ctrl+C untuk berhenti)...');
