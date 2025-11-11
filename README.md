# موقع شخصي بسيط (GitHub Pages)

هذا قالب موقع عربي بسيط وجاهز للنشر على **GitHub Pages**.

## التعليمات السريعة

1) أنشئ مستودعًا جديدًا على GitHub باسم `mehdik-site` (أو أي اسم).
2) ارفع هذه الملفات إلى الفرع `main`:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `favicon.svg`
3) من إعدادات المستودع **Settings → Pages**:
   - اختر **Source: Deploy from a branch**
   - اختر الفرع `main` والمجلد `/root`
   - احفظ. سيُنشَر الموقع خلال دقائق على رابط مثل:
     `https://USERNAME.github.io/REPO-NAME/`

### اسم نطاق مخصّص (اختياري)

إذا أردت ربطه بالنطاق `mehdik.site` عبر Namecheap:
1. في هذا المستودع أنشئ ملفًا باسم `CNAME` يحتوي فقط على:  
   `mehdik.site`
2. في Namecheap أضف سجلات DNS من نوع **A** نحو عناوين GitHub Pages:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
   وأضف سجل **CNAME** (للـ www) يشير إلى `USERNAME.github.io.`
3. انتظر تفعيل DNS (قد يستغرق بعض الوقت).

يمكنك تعديل النصوص من `index.html` وتخصيص الألوان في `styles.css`.
بالتوفيق!
