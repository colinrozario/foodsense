# FoodSense AI

**Decode Your Food with AI-Powered Intelligence.**

FoodSense AI is a modern web application that helps you make healthier food choices by scanning product barcodes or analyzing nutrition labels using advanced AI. It provides clear "SAFE", "CAUTION", or "AVOID" verdicts based on ingredients and nutritional value.

![FoodSense AI Banner](https://placeholder-for-banner.com)

## Features

- **Barcode Scanning**: Instantly fetch product details from OpenFoodFacts.
- **Label Analysis**: Capture photos of nutrition labels; Gemini AI extracts and analyzes the text.
- **AI Verdicts**: Get simple, plain-English explanations of why a product is good or bad for you.
- **Real-time Feedback**: Instant analysis with visual risk levels (Low, Medium, High).
- **Premium UI**: A sleek, dark-mode interface built with Glassmorphism and smooth animations.

## Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **AI Model**: [Google Gemini 1.5 Flash](https://deepmind.google/technologies/gemini/)
- **Data Source**: [OpenFoodFacts API](https://world.openfoodfacts.org/)
- **Http Client**: HttpX

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Camera/Scanning**: `react-webcam`, `react-zxing`

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- A **Google Gemini API Key** (Get it [here](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/foodsense-ai.git
cd foodsense-ai
```

### 2. Backend Setup
Navigate to the backend directory and set up the Python environment.

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Environment Variables:**
Create a `.env` file in the `backend` folder:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory.

```bash
cd frontend

# Install dependencies
npm install
```

## Running the Application

You need to run both the backend and frontend servers.

**Terminal 1 (Backend):**
```bash
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Open your browser and visit **`http://localhost:5173`** to use the app!

## Usage
1.  **Grant Camera Permissions**: The app requires access to your camera.
2.  **Scan a Barcode**: Point the camera at a product barcode.
3.  **Capture a Label**: Switch to "Label" mode and snap a picture of the ingredients list.
4.  **View Verdict**: Read the AI-generated analysis and decide if you want to eat it!

## License
MIT License.
