const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
    page.on('requestfailed', request => console.log('BROWSER REQUEST FAILED:', request.url(), request.failure().errorText));

    // Navigate to login just to access localStorage for that origin
    await page.goto('http://localhost:5173/login/student', { waitUntil: 'networkidle2' });

    // Inject mock token
    await page.evaluate(() => {
        localStorage.setItem('token', 'mock_token');
        localStorage.setItem('user', JSON.stringify({ name: 'Admin', role: 'admin', email: 'admin@eduflow.com' }));
    });

    console.log('Navigating to http://localhost:5173/dashboard as admin ...');

    try {
        await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
        console.log('Page loaded.');
        await new Promise(r => setTimeout(r, 5000));
    } catch (err) {
        console.error('Navigation error:', err);
    }

    await browser.close();
})();
