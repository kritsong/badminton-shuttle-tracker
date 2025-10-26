<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1e48GUTKaaJzo_eYL759pc2qNvt-esDqJ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional) Enable Google Sheets sync by adding the following to `.env.local`:
   ```
   VITE_SHEETS_URL=https://script.google.com/macros/s/AKfycbzoVzcksgUc7mh8JDOxppmreaMXl5snvKHgIzQRFXuqshn25emfLKrz62Bv2ieuRwKx-Q/exec
   # VITE_SHEETS_SECRET=your-shared-secret (if your Apps Script expects one)
   # VITE_RECAPTCHA_SITE_KEY=your-site-key (if using reCAPTCHA)
   ```
4. Run the app:
   `npm run dev`
