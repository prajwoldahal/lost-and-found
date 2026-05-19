// File: QRGenerator.jsx
// Description: QR Code Renderer: Turns individual item links into scannable QR images for physical flyers.

import QRCode from 'react-qr-code';

// React Component: Renders the QRGenerator user interface elements dynamically
export default function QRGenerator({ value }) {
    const downloadQR = () => {
        try {
            const svg = document.getElementById('qr-code');
            if (!svg) {
                console.error('QR code element not found');
                return;
            }

            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = 'qr-code.png';
                downloadLink.href = pngFile;
                downloadLink.click();
            };

            img.onerror = (error) => {
                console.error('Error loading QR code image:', error);
            };

            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        } catch (error) {
            console.error('Error downloading QR code:', error);
        }
    };

    if (!value) {
        return (
            <div className="flex flex-col items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">No URL provided for QR code</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div style={{ height: 'auto', margin: '0 auto', maxWidth: 256, width: '100%', padding: '16px', background: 'white', borderRadius: '8px' }}>
                <QRCode
                    size={256}
                    id="qr-code"
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    value={value}
                    viewBox={`0 0 256 256`}
                    level="H"
                />
            </div>
            <button
                onClick={downloadQR}
                className="text-sm bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg font-bold transition-colors shadow-sm"
            >
                Download QR Code
            </button>
        </div>
    );
}
