import { pgTable, serial, text, jsonb, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').unique(), // Optional for MVP
    preferences: jsonb('preferences').$type<{
        diet: string[];
        allergens: string[];
        goals: string[];
    }>(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const scans = pgTable('scans', {
    id: serial('id').primaryKey(),
    userId: integer('user_id'), // Nullable for guest scans
    barcode: text('barcode'),
    productName: text('product_name'),
    ingredientsRaw: text('ingredients_raw'),
    safetyVerdict: text('safety_verdict'), // "Safe", "Caution", "Avoid"
    safetyExplanation: text('safety_explanation'),
    calories: integer('calories'),
    allergensDetected: jsonb('allergens_detected').$type<string[]>(),
    scannedAt: timestamp('scanned_at').defaultNow(),
});

export const products = pgTable('products', {
    barcode: text('barcode').primaryKey(),
    data: jsonb('data'), // Cache full OpenFoodFacts/Gemini response
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const calorieLogs = pgTable('calorie_logs', {
    id: serial('id').primaryKey(),
    userId: integer('user_id'),
    date: text('date'), // YYYY-MM-DD
    totalCalories: integer('total_calories').default(0),
    items: jsonb('items').$type<{
        name: string;
        calories: number;
        time: string;
    }[]>(),
});
