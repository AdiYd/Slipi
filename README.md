# Slipi - מערכת הכשרה למפיצים

מערכת הכשרה למפיצי חברת Slipi, המאפשרת גישה לתכני הכשרה, שאלות ותשובות, ומעקב אחר התקדמות.

## תכונות עיקריות

- 🔐 מערכת התחברות והרשמה מאובטחת
- 📚 תכני הכשרה מאורגנים בפרקים
- 🎥 תמיכה בסרטוני וידאו ותוכן טקסטואלי
- 💬 מערכת צ'אט לשאלות ותשובות
- 📱 ממשק משתמש מותאם למובייל
- 🌓 תמיכה במצב כהה ובהיר
- 📊 מעקב אחר התקדמות בהכשרה

## דרישות מערכת

- Node.js (גרסה 18 ומעלה)
- npm או yarn

## התקנה

1. שכפל את המאגר:
```bash
git clone https://github.com/your-username/Slipi.git
cd Slipi
```

2. התקן את התלויות:
```bash
npm install
```

3. צור קובץ `.env` בתיקיית הפרויקט:
```env
VITE_API_URL=http://your-api-url
```

4. הפעל את השרת המקומי:
```bash
npm run dev
```

האפליקציה תהיה זמינה בכתובת `http://localhost:5173`

## פיתוח

- `npm run dev` - הפעל שרת פיתוח
- `npm run build` - בנה את האפליקציה
- `npm run preview` - תצוגה מקדימה של הגרסה הבנויה
- `npm run lint` - בדיקת קוד

## טכנולוגיות

- React.js
- TypeScript
- Tailwind CSS
- Ant Design
- React Router
- Axios
- Framer Motion

## מבנה הפרויקט

```
src/
├── components/     # רכיבים משותפים
├── contexts/      # React Contexts
├── pages/         # דפי האפליקציה
├── styles/        # קבצי סגנון
└── utils/         # פונקציות עזר
```

## תרומה לפרויקט

1. צור fork של המאגר
2. צור branch חדש (`git checkout -b feature/amazing-feature`)
3. בצע commit לשינויים (`git commit -m 'Add some amazing feature'`)
4. דחוף ל-branch (`git push origin feature/amazing-feature`)
5. פתח Pull Request

## רישיון

פרויקט זה מופץ תחת רישיון MIT. ראה את קובץ `LICENSE` לפרטים נוספים. 