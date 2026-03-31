
import { neon } from '@neondatabase/serverless';
import { GoogleGenerativeAI } from '@google/generative-ai';

const DATABASE_URL = process.env.DATABASE_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function checkDatabase() {
    console.log('--- Checking Database ---');
    if (!DATABASE_URL) {
        console.error('❌ DATABASE_URL is missing');
        return;
    }
    try {
        const sql = neon(DATABASE_URL);
        const result = await sql`SELECT 1 as connected`;
        console.log('✅ Database connected:', result);
    } catch (err: any) {
        console.error('❌ Database connection failed:', err.message);
    }
}

async function checkGemini() {
    console.log('\n--- Checking Gemini API ---');
    if (!GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY is missing');
        return;
    }
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Say "API Healthy"');
        console.log('✅ Gemini API response:', result.response.text());
    } catch (err: any) {
        console.error('❌ Gemini API failed:', err.message);
    }
}

async function checkOpenFoodFacts() {
    console.log('\n--- Checking OpenFoodFacts API ---');
    const barcode = '3017620422003'; // Nutella
    try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        if (!res.ok) {
            console.error('❌ OpenFoodFacts API returned status:', res.status);
            return;
        }
        const data = await res.json();
        if (data.status === 1 && data.product) {
            console.log('✅ OpenFoodFacts API healthy (Nutella found)');
        } else {
            console.error('❌ OpenFoodFacts API returned data but product not found');
        }
    } catch (err: any) {
        console.error('❌ OpenFoodFacts API failed:', err.message);
    }
}

async function runAll() {
    await checkDatabase();
    await checkGemini();
    await checkOpenFoodFacts();
}

runAll();
