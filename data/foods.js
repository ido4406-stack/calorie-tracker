// ערכים לכל 100 גרם — מקור: USDA FoodData Central
export const FOOD_DB = [
  // פירות
  { name: 'תפוח', calories: 52, protein: 0.3, category: 'פירות' },
  { name: 'בננה', calories: 89, protein: 1.1, category: 'פירות' },
  { name: 'תפוז', calories: 47, protein: 0.9, category: 'פירות' },
  { name: 'אבטיח', calories: 30, protein: 0.6, category: 'פירות' },
  { name: 'ענבים', calories: 69, protein: 0.7, category: 'פירות' },
  { name: 'אגס', calories: 57, protein: 0.4, category: 'פירות' },
  { name: 'מנגו', calories: 60, protein: 0.8, category: 'פירות' },
  { name: 'תות שדה', calories: 32, protein: 0.7, category: 'פירות' },
  { name: 'אפרסק', calories: 39, protein: 0.9, category: 'פירות' },
  { name: 'קלמנטינה', calories: 47, protein: 0.9, category: 'פירות' },
  { name: 'אנטס (מלון)', calories: 34, protein: 0.8, category: 'פירות' },
  { name: 'קיווי', calories: 61, protein: 1.1, category: 'פירות' },

  // ירקות
  { name: 'עגבנייה', calories: 18, protein: 0.9, category: 'ירקות' },
  { name: 'מלפפון', calories: 16, protein: 0.7, category: 'ירקות' },
  { name: 'גזר', calories: 41, protein: 0.9, category: 'ירקות' },
  { name: 'פלפל אדום', calories: 31, protein: 1.0, category: 'ירקות' },
  { name: 'פלפל ירוק', calories: 20, protein: 0.9, category: 'ירקות' },
  { name: 'חסה', calories: 15, protein: 1.4, category: 'ירקות' },
  { name: 'ברוקולי', calories: 34, protein: 2.8, category: 'ירקות' },
  { name: 'תירס', calories: 86, protein: 3.3, category: 'ירקות' },
  { name: 'בצל', calories: 40, protein: 1.1, category: 'ירקות' },
  { name: 'תפוח אדמה', calories: 77, protein: 2.0, category: 'ירקות' },
  { name: 'בטטה', calories: 86, protein: 1.6, category: 'ירקות' },
  { name: 'חציל', calories: 25, protein: 1.0, category: 'ירקות' },
  { name: 'קישוא', calories: 17, protein: 1.2, category: 'ירקות' },
  { name: 'תרד', calories: 23, protein: 2.9, category: 'ירקות' },
  { name: 'כרובית', calories: 25, protein: 1.9, category: 'ירקות' },
  { name: 'כרוב', calories: 25, protein: 1.3, category: 'ירקות' },
  { name: 'אספרגוס', calories: 20, protein: 2.2, category: 'ירקות' },

  // לחם ודגנים
  { name: 'לחם לבן', calories: 265, protein: 9.0, category: 'לחם ודגנים' },
  { name: 'לחם מחיטה מלאה', calories: 247, protein: 13.0, category: 'לחם ודגנים' },
  { name: 'פיתה לבנה', calories: 275, protein: 9.1, category: 'לחם ודגנים' },
  { name: 'פיתה מחיטה מלאה', calories: 256, protein: 10.5, category: 'לחם ודגנים' },
  { name: 'לחמנייה', calories: 280, protein: 9.4, category: 'לחם ודגנים' },
  { name: 'אורז לבן מבושל', calories: 130, protein: 2.7, category: 'לחם ודגנים' },
  { name: 'אורז מלא מבושל', calories: 123, protein: 2.6, category: 'לחם ודגנים' },
  { name: 'פסטה מבושלת', calories: 158, protein: 5.8, category: 'לחם ודגנים' },
  { name: 'קוסקוס מבושל', calories: 112, protein: 3.8, category: 'לחם ודגנים' },
  { name: 'שיבולת שועל', calories: 389, protein: 16.9, category: 'לחם ודגנים' },
  { name: 'קינואה מבושלת', calories: 120, protein: 4.4, category: 'לחם ודגנים' },
  { name: 'קרקר', calories: 420, protein: 8.0, category: 'לחם ודגנים' },
  { name: 'בייגלה', calories: 329, protein: 9.4, category: 'לחם ודגנים' },

  // חלב וגבינות
  { name: 'חלב 3%', calories: 61, protein: 3.2, category: 'חלב וגבינות' },
  { name: 'חלב 1%', calories: 42, protein: 3.4, category: 'חלב וגבינות' },
  { name: 'יוגורט 3%', calories: 61, protein: 3.5, category: 'חלב וגבינות' },
  { name: 'יוגורט 0%', calories: 40, protein: 4.0, category: 'חלב וגבינות' },
  { name: 'גבינה לבנה 5%', calories: 90, protein: 11.0, category: 'חלב וגבינות' },
  { name: 'גבינה לבנה 9%', calories: 113, protein: 10.5, category: 'חלב וגבינות' },
  { name: 'גבינה צהובה 28%', calories: 364, protein: 25.0, category: 'חלב וגבינות' },
  { name: 'קוטג׳ 5%', calories: 72, protein: 11.0, category: 'חלב וגבינות' },
  { name: 'שמנת חמוצה 15%', calories: 135, protein: 3.4, category: 'חלב וגבינות' },
  { name: 'גבינה בולגרית', calories: 250, protein: 14.0, category: 'חלב וגבינות' },
  { name: 'לאבנה', calories: 104, protein: 7.0, category: 'חלב וגבינות' },
  { name: 'גבינת ריקוטה', calories: 174, protein: 11.3, category: 'חלב וגבינות' },
  { name: 'גבינת מוצרלה', calories: 280, protein: 28.0, category: 'חלב וגבינות' },

  // ביצים
  { name: 'ביצה שלמה', calories: 155, protein: 13.0, category: 'ביצים' },
  { name: 'חלבון ביצה', calories: 52, protein: 11.0, category: 'ביצים' },
  { name: 'חביתה', calories: 185, protein: 14.0, category: 'ביצים' },

  // עוף
  { name: 'חזה עוף (ללא עור)', calories: 165, protein: 31.0, category: 'עוף' },
  { name: 'שוק עוף (ללא עור)', calories: 175, protein: 25.0, category: 'עוף' },
  { name: 'שוק עוף (עם עור)', calories: 215, protein: 22.0, category: 'עוף' },
  { name: 'כנף עוף', calories: 203, protein: 19.0, category: 'עוף' },
  { name: 'עוף טחון (7%)', calories: 170, protein: 22.0, category: 'עוף' },
  { name: 'שניצל עוף', calories: 220, protein: 22.0, category: 'עוף' },
  { name: 'חזה הודו', calories: 135, protein: 30.0, category: 'עוף' },
  { name: 'הודו טחון', calories: 170, protein: 21.0, category: 'עוף' },
  { name: 'ברווז', calories: 201, protein: 18.0, category: 'עוף' },

  // בשר בקר
  { name: 'אנטריקוט בקר', calories: 291, protein: 25.0, category: 'בשר בקר' },
  { name: 'פילה בקר', calories: 250, protein: 28.0, category: 'בשר בקר' },
  { name: 'צלעות בקר', calories: 294, protein: 24.0, category: 'בשר בקר' },
  { name: 'בשר בקר טחון 15%', calories: 215, protein: 26.0, category: 'בשר בקר' },
  { name: 'בשר בקר טחון 5%', calories: 152, protein: 26.0, category: 'בשר בקר' },
  { name: 'כבד בקר', calories: 135, protein: 20.0, category: 'בשר בקר' },
  { name: 'שייטל בקר', calories: 210, protein: 27.0, category: 'בשר בקר' },
  { name: 'שפונדרה בקר', calories: 280, protein: 18.0, category: 'בשר בקר' },

  // בשר כבש
  { name: 'קציצות כבש', calories: 283, protein: 25.0, category: 'בשר כבש' },
  { name: 'חזה כבש', calories: 294, protein: 25.0, category: 'בשר כבש' },
  { name: 'כבש טחון', calories: 258, protein: 25.0, category: 'בשר כבש' },

  // דגים ופירות ים
  { name: 'סלמון טרי', calories: 208, protein: 20.0, category: 'דגים' },
  { name: 'טונה בפחית (במים)', calories: 100, protein: 25.0, category: 'דגים' },
  { name: 'טונה בפחית (בשמן)', calories: 190, protein: 22.0, category: 'דגים' },
  { name: 'דג ים (לברק)', calories: 124, protein: 23.0, category: 'דגים' },
  { name: 'דג בורי', calories: 117, protein: 22.0, category: 'דגים' },
  { name: 'בקלה', calories: 82, protein: 18.0, category: 'דגים' },
  { name: 'מוסר ים', calories: 117, protein: 21.0, category: 'דגים' },
  { name: 'סרדינים בפחית', calories: 208, protein: 24.0, category: 'דגים' },
  { name: 'טילפיה', calories: 96, protein: 20.0, category: 'דגים' },
  { name: 'שרימפס', calories: 99, protein: 24.0, category: 'דגים' },

  // קטניות
  { name: 'חומוס מבושל', calories: 164, protein: 8.9, category: 'קטניות' },
  { name: 'עדשים כתומות מבושלות', calories: 116, protein: 9.0, category: 'קטניות' },
  { name: 'עדשים שחורות מבושלות', calories: 116, protein: 9.0, category: 'קטניות' },
  { name: 'שעועית שחורה מבושלת', calories: 132, protein: 8.9, category: 'קטניות' },
  { name: 'שעועית לבנה מבושלת', calories: 127, protein: 8.7, category: 'קטניות' },
  { name: 'אפונה ירוקה', calories: 81, protein: 5.4, category: 'קטניות' },
  { name: 'טופו רגיל', calories: 76, protein: 8.1, category: 'קטניות' },
  { name: 'טופו קשה', calories: 144, protein: 17.3, category: 'קטניות' },
  { name: 'אדממה', calories: 121, protein: 11.9, category: 'קטניות' },
  { name: 'ממרח חומוס', calories: 166, protein: 7.9, category: 'קטניות' },

  // שומנים ואגוזים
  { name: 'שמן זית', calories: 884, protein: 0.0, category: 'שומנים ואגוזים' },
  { name: 'שמן קוקוס', calories: 862, protein: 0.0, category: 'שומנים ואגוזים' },
  { name: 'חמאה', calories: 717, protein: 0.9, category: 'שומנים ואגוזים' },
  { name: 'אבוקדו', calories: 160, protein: 2.0, category: 'שומנים ואגוזים' },
  { name: 'טחינה גולמית', calories: 570, protein: 17.0, category: 'שומנים ואגוזים' },
  { name: 'שקדים', calories: 579, protein: 21.2, category: 'שומנים ואגוזים' },
  { name: 'אגוזי מלך', calories: 654, protein: 15.2, category: 'שומנים ואגוזים' },
  { name: 'בוטנים', calories: 567, protein: 25.8, category: 'שומנים ואגוזים' },
  { name: 'חמאת בוטנים', calories: 588, protein: 25.0, category: 'שומנים ואגוזים' },
  { name: 'קשיו', calories: 553, protein: 18.2, category: 'שומנים ואגוזים' },
  { name: 'גרעיני דלעת', calories: 559, protein: 30.2, category: 'שומנים ואגוזים' },
  { name: 'גרעיני חמנייה', calories: 584, protein: 20.8, category: 'שומנים ואגוזים' },

  // חטיפים ומתוקים
  { name: 'שוקולד מריר 70%', calories: 546, protein: 5.0, category: 'חטיפים ומתוקים' },
  { name: 'שוקולד חלב', calories: 535, protein: 7.7, category: 'חטיפים ומתוקים' },
  { name: 'צ׳יפס', calories: 536, protein: 7.0, category: 'חטיפים ומתוקים' },
  { name: 'פופקורן', calories: 375, protein: 11.7, category: 'חטיפים ומתוקים' },
  { name: 'גלידת וניל', calories: 207, protein: 3.5, category: 'חטיפים ומתוקים' },
  { name: 'עוגת שוקולד', calories: 371, protein: 5.1, category: 'חטיפים ומתוקים' },
  { name: 'דונאט', calories: 452, protein: 5.8, category: 'חטיפים ומתוקים' },
  { name: 'ביסקוויט', calories: 480, protein: 6.0, category: 'חטיפים ומתוקים' },
  { name: 'אוריאו', calories: 471, protein: 5.0, category: 'חטיפים ומתוקים' },

  // שתייה (לכל 100ml)
  { name: 'קפה שחור', calories: 2, protein: 0.3, category: 'שתייה' },
  { name: 'חלב לקפה (3%)', calories: 61, protein: 3.2, category: 'שתייה' },
  { name: 'מיץ תפוזים סחוט', calories: 45, protein: 0.7, category: 'שתייה' },
  { name: 'קולה', calories: 42, protein: 0.0, category: 'שתייה' },
  { name: 'בירה', calories: 43, protein: 0.5, category: 'שתייה' },
  { name: 'יין אדום', calories: 85, protein: 0.1, category: 'שתייה' },
  { name: 'מיץ ענבים', calories: 60, protein: 0.4, category: 'שתייה' },

  // אוכל ישראלי
  { name: 'פלאפל (כדור)', calories: 57, protein: 2.3, category: 'אוכל ישראלי' },
  { name: 'שקשוקה', calories: 110, protein: 7.5, category: 'אוכל ישראלי' },
  { name: 'טחינה מוכנה', calories: 306, protein: 9.0, category: 'אוכל ישראלי' },
  { name: 'סלט ישראלי', calories: 55, protein: 1.5, category: 'אוכל ישראלי' },
  { name: 'חציל קלוי (בבא גנוש)', calories: 57, protein: 1.5, category: 'אוכל ישראלי' },
  { name: 'בורקס גבינה', calories: 350, protein: 9.0, category: 'אוכל ישראלי' },
  { name: 'שווארמה עוף', calories: 190, protein: 22.0, category: 'אוכל ישראלי' },
  { name: 'פיצה מרגריטה', calories: 266, protein: 11.0, category: 'אוכל ישראלי' },

  // תוספי תזונה
  { name: 'אבקת חלבון (ממוצע)', calories: 370, protein: 75.0, category: 'תוספי תזונה' },
  { name: 'יוגורט יווני', calories: 59, protein: 10.0, category: 'תוספי תזונה' },
  { name: 'פרוטאין בר (ממוצע)', calories: 350, protein: 30.0, category: 'תוספי תזונה' },
];

export const CATEGORIES = [...new Set(FOOD_DB.map(f => f.category))];
