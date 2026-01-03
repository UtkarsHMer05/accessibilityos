# AccessibilityOS

**The autonomous accessibility platform that Fixes (Healer) and Verifies (Navigator) issues in real-time.**

AccessibilityOS is an AI-powered system designed to modernize web accessibility. Instead of just auditing, it actively detects, heals, and verifies accessibility violations using a hybrid approach of deterministic scanning (Axe-core) and probabilistic AI reasoning (Google Gemini 2.0 Flash).

## 🚀 Key Features

### 1. The Healer Engine (Fix)
*   **Hybrid Scanning:** Combines Axe-core's rule-based detection with Gemini's visual and semantic understanding to catch issues standard scanners miss.
*   **Auto-Fix Loop:** Automatically generates WCAG-compliant code fixes for detected issues (e.g., generating missing alt text, fixing ARIA labels).
*   **Real-time Healing:** Applies fixes instantly to the DOM in the playground environment.

### 2. The Navigator Engine (Verify)
*   **AI Verification:** Uses a separate AI context to verify if applied fixes actually solve the user experience problem.
*   **Semantic Checks:** Verifies that buttons are interactive, forms have labels, and images convey the correct meaning.

### 3. Integrated Dashboard
*   **Live Activity Feed:** Watch the system scan, fix, and verify in real-time.
*   **Health Metrics:** Track the improvement of your site's accessibility score over time.
*   **Playground:** A dedicated sandbox to paste HTML code and watch AccessibilityOS fix it live.

---

## 🛠 Tech Stack

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Language:** TypeScript
*   **AI Model:** [Google Gemini 2.0 Flash](https://deepmind.google/technologies/gemini/flash/) (via Google Generative AI SDK)
*   **Database:** PostgreSQL (via [Prisma ORM](https://www.prisma.io/))
*   **Accessibility:** Axe-core, Lighthouse
*   **Styling:** Tailwind CSS, Framer Motion

---

## 🏁 Getting Started

### Prerequisites

*   Node.js 18+ installed
*   A Google Cloud Project with the **Gemini API** enabled
*   A PostgreSQL database (local or hosted like Supabase/Neon)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/accessibilityos.git
    cd accessibilityos
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory:
    ```bash
    cp .env.example .env
    ```
    
    Add your keys:
    ```env
    # Required for AI Features
    GEMINI_API_KEY=your_google_gemini_api_key

    # Required for Database (PostgreSQL Connection String)
    DATABASE_URL="postgresql://user:password@localhost:5432/accessibilityos?schema=public"
    ```

4.  **Setup Database:**
    Push the schema to your database and seed initial data:
    ```bash
    npx prisma db push
    npx prisma db seed
    ```

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to launch AccessibilityOS.

---

## 🏗 Project Structure

*   `app/(healer)`: Routes specific to the fixing engine.
*   `app/(navigator)`: Routes specific to the verification engine.
*   `app/api`: Next.js API Routes (Backend logic).
    *   `api/healer`: Scanning and fixing endpoints.
    *   `api/navigator`: Verification endpoints.
    *   `api/integration`: Dashboard and metrics data.
*   `lib/gemini`: Gemini AI client and prompt logic.
*   `lib/accessibility`: Wrappers for Axe-core and Lighthouse.
*   `prisma`: Database schema and seed scripts.
*   `components/integration`: UI components for the dashboard (Activity Feed, Metrics).

---

## 💡 Demo Mode

The application includes a built-in "Demo Mode" for testing without live external sites.
*   Paste `DEMO MODE` in the playground or use the "Launch Live Demo" button on the landing page.
*   This triggers a simulated scan/fix loop using pre-defined broken HTML scenarios to showcase the UI capabilities.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
