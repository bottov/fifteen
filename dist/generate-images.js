const puppeteer = require('puppeteer');
const sharp = require('sharp');
const fs = require('fs');

async function generateImage(htmlFile, outputFile, width, height) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(`file://${process.cwd()}/${htmlFile}`);
    await page.screenshot({ path: outputFile });
    await browser.close();
}

async function generateFavicons() {
    // Generate base favicon
    await generateImage('favicon/generate.html', 'favicon/favicon-96x96.png', 96, 96);
    await generateImage('favicon/generate.html', 'favicon/apple-touch-icon.png', 180, 180);
    
    // Generate smaller favicons
    await generateImage('favicon/generate.html', 'favicon/favicon-32.png', 32, 32);
    await generateImage('favicon/generate.html', 'favicon/favicon-16.png', 16, 16);
    
    // Create ICO file (simplified version)
    const png32 = await sharp('favicon/favicon-32.png').toBuffer();
    const png16 = await sharp('favicon/favicon-16.png').toBuffer();
    const icoBuffer = Buffer.concat([png16, png32]);
    fs.writeFileSync('favicon/favicon.ico', icoBuffer);
    
    // Create SVG
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
        <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#1a2a6c"/>
                <stop offset="50%" style="stop-color:#b21f1f"/>
                <stop offset="100%" style="stop-color:#fdbb2d"/>
            </linearGradient>
        </defs>
        <rect width="180" height="180" fill="url(#grad)"/>
        <rect x="20" y="20" width="140" height="140" rx="20" fill="white"/>
        <text x="90" y="110" font-family="'Segoe UI', sans-serif" font-size="80" font-weight="bold" fill="#1a2a6c" text-anchor="middle">15</text>
    </svg>`;
    fs.writeFileSync('favicon/favicon.svg', svg);
    
    // Clean up temporary files
    fs.unlinkSync('favicon/favicon-32.png');
    fs.unlinkSync('favicon/favicon-16.png');
}

async function main() {
    // Create directories if they don't exist
    if (!fs.existsSync('images')) {
        fs.mkdirSync('images');
    }
    if (!fs.existsSync('favicon')) {
        fs.mkdirSync('favicon');
    }
    
    // Generate Farcaster Frame images
    await generateImage('frames/image-url.html', 'frames/image-url.png', 1200, 630);
    await generateImage('frames/splash.html', 'frames/splash.png', 1200, 630);
    await generateImage('frames/og.html', 'images/og.jpg', 1200, 630);
    
    // Generate favicons
    await generateFavicons();
}

main().catch(console.error); 