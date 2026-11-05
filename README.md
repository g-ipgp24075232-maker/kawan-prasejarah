# 🪨 KAWAN PRASEJARAH — Interactive Talking Avatar

A **new, standalone** Year 4 Malaysian History learning website. A friendly original layered-SVG prehistoric human called **Aki** responds to touch, answers preset Malay questions, and allows live teacher editing. This is **not** the Ice Age virtual library. No paid AI services are required.

## What works

- Animated original 2D character: blinking, idle breathing, speaking mouth, head tilting, hand waving, jumping, laughing, clapping and reacting to head, face, belly, arms and feet touch.
- Malay speech recognition (`ms-MY`) **when supported by the browser** and typed questions on every browser. Malay speech synthesis only when a Malay voice exists. Otherwise, answers remain readable; browser compatibility is explicitly shown.
- Search across main questions, alternatives, keywords and Malay spelling variants. If a question is unknown, Aki gives a preset fallback; ambiguous questions request clarification.
- 40 initial editable questions: 10 each about Paleolitik, Mesolitik, Neolitik and Logam. 12 initial editable quizzes.
- Live Guru Mode: add/edit/duplicate/delete/test questions, edit quizzes and avatar appearance, change artwork or backdrop, test voice, export/import JSON. Edits are immediately effective on the same device.
- By default, no server needed: localStorage with JSON backup. **Local edits do not sync to other devices.**
- Optional, secure Supabase publication: approved teacher accounts publish data, pupils read published data. No GitHub commit needed for teacher content changes. RLS prevents pupils from modifying the published database.

## Run locally

Requires Node.js 20 or later (22 recommended).

```bash
npm install
npm run dev
```

Open the URL shown by Vite. To verify the build and tests:

```bash
npm test
npm run build
```

## Publish to a *new* GitHub repository

1. On GitHub, choose **New repository** and name it `kawan-prasejarah` (or another name). Do **not** reuse `ice-age-virtual-library`.
2. Upload the contents of this project at the repository root, including `.github/workflows/deploy.yml`. (A lockfile will be generated at the first npm install.) Commit to `main`.
3. On GitHub, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Push another commit if needed or run the `Deploy to GitHub Pages` workflow manually.
5. Access `https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME/` after the workflow succeeds. The build automatically sets the correct Pages base URL from `GITHUB_REPOSITORY`.

**Note:** A code project or exported ZIP is **not** yet live or published. A new GitHub repository and successful Pages deployment are required. A JSON export is a *content backup*, not a deployment.

## Teacher editing: local vs online

**Local:** Click *Mod Guru*. On first use, set a personal PIN (at least 4 characters). The PIN is only a convenience lock against accidental edits on that browser; it does not secure a server or other users' browsers. All teacher edits are reflected in the running page instantly. The page saves the draft in this browser. Download JSON regularly; if browser storage is cleared, local changes may be lost. Uploaded images are limited to 1 MB each to reduce storage pressure. Teachers can import the JSON on another device.

**Online:** Configure Supabase below, then log in using an authorized teacher account. Edit locally, then click *Terbitkan*. Pupils on other devices will receive updates live when Supabase Realtime is enabled, or on their next page load as a fallback. A student device does **not** have the teacher's unpublished local draft, and the database cannot be written to without valid teacher authentication and RLS permission.

> For privacy and security, do not share teacher passwords, PINs, secret keys or private pupil data in the question database.

## Optional Supabase setup

1. Create a Supabase project and run `supabase/schema.sql` in SQL Editor **once**. (If rerunning, review duplicate policies first.)
2. In Supabase Authentication, create your teacher account and copy the user's UUID.
3. In SQL Editor, run:

```sql
insert into public.teacher_permissions (user_id)
values ('REPLACE_WITH_ACTUAL_TEACHER_USER_UUID')
on conflict (user_id) do nothing;
```

4. Put **only** the public project URL and **anon/publishable key** into a root `.env.local` file for local development:

```dotenv
VITE_SUPABASE_URL=https://YOURPROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
```

5. For GitHub Pages, add corresponding **GitHub Actions repository variables** named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Settings → Secrets and variables → Actions → Variables**. These values are public client configuration, **not** service-role keys.
6. Build/deploy the app. Set the **Site URL** and allowed redirect URLs in Supabase Authentication as appropriate for your Pages URL. Log in via *Mod Guru → Guru Dalam Talian* and use *Terbitkan*.
7. On page load, pupils without a local teacher draft fetch the latest published knowledge. Edits saved only in the local browser remain private until *Terbitkan* is clicked.

**Security:** Row Level Security allows `anon` to read only the approved published document. Only logged-in allowlisted teachers can insert/update. Never expose a Supabase service-role key in browser code, `.env`, or GitHub Actions public environment variables.

## Character artwork

The default avatar is an actual drawn layered SVG, not a still picture. It has separately animated head, face, eyebrows, eyes, eyelids, mouth, torso, arms, legs and feet. It works without image downloads. In Guru Mode you can edit colors, width (270–580 px), horizontal position, background image, text and reactions. You can also upload a whole transparent character picture; **a single uploaded image will only move as one piece and cannot provide real lip-sync/articulation.** For component-level animation upload transparent individual head, body, left/right arms, legs, or mouth illustrations as separate layer images; positioning assumes the puppet's default rig geometry. For best results, use the original fully articulated SVG.

## Browser and accessibility limitations

- Web Speech Recognition support varies. Some browser implementations may use a remote recognition service, even though the project does not use a paid AI API. `localhost` or an HTTPS website is usually needed for microphone permission.
- Voice availability comes from the operating system/browser. Some devices have no `ms-MY` TTS voice. In that case the app clearly says so and displays answers as text. It **does not pretend** that a Malay voice exists.
- Browser speech synthesis mouth movement is animation synchronized to speaking state, not phoneme-by-phoneme lip syncing.
- Student questions are matched only to teacher-approved entries. There is **no generative chatbot**; unsupported questions receive the predefined fallback.
- Audio playback generally requires an interaction first. Opening the webpage will not force autoplay.
- Online updates use Supabase Realtime subscriptions when the SQL publication is enabled; refreshing the page is a reliable fallback.

## How to change the code

`src/components/Avatar.tsx` and `src/styles.css` contain the editable drawn avatar and animation styles. `src/data/seed.ts` holds initial questions and quizzes. `src/lib/matcher.ts` contains local matching rules; `src/lib/speech.ts` handles browser audio; `src/components/TeacherPanel.tsx` contains the teacher editor. `supabase/schema.sql` contains the online authorization policies.


## 🎙️ Suara manusia sebenar untuk jawapan (kemas kini)

Aki **boleh bercakap kuat**, bukan hanya memaparkan teks.

- Masuk **Mod Guru → Bank Soalan → Edit Soalan**.
- Dalam bahagian **Suara Jawapan Manusia**, tekan **Rakam Dengan Mikrofon** atau **Muat Naik Audio** (MP3, M4A, WAV, OGG, WebM).
- Sebut jawapan dalam Bahasa Melayu, hentikan rakaman, dengar contoh, kemudian tekan **Simpan Soalan**.
- Murid boleh menaip, menyebut, atau menekan soalan cadangan. Apabila jawapan sepadan, avatar memainkan **rakaman suara cikgu dahulu** sambil menggerakkan mulut. Tekan **Ulang Jawapan** untuk mendengarnya semula.
- Tanpa rakaman, app memilih suara sintetik Bahasa Melayu yang tersedia; jika tiada tetapi suara Indonesia ada, suara Indonesia menjadi pilihan terakhir (sebutan mungkin berbeza). Jika peranti tidak menyokong suara tersebut, jawapan masih terpapar.

**Rakaman manusia ≠ suara AI.** Web Speech API menghasilkan suara sintetik dan bergantung pada pelayar/peranti. Rakaman audio pilihan guru ialah suara manusia sebenar tanpa API berbayar.

**Storan & privasi:** Rakaman dikodkan sebagai data audio dalam draf JSON dan disimpan di pelayar dahulu. Had fail ialah **700 KB setiap jawapan**; banyak rakaman boleh memenuhi kuota localStorage (~beberapa MB, bergantung pada pelayar). Gunakan MP3 mono yang pendek dan **Eksport JSON** sebagai sandaran. Jika Supabase telah disediakan, draf boleh diterbitkan dalam pangkalan data (tertakluk kepada had saiz/perkhidmatan); jika tidak, rakaman hanya tersedia di peranti yang mengimport/simpan draf. Mikrofon digunakan hanya selepas guru memberi izin; tiada audio dihantar ke API TTS berbayar. Audio pilihan guru memerlukan tindakan awal pengguna (menghantar soalan / mengklik jawapan), selaras dengan polisi autoplay pelayar.

## Bahasa Melayu Malaysia dan rupa Aki

Aki menggunakan ungkapan baku Bahasa Melayu Malaysia, dengan avatar perempuan 2D berambut panjang dan beranyam. Suara automatik memilih `ms-MY` dan cuba mengutamakan suara wanita apabila nama suara membolehkan pengesanan. Jika tiada suara `ms-MY`, guru boleh memuat naik rakaman perempuan melalui **Mod Guru → Bank Soalan**; sistem tidak menggantikan suara Malaysia dengan bahasa Indonesia. Rakaman guru diutamakan dan kekal berfungsi. Ungkapan lalai lama dalam storan dikemas kini tanpa menimpa perubahan tersuai guru. Jika guru memuat naik karya avatar tersuai, karya tersebut masih menggantikan lakaran avatar lalai.

## Pemilihan suara wanita

Aki hanya memilih suara wanita yang dapat dikenal pasti melalui nama suara pelayar. Bahasa Melayu Malaysia (`ms-MY`) sentiasa diutamakan. Jika tiada suara wanita Malaysia, suara wanita bahasa lain boleh digunakan dengan **amaran tentang sebutan**; teks jawapan tetap dalam Bahasa Melayu Malaysia. Tiada suara lelaki dipilih secara automatik. Guru boleh memilih dan mendengar contoh suara tanpa label jantina melalui **Mod Guru → Avatar → Suara Bahasa Melayu Malaysia → Uji Ucapan**, atau memuat naik rakaman wanita untuk setiap jawapan di Bank Soalan. API pelayar tidak menyediakan metadata jantina, jadi suara yang tiada label perlu disahkan dengan pendengaran.
