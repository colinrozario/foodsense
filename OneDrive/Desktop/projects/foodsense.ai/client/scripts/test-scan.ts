
const barcode = '3017620422003'; // Nutella
const userPreferences = { allergens: [], diet: [], goals: [] };

async function testScan() {
    console.log(`Testing scan for barcode: ${barcode}...`);
    try {
        const response = await fetch('http://localhost:3000/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode, userPreferences })
        });
        
        const status = response.status;
        const text = await response.text();
        console.log(`Status: ${status}`);
        try {
            const json = JSON.parse(text);
            console.log('Response:', JSON.stringify(json, null, 2));
        } catch {
            console.log('Response (non-JSON):', text.substring(0, 500));
        }
    } catch (err: any) {
        console.error('Fetch failed:', err.message);
    }
}

testScan();
