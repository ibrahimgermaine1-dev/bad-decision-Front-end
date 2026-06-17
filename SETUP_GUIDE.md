# Bad Decision: Setup Guide

A step by step guide to put Bad Decision on the internet. You do not need to know how to code. You only need to follow these steps in order. If a step fails, stop and fix it before moving on.

> Read this whole page once before you click anything. Then start at Step 1.

---

## What you will build

Bad Decision is a B2B lead intelligence platform. It has 3 parts:

1. A **database** that stores users, credits, tasks, and leads. The database is called **Supabase**.
2. A **backend** that runs the search engines and AI. The backend lives on **Render**.
3. A **frontend** that the user sees in their browser. The frontend lives on **Vercel**.

You will also sign up for 4 helper services that give the app its power:

- **Clerk** handles user sign up and log in.
- **Paystack** handles credit card payments.
- **DeepSeek** is the AI brain that reads leads.
- **Serper.dev** does Google searches for the app.
- **OpenStreetMap** gives free map data. No account needed.

At the end, you will have a working website at:
`https://bad-decision-front-end.vercel.app`

---

## What you need before you start

You need:

1. A computer with internet.
2. An email address you can check.
3. A phone number (Paystack and Clerk may text a code).
4. A GitHub account. Sign up free at `https://github.com`.
5. About 2 hours of free time.
6. A place to write down long keys. Use a text file on your computer. Save it as `secrets.txt`. Do NOT share this file with anyone.

> Tip: Open `secrets.txt` now. Every time this guide says "copy the key", paste it into `secrets.txt` with a label. For example: `Supabase URL: https://abcd.supabase.co`.

> Important: The 2 GitHub repos already exist. You do not need to make them. The frontend repo is at `https://github.com/ibrahimgermaine1-dev/bad-decision-Front-end`. The backend repo is at `https://github.com/decisionsai40-lgtm/bad-decision-backend`.

---

## The 9 Big Steps

Here is the order. Do them in this exact order. Some steps give you keys that later steps need.

1. Make a Supabase project (gives you 3 keys).
2. Make a Clerk app (gives you 3 keys).
3. Make a Paystack account (gives you 3 keys).
4. Get a DeepSeek API key (gives you 1 key).
5. Get a Serper.dev API key (gives you 1 key).
6. Set up OpenStreetMap (no key needed, just 2 values).
7. Make the Render backend (uses keys from steps 1, 4, 5, 6).
8. Make the Vercel frontend (uses keys from steps 1, 2, 3, 7).
9. Test the full flow end to end.

You are now ready. Take a breath. Start Step 1.

---

# Step 1. Make a Supabase project

Supabase is the database. It holds your users, their credits, their tasks, and their leads.

## 1.1 Sign up for Supabase

1. Open a new browser tab. Go to `https://supabase.com`.
2. Click the **Sign Up** button in the top right.
3. Click **Continue with GitHub**. (You can also use email. GitHub is faster.)
4. Authorize Supabase to use your GitHub account. Click the green **Authorize** button.
5. Supabase will ask for your organization name. Type `Bad Decision`.
6. Click **Create organization**.

Expected result: You see a dashboard that says "Create a new project".

## 1.2 Create a new project

1. Click the green **New Project** button.
2. In the **Name** field, type: `bad-decision-prod`
3. In the **Database Password** field, click the **Generate a password** link. A long password will appear.
4. Click the **Copy** icon next to the password. Paste it into `secrets.txt` with the label: `Supabase DB password:`
5. In the **Region** dropdown, pick the region closest to your users. For Nigeria and West Africa, pick **Frankfurt, EU Central-1**. For the US, pick **North Virginia, US East 1**.
6. In the **Pricing Plan** dropdown, leave it on **Free**.
7. Click the green **Create new project** button at the bottom.

Expected result: A page says "Creating your project". A spinner spins. Wait about 2 to 3 minutes. Do not close the tab.

When it is done, you will see a dashboard with a left sidebar that has icons for Table Editor, SQL Editor, and others.

## 1.3 Get your 3 Supabase keys

1. In the left sidebar, click the gear icon labeled **Settings**.
2. Click **API** in the submenu.
3. You will see 3 important values on the right. Copy each one and save it to `secrets.txt`:

   a. **Project URL**. It looks like `https://abcd1234.supabase.co`. Copy it. Save as:
      `Supabase URL: https://abcd1234.supabase.co`

   b. **anon public** key. It is a very long string that starts with `eyJ`. Copy the whole thing. Save as:
      `Supabase anon key: eyJ...long string...`

   c. **service_role** key. It is also very long and starts with `eyJ`. Copy the whole thing. Save as:
      `Supabase service_role key: eyJ...long string...`

> Warning: The service_role key is the master key. It can read and write anything in your database. Never paste it into chat. Never put it in a public GitHub file. Only put it where this guide tells you to.

Expected result: `secrets.txt` now has 3 Supabase values.

## 1.4 Run the schema SQL

The database is empty. You must create the tables. There are 7 tables to make:
`profiles`, `credit_balances`, `credit_transactions`, `tasks`, `global_intelligence_cache`, `smart_collections`, `workspace_leads`.

The file `schema.sql` in the backend repo has all the SQL. You will copy it into Supabase.

1. Open a new browser tab. Go to `https://github.com/decisionsai40-lgtm/bad-decision-backend`.
2. In the list of files, click **schema.sql**.
3. Click the **Copy raw file** button in the top right of the file view. (It looks like 2 squares.) The whole file is now copied. It is about 522 lines.
4. Go back to your Supabase tab.
5. In the left sidebar, click **SQL Editor**. (It looks like a `>` icon.)
6. Click the green **New query** button.
7. Click inside the big white text box. Press `Ctrl+A` (Windows) or `Cmd+A` (Mac) to select any placeholder text. Press Delete.
8. Press `Ctrl+V` (Windows) or `Cmd+V` (Mac) to paste the SQL.
9. Click the green **Run** button at the bottom. (It has a play icon.)

Expected result: In the bottom panel you see green text that says `Success. No rows returned`. The whole SQL ran with no errors.

## 1.5 Verify the 7 tables were made

1. In the left sidebar, click **Table Editor**. (It looks like a grid icon.)
2. Look at the list under "Tables" on the left side. You should see these 7 tables:
   - `profiles`
   - `credit_balances`
   - `credit_transactions`
   - `tasks`
   - `global_intelligence_cache`
   - `smart_collections`
   - `workspace_leads`

Expected result: All 7 tables show in the list. Click each one. Each one opens with column names at the top. They are empty (no rows yet). That is correct.

> If a table is missing, go back to step 1.4 and run the SQL again. Make sure you copied the whole file.

You are done with Supabase. Move to Step 2.

---

# Step 2. Make a Clerk app

Clerk handles sign up, log in, and user accounts.

## 2.1 Sign up for Clerk

1. Open a new browser tab. Go to `https://clerk.com`.
2. Click the **Sign up** button in the top right.
3. Click **Continue with GitHub**. Authorize Clerk.
4. Type your organization name: `Bad Decision`. Click **Create organization**.

Expected result: You see a Clerk dashboard that says "Create application".

## 2.2 Create a new application

1. Click the **Create Application** button.
2. In the application name field, type: `bad-decision-prod`
3. Pick **Email address** as the sign in method. (You can add Google and others later.)
4. Click the **Create application** button at the bottom.

Expected result: A dashboard appears with a left sidebar. You see "Home", "Users", "API Keys", and other items.

## 2.3 Switch to the Production environment

Clerk gives you 2 environments: **Development** and **Production**. We will use Production only.

1. In the top right of the page, you see a dropdown that says **Development**. Click it.
2. In the menu that opens, click **Production**.
3. A popup may ask you to confirm. Click **Switch to Production**.

Expected result: The dropdown in the top right now says **Production**.

## 2.4 Set the production domain

1. In the left sidebar, click **Domains** under the "Configure" section.
2. Click the **Add Domain** button.
3. In the field that appears, type: `bad-decision-front-end.vercel.app`
   (Do not type `https://`. Clerk adds it for you.)
4. Click the **Add** button.
5. Leave the page open. You do not need to verify DNS yet. Vercel will set it up later.

Expected result: The domain `bad-decision-front-end.vercel.app` shows in your domain list with a small "Production" tag.

## 2.5 Copy your Clerk keys

1. In the left sidebar, click **API Keys**.
2. Make sure the environment dropdown at the top still says **Production**.
3. You will see 2 important keys. Copy each one to `secrets.txt`:

   a. **Publishable key**. It starts with `pk_live_`. Copy it. Save as:
      `Clerk publishable key: pk_live_...`

   b. **Secret key**. It starts with `sk_live_`. Click the **Eye** icon to reveal it. Copy it. Save as:
      `Clerk secret key: sk_live_...`

> Warning: The secret key (`sk_live_`) is very powerful. Never share it. Never put it in a public GitHub file.

Expected result: `secrets.txt` now has 2 Clerk keys (pk_live and sk_live).

## 2.6 Make the Clerk webhook

A webhook is a way for Clerk to tell your website when a new user signs up. Your website needs to know so it can give the user 50 free credits.

1. In the left sidebar, scroll to "Developers" and click **Webhooks**.
2. Click the **+ Add Endpoint** button.
3. In the **Endpoint URL** field, type:
   `https://bad-decision-front-end.vercel.app/api/webhooks/clerk`
4. In the **Events** section, find **user**. Click the arrow to expand it.
5. Find the row that says `user.created`. Click the small checkbox next to it. (Only this one. Leave the others unchecked.)
6. Click the **Create Endpoint** button at the bottom.

Expected result: A page opens showing your new endpoint. It has a section called **Signing Secret**.

## 2.7 Copy the webhook signing secret

1. On the endpoint page, find the **Signing Secret** section.
2. Click the **Copy** button next to the secret. The secret starts with `whsec_`.
3. Paste it into `secrets.txt` as:
   `Clerk webhook secret: whsec_...`

Expected result: `secrets.txt` now has 3 Clerk values (pk_live, sk_live, whsec).

You are done with Clerk. Move to Step 3.

---

# Step 3. Make a Paystack account

Paystack handles payments. Users will buy credits with their card through Paystack.

## 3.1 Sign up for Paystack

1. Open a new browser tab. Go to `https://paystack.com`.
2. Click the **Create free account** button in the top right.
3. In the form, type:
   - **First name**: your first name
   - **Last name**: your last name
   - **Business name**: `Bad Decision`
   - **Email**: your email
   - **Phone**: your phone number
   - **Password**: a strong password (save it in `secrets.txt` as `Paystack password:`)
4. Click **Create account**.
5. Paystack will send a code to your email. Type the code in the box. Click **Verify**.

Expected result: You are inside the Paystack dashboard. You see a top bar with **Dashboard**, **Transactions**, **Customers**, and **Settings**.

## 3.2 Complete business verification

Paystack requires you to verify your business before you can charge real cards. The dashboard will show a checklist. Follow it. You will need:

- A business name (you already typed it: `Bad Decision`).
- A business website. Type: `https://bad-decision-front-end.vercel.app`
- A bank account for payouts.
- A business document (like a registration form) and a means of ID.

> If you are still testing, Paystack gives you a **Test mode** that works without verification. Click the toggle in the top right that says **Test mode** to switch to test keys. The test keys start with `pk_test_` and `sk_test_`. The setup is the same. The instructions below assume you are using **Live mode** (real keys). Use the same steps for Test mode if you are still testing.

Expected result: The dashboard top right shows **Live mode** and your business name.

## 3.3 Copy your Paystack API keys

1. Click **Settings** in the top right.
2. In the left menu, click **API Keys & Webhooks**.
3. You will see 2 important keys. Copy each one to `secrets.txt`:

   a. **Public Key**. It starts with `pk_live_`. Copy it. Save as:
      `Paystack public key: pk_live_...`

   b. **Secret Key**. It starts with `sk_live_`. Click the eye icon to reveal it. Copy it. Save as:
      `Paystack secret key: sk_live_...`

Expected result: `secrets.txt` now has 2 Paystack keys (pk_live and sk_live).

## 3.4 Add the Paystack webhook

1. Still on the **API Keys & Webhooks** page, scroll down to the **Webhooks** section.
2. Click the **Add Webhook URL** button. (It may be a plus icon or a button labeled **Add**.)
3. In the **Webhook URL** field, type:
   `https://bad-decision-front-end.vercel.app/api/webhooks/paystack`
4. Leave the events to send as **All events** or **Charge success**. (Both work. All events is safer.)
5. Click **Save** or **Create**.

Expected result: The webhook URL appears in the list. Paystack shows a **Signature Secret** next to it.

## 3.5 Copy the Paystack webhook secret

1. Find the row for your new webhook.
2. Look for a field labeled **Secret Key** or **Signature Secret**. It is a long string.
3. Click the **Copy** button next to it.
4. Paste it into `secrets.txt` as:
   `Paystack webhook secret: ...long string...`

> If Paystack shows you a Paystack webhook secret only after the first webhook fires, do not worry. You can come back later. For now, leave the secret field blank in `secrets.txt` and add a placeholder: `Paystack webhook secret: PENDING`.

Expected result: `secrets.txt` now has 3 Paystack values (pk_live, sk_live, webhook secret).

You are done with Paystack. Move to Step 4.

---

# Step 4. Get a DeepSeek API key

DeepSeek is the AI brain. It reads the leads and decides if they are real.

## 4.1 Sign up for DeepSeek

1. Open a new browser tab. Go to `https://platform.deepseek.com`.
2. Click **Sign up** in the top right. Use Google or your email.
3. Confirm your email if asked.

Expected result: You are inside the DeepSeek platform dashboard.

## 4.2 Add billing (you must add money)

DeepSeek is not free. You must add at least $5 to your account.

1. In the left sidebar, click **Billing** or **Top up**.
2. Click the **Top up** button.
3. Pick an amount. Type `5` for $5.
4. Pick a payment method. (Card or Alipay.)
5. Fill in your card details. Click **Pay**.

> $5 will buy a LOT of searches. Each DeepSeek call costs less than $0.01. You will not run out soon.

Expected result: Your balance shows $5.00 (or more).

## 4.3 Create an API key

1. In the left sidebar, click **API Keys**.
2. Click the **Create new key** button.
3. A popup asks for a name. Type: `bad-decision-prod`
4. Click **Create**.
5. A long string appears that starts with `sk-`. This is your API key.

> Warning: DeepSeek only shows the key ONCE. If you close the popup, you cannot see it again. You would have to make a new one.

6. Click the **Copy** button.
7. Paste it into `secrets.txt` as:
   `DeepSeek API key: sk-...long string...`

Expected result: `secrets.txt` now has the DeepSeek key.

You are done with DeepSeek. Move to Step 5.

---

# Step 5. Get a Serper.dev API key

Serper.dev does Google searches for the app. The free tier gives 2,500 searches per month. That is plenty to start.

## 5.1 Sign up for Serper.dev

1. Open a new browser tab. Go to `https://serper.dev`.
2. Click **Sign Up** in the top right.
3. Sign up with Google or your email.
4. Confirm your email if asked.

Expected result: You are inside the Serper.dev dashboard. You see a sidebar with **Dashboard**, **API Key**, **Billing**.

## 5.2 Copy your API key

1. In the left sidebar, click **API Key** or **Dashboard**.
2. You will see a 32 character string of letters and numbers. It looks like `a1b2c3d4e5f6...`. (No dashes.)
3. Click the **Copy** icon next to it.
4. Paste it into `secrets.txt` as:
   `Serper API key: abc123...32 chars...`

Expected result: `secrets.txt` now has the Serper.dev key.

You are done with Serper.dev. Move to Step 6.

---

# Step 6. Set up OpenStreetMap

OpenStreetMap (OSM) is free map data. The app uses 2 OSM services:

- **Nominatim**: turns a place name like "Lagos, Nigeria" into coordinates.
- **Overpass**: finds businesses (cafes, salons, gyms) by their OSM tags.

You do NOT need to sign up. You do NOT need an API key. You only need to set 2 values in the backend.

## 6.1 Pick a User Agent string

The OSM Nominatim service asks you to identify your app. This is polite. It also keeps them from blocking you.

The User Agent must include your app name and a real contact email. Type this exact string (replace the email with yours):

`bad-decision/1.0 (your.email@example.com)`

Save it in `secrets.txt` as:
`OSM User Agent: bad-decision/1.0 (your.email@example.com)`

> Use your real email. If Nominatim has a problem with your app, they will email you. If you use a fake email, they will block your app.

## 6.2 Pick the Overpass endpoint

There are 2 main Overpass servers. Either works. Pick the first one.

Save this in `secrets.txt` as:
`OSM Overpass endpoint: https://overpass-api.de/api/interpreter`

> If the first server is slow, you can switch to the second one later:
> `https://overpass.kumi.systems/api/interpreter`

Expected result: `secrets.txt` now has 2 OSM values. You do not need to log in anywhere.

You are done with OpenStreetMap. Move to Step 7.

---

# Step 7. Make a Render backend service

Render hosts the backend. The backend is a Python program that runs the search engines and AI.

## 7.1 Sign up for Render

1. Open a new browser tab. Go to `https://render.com`.
2. Click **Get Started** in the top right.
3. Click **Sign up with GitHub**. Authorize Render.
4. Fill in any profile questions. Click **Finish**.

Expected result: You are inside the Render dashboard. You see a button labeled **New +** in the top right.

## 7.2 Connect the backend GitHub repo

1. Click **New +** in the top right. Click **Web Service**.
2. A page lists your GitHub repos. If you do not see the backend repo, click **Configure account** next to GitHub. Grant access to the repo `bad-decision-backend`.
3. Find the repo named **bad-decision-backend**. Click the **Select** button next to it.

Expected result: A form opens titled "Create a Web Service".

## 7.3 Fill in the basic settings

Fill in these fields exactly:

1. **Name**: `bad-decision-backend`
2. **Region**: pick the same region as your Supabase project (Frankfurt or Virginia).
3. **Branch**: `main`
4. **Root Directory**: leave it empty.
5. **Runtime**: pick **Python 3** from the dropdown.
6. **Python Version**: type `3.11.9` (exactly).
7. **Build Command**: type exactly:
   `pip install -r requirements.txt`
8. **Start Command**: type exactly:
   `uvicorn main:app --host 0.0.0.0 --port $PORT`
9. **Instance Type**: pick **Free**.

> The Free instance sleeps after 15 minutes of no traffic. The first request after sleep takes about 30 seconds to wake up. That is normal. You can upgrade to a paid instance later.

Expected result: All 9 fields are filled in.

## 7.4 Set the health check path

1. Scroll down to the **Health Check Path** field.
2. Type exactly: `/health`
3. Leave **Health Check Grace Period** at `60` seconds.

Expected result: The Health Check Path field says `/health`.

## 7.5 Add the backend environment variables

Scroll down to the **Environment** section. You will add 12 environment variables. Click **Add Environment Variable** for each one. Each row has a **Key** field and a **Value** field.

Add these one by one. Type the Key and Value exactly as shown. Use the values from your `secrets.txt` file. The exact value will be different for you. The shape is shown.

**Variable 1: Supabase URL**
- Key: `SUPABASE_URL`
- Value: paste your Supabase URL from `secrets.txt` (starts with `https://`)

**Variable 2: Supabase service_role key**
- Key: `SUPABASE_KEY`
- Value: paste your Supabase service_role key from `secrets.txt` (starts with `eyJ`)

**Variable 3: Supabase anon key**
- Key: `SUPABASE_ANON_KEY`
- Value: paste your Supabase anon key from `secrets.txt` (starts with `eyJ`)

**Variable 4: Backend API Secret**

This is a secret password the frontend and backend share. Make a random one. Open a new browser tab. Go to `https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new`. Copy the 32 character string. Save it in `secrets.txt` as `Backend API secret:`.

- Key: `BACKEND_API_SECRET`
- Value: paste your random 32 character string

> Warning: You will type the same string in the Vercel frontend. If they do not match, the app will not work. Save it carefully.

**Variable 5: Allowed Origin**

This is the frontend URL. Type it exactly:
- Key: `ALLOWED_ORIGIN`
- Value: `https://bad-decision-front-end.vercel.app`

**Variable 6: DeepSeek API key (single key)**
- Key: `DEEPSEEK_API_KEY`
- Value: paste your DeepSeek API key from `secrets.txt` (starts with `sk-`)

**Variable 7: DeepSeek API keys (list)**

You can use the same key for now. If you add more keys later, separate them with commas.
- Key: `DEEPSEEK_API_KEYS`
- Value: paste the same DeepSeek API key

**Variable 8: DeepSeek Scout Model**
- Key: `DEEPSEEK_SCOUT_MODEL`
- Value: `deepseek-chat`

**Variable 9: DeepSeek Scholar Model**
- Key: `DEEPSEEK_SCHOLAR_MODEL`
- Value: `deepseek-reasoner`

**Variable 10: Serper API key**
- Key: `SERPER_API_KEY`
- Value: paste your Serper.dev API key from `secrets.txt` (32 characters)

**Variable 11: OSM Nominatim User Agent**
- Key: `OSM_NOMINATIM_USER_AGENT`
- Value: paste your OSM User Agent from `secrets.txt` (looks like `bad-decision/1.0 (your.email@example.com)`)

**Variable 12: OSM Overpass Endpoint**
- Key: `OSM_OVERPASS_ENDPOINT`
- Value: `https://overpass-api.de/api/interpreter`

> Optional variables: `PORT` is set by Render automatically. `DEBUG` is `false` by default. You do not need to add them.

Expected result: You see all 12 variables listed in the Environment section.

## 7.6 Deploy the backend

1. Scroll to the bottom of the page.
2. Click the blue **Deploy Web Service** button.

Expected result: A page opens with a live log. You see lines like:
`==> Cloning from https://github.com/decisionsai40-lgtm/bad-decision-backend`
`==> Running build command 'pip install -r requirements.txt'...`
`==> Running start command 'uvicorn main:app --host 0.0.0.0 --port $PORT'...`

Wait about 3 to 5 minutes. The logs will keep scrolling.

## 7.7 Verify the health check passes

1. At the top of the page, find the URL of your service. It looks like:
   `https://bad-decision-backend.onrender.com`
2. Copy it. Save it in `secrets.txt` as:
   `Backend URL: https://bad-decision-backend.onrender.com`
3. Open a new browser tab. Paste your backend URL. Add `/health` to the end. So it looks like:
   `https://bad-decision-backend.onrender.com/health`
4. Press Enter.

Expected result: The page shows:
`{"status":"healthy"}`

> If you see `{"status":"healthy"}`, your backend is alive. Congratulations. Move to step 7.8.
> If you see an error, look at the Render logs. The most common problems:
> - A typo in a Supabase key. Check the key starts with `eyJ`.
> - `BACKEND_API_SECRET` is empty. You must set it.
> - Build failed. Look for `ERROR:` in the log. The error tells you what file is broken.

## 7.8 Note: the worker runs inside the same service

The task worker runs as a background task inside the same Python process. You do NOT need to set up a separate service. Render starts it automatically when the main app starts.

Look at the Render logs. After the line `Uvicorn running on http://0.0.0.0:$PORT`, you should see a line that says:
`Task worker started`

Expected result: The log shows `Task worker started` within 10 seconds of startup.

You are done with Render. Move to Step 8.

---

# Step 8. Make a Vercel frontend project

Vercel hosts the frontend. The frontend is the Next.js website the user sees.

## 8.1 Sign up for Vercel

1. Open a new browser tab. Go to `https://vercel.com`.
2. Click **Sign Up** in the top right.
3. Click **Continue with GitHub**. Authorize Vercel.
4. Fill in any questions. Click **Finish**.

Expected result: You are inside the Vercel dashboard. You see a button labeled **Add New**.

## 8.2 Import the frontend repo

1. Click **Add New** in the top right. Click **Project**.
2. A page lists your GitHub repos. Find the repo named **bad-decision-Front-end**.
   (The name has a capital F. That is correct.)
3. Click the **Import** button next to it.

Expected result: A form opens titled "Configure Project".

## 8.3 Fill in the basic settings

1. **Project Name**: `bad-decision-front-end`
2. **Framework Preset**: Vercel auto picks **Next.js**. Leave it.
3. **Root Directory**: leave it empty.
4. **Build Command**: leave it as `next build`.
5. **Output Directory**: leave it as default.
6. **Install Command**: leave it as `npm install`.

Expected result: All fields are filled in or set to defaults.

## 8.4 Add the frontend environment variables

Scroll down to the **Environment Variables** section. You will add 11 variables. For each one:
- Type the name in the **Key** field.
- Type or paste the value in the **Value** field.
- Make sure the **Environment** dropdown shows **Production**. (Vercel may also ask about Preview and Development. Leave those unchecked.)
- Click **Add** to save that row and start the next.

Add these one by one:

**Variable 1: Clerk publishable key**
- Key: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Value: paste your Clerk publishable key from `secrets.txt` (starts with `pk_live_`)

**Variable 2: Clerk secret key**
- Key: `CLERK_SECRET_KEY`
- Value: paste your Clerk secret key from `secrets.txt` (starts with `sk_live_`)

**Variable 3: Clerk webhook secret**
- Key: `CLERK_WEBHOOK_SECRET`
- Value: paste your Clerk webhook secret from `secrets.txt` (starts with `whsec_`)

**Variable 4: Backend URL**
- Key: `NEXT_PUBLIC_BACKEND_URL`
- Value: paste your Backend URL from `secrets.txt` (looks like `https://bad-decision-backend.onrender.com`)
- Note: Do NOT add a slash at the end.

**Variable 5: Backend API secret**

This is the same 32 character string you set on Render. They must match.
- Key: `BACKEND_API_SECRET`
- Value: paste the same Backend API secret from `secrets.txt`

> Warning: If this value does not match the value on Render, the frontend cannot talk to the backend. The app will show errors when you run a search.

**Variable 6: Supabase URL**
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: paste your Supabase URL from `secrets.txt` (starts with `https://`)

**Variable 7: Supabase anon key**
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: paste your Supabase anon key from `secrets.txt` (starts with `eyJ`)

**Variable 8: Supabase service_role key**

Yes, the frontend needs the service_role key. The frontend API routes use it to write to the database. Never put this in client side code. The `NEXT_PUBLIC_` prefix is NOT used here on purpose.
- Key: `SUPABASE_SERVICE_ROLE_KEY`
- Value: paste your Supabase service_role key from `secrets.txt` (starts with `eyJ`)

**Variable 9: Paystack public key**
- Key: `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- Value: paste your Paystack public key from `secrets.txt` (starts with `pk_live_`)

**Variable 10: Paystack secret key**
- Key: `PAYSTACK_SECRET_KEY`
- Value: paste your Paystack secret key from `secrets.txt` (starts with `sk_live_`)

**Variable 11: Paystack webhook secret**
- Key: `PAYSTACK_WEBHOOK_SECRET`
- Value: paste your Paystack webhook secret from `secrets.txt` (if it says PENDING, come back later)

Expected result: All 11 variables are listed in the Environment Variables section.

## 8.5 Deploy the frontend

1. Click the blue **Deploy** button at the bottom.
2. Wait. Vercel will run the build. This takes 2 to 4 minutes.

Expected result: A page shows the build log scrolling. At the end, you see a big green checkmark and the words **Congratulations**. Vercel shows your new URL: `https://bad-decision-front-end.vercel.app`.

> If the build fails: Vercel will show a red X. Click **View Build Logs**. The most common problems:
> - Missing env var. Check all 11 are present.
> - Typo in a key name. Names are case sensitive.
> - Paystack or Supabase key was copied with a space at the start or end. Recopy.

## 8.6 Open the live site

1. Click the **Visit** button.
2. The site opens in a new tab. You should see the Bad Decision landing page.

Expected result: The homepage loads. You see the Bad Decision name. You see a button that says **Get Started** or **Sign Up**.

> If the page shows a Clerk error like "Publishable key missing", check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in Vercel and starts with `pk_live_`. Then redeploy.

You are done with Vercel. Move to Step 9.

---

# Step 9. Test the full flow

Now you will test that everything works. Do each test in order. If a test fails, fix it before moving on. The fix is usually a typo in an env var.

## 9.1 Test 1: Sign up works

1. Open `https://bad-decision-front-end.vercel.app` in your browser.
2. Click **Sign Up** in the top right.
3. Type your email and a password. Click **Continue**.
4. Clerk sends a code to your email. Type the code. Click **Verify**.
5. You should land on the dashboard.

Expected result: The dashboard loads. You see a sidebar. You see a number in the sidebar that says **50 credits**.

> If the credits show 0, the Clerk webhook is not working. Check:
> - In Clerk, go to **Webhooks**. Click your endpoint. Look at the **Attempts** tab. You should see a green check next to the `user.created` event. If you see a red X, click it. The error tells you what went wrong.
> - In Vercel, check that `CLERK_WEBHOOK_SECRET` matches the `whsec_` value from Clerk.
> - In Vercel, check that `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct.
> - Redeploy Vercel if you change any var.

## 9.2 Test 2: Run an ads_intent search

1. In the dashboard, find the **Engines** section.
2. Click the card labeled **Ads Intent**. (It should be unlocked for free users.)
3. Pick a country. Pick a state. Type a niche. For example:
   - Country: `United States`
   - State: `California`
   - Niche: `coffee shops`
4. Click the **Search** button.

Expected result: A progress bar appears. It shows steps like:
`Scanning Google Ads`
`Geocoding region`
`Running Gate 1 (DNS check)`
`Running Gate 2 (SMTP check)`
`Writing leads`

The progress bar moves from 0% to 100%. This takes 30 to 120 seconds.

> If you see a red error toast like "Backend unreachable": check that `NEXT_PUBLIC_BACKEND_URL` is set on Vercel (with no slash at the end) and that your Render service is awake. Click your Render URL in a new tab to wake it up.
> If you see "Unauthorized" or "X-API-Secret missing": check that `BACKEND_API_SECRET` matches on Vercel and Render.

## 9.3 Test 3: Leads appear

1. Wait for the search to finish.
2. The page should switch to a **Leads** view.
3. You should see a list of leads. Each lead has:
   - Business name
   - Website
   - Email
   - Country
   - Validation gates passed (like "G1, G2")

Expected result: At least 5 leads show in the list. (Free tier targets up to 15 leads.)

> If the list is empty: open the Render logs. Look for errors. The most common cause is a DeepSeek API key with no balance, or a Serper API key that has expired free credits.

## 9.4 Test 4: Credits were deducted

1. Look at the credits number in the sidebar.
2. It should be lower than 50. Each verified lead costs 1 credit (free tier).

Expected result: Credits went from 50 to something lower. For example, if 10 leads came back, you should see 40 credits.

> If credits did NOT drop, the worker is not running. Check the Render logs for `Task worker started`. If you do not see it, restart the Render service.

## 9.5 Test 5: Buy credits via Paystack

1. In the sidebar, click **Credit Vault** (or the **Buy Credits** button).
2. Pick a credit package. For example, **500 credits**.
3. Click **Buy**.
4. A Paystack popup appears. Type a test card:
   - Card number: `4084 0840 8408 4081`
   - Expiry: any future date
   - CVV: `408`
   (This is Paystack's test card. It will not charge real money if you are in Test mode.)
5. Click **Pay**.
6. Wait. Paystack will redirect you back to the dashboard.

Expected result: The credits number goes UP by 500. You should see a success toast that says "Payment successful".

> If the credits do NOT go up: check the Paystack webhook.
> - In Paystack, go to **Settings** then **API Keys & Webhooks**. Find your webhook URL. Click it. Look at the **Logs** or **Events** tab. You should see a green check next to the `charge.success` event.
> - In Vercel, check the function logs at **Vercel Dashboard** then **Project** then **Functions** then **api/webhooks/paystack**. Look for errors.
> - In Vercel, check that `PAYSTACK_WEBHOOK_SECRET` is set and correct.
> - In Vercel, check that `PAYSTACK_SECRET_KEY` is set and correct.
> - In Vercel, check that `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct.

## 9.6 Test 6: Locked engines behave correctly

1. In the dashboard, look at the other engine cards. They are named **SMB Maps**, **Web Absent**, and **Social Intent**.
2. Each card should show a small lock icon and a label that says **Upgrade to unlock**.
3. Click the card body. It should NOT run a search.
4. Click the **Upgrade to unlock** link. It should take you to the **/pricing** page.

Expected result: Free users cannot use the 3 paid engines. Clicking a locked card does nothing (or shows a tooltip). The upgrade link works.

## 9.7 Test 7: Upgrade flow

1. On the pricing page, pick the **Starter** plan ($15).
2. Click **Subscribe** or **Upgrade**.
3. Pay with the test card from Test 5.
4. After payment, go back to the dashboard.

Expected result: All 4 engines are unlocked. Your tier label changes from "Free" to "Starter". Credits per lead changes from 1 to 2.

## 9.8 Test 8: Export to CSV

1. Run any search that returns leads.
2. On the leads page, click **Export CSV**.
3. A file downloads to your computer.

Expected result: A file named something like `bad-decision-leads-YYYY-MM-DD.csv` downloads. Open it in Excel or Google Sheets. You see the same leads in columns.

---

# Final Checklist

Go through this list. Each line should be a YES.

- [ ] Supabase project exists and all 7 tables show in Table Editor.
- [ ] `secrets.txt` has all 18 values (Supabase x3, Clerk x3, Paystack x3, DeepSeek x1, Serper x1, OSM x2, Backend API secret x1, Backend URL x1, plus your own Paystack password and Supabase DB password).
- [ ] Render backend health check returns `{"status":"healthy"}`.
- [ ] Render logs show `Task worker started`.
- [ ] Vercel frontend builds successfully with no red errors.
- [ ] `https://bad-decision-front-end.vercel.app` loads the homepage.
- [ ] New sign up gets 50 free credits automatically.
- [ ] Ads Intent search returns real leads within 120 seconds.
- [ ] Credits drop after a search.
- [ ] Paystack payment adds credits.
- [ ] Free users see 3 locked engines.
- [ ] CSV export downloads a file with leads.

If every box is checked, you are live. Congratulations.

---

# Common Problems and Fixes

## The site shows a white screen

- Open the browser dev tools (press F12). Look at the Console tab.
- The most common error is a Clerk key missing. Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` on Vercel.

## The dashboard shows 0 credits after sign up

- The Clerk webhook failed. Check Clerk Webhooks then Attempts.
- Make sure the endpoint URL is exactly `https://bad-decision-front-end.vercel.app/api/webhooks/clerk`.
- Make sure you subscribed to `user.created`.
- Make sure `CLERK_WEBHOOK_SECRET` matches.

## The search button does nothing

- Open browser dev tools. Look at the Network tab. Click Search. Look for the red request.
- If the request returns 401 or 403, the `BACKEND_API_SECRET` does not match between Vercel and Render.
- If the request returns 502 or 503, the Render service is asleep. Click your Render URL in a tab to wake it.

## The search returns 0 leads

- Check the Render logs. Look for `Serper error` or `DeepSeek error`.
- Check your DeepSeek balance. Add more if it is below $1.
- Check your Serper dashboard. You may have used up the free 2,500 searches.

## Paystack payment works but credits do not show

- The Paystack webhook failed. Check Paystack then Settings then Webhooks then Logs.
- Make sure the webhook URL is exactly `https://bad-decision-front-end.vercel.app/api/webhooks/paystack`.
- Make sure `PAYSTACK_WEBHOOK_SECRET` is set on Vercel.
- Make sure `PAYSTACK_SECRET_KEY` is set on Vercel.

## Render deploy fails

- Look at the build log.
- The most common error is a missing file. Make sure the repo has `requirements.txt` and `main.py` at the root.
- Make sure Python Version is `3.11.9`.

---

# Where Each Key Goes (Master List)

Print this page or keep it open. It tells you where every secret value goes.

| Secret | From | Goes To |
|---|---|---|
| Supabase URL | Supabase Settings then API | Vercel (`NEXT_PUBLIC_SUPABASE_URL`) and Render (`SUPABASE_URL`) |
| Supabase anon key | Supabase Settings then API | Vercel (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) and Render (`SUPABASE_ANON_KEY`) |
| Supabase service_role key | Supabase Settings then API | Vercel (`SUPABASE_SERVICE_ROLE_KEY`) and Render (`SUPABASE_KEY`) |
| Clerk publishable key | Clerk then API Keys | Vercel (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`) |
| Clerk secret key | Clerk then API Keys | Vercel (`CLERK_SECRET_KEY`) |
| Clerk webhook secret | Clerk then Webhooks then your endpoint | Vercel (`CLERK_WEBHOOK_SECRET`) |
| Paystack public key | Paystack then Settings then API Keys | Vercel (`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`) |
| Paystack secret key | Paystack then Settings then API Keys | Vercel (`PAYSTACK_SECRET_KEY`) |
| Paystack webhook secret | Paystack then Settings then Webhooks | Vercel (`PAYSTACK_WEBHOOK_SECRET`) |
| DeepSeek API key | DeepSeek then API Keys | Render (`DEEPSEEK_API_KEY` and `DEEPSEEK_API_KEYS`) |
| Serper API key | Serper then Dashboard | Render (`SERPER_API_KEY`) |
| OSM User Agent | You make it (app name + your email) | Render (`OSM_NOMINATIM_USER_AGENT`) |
| OSM Overpass endpoint | `https://overpass-api.de/api/interpreter` | Render (`OSM_OVERPASS_ENDPOINT`) |
| Backend API secret | You make it (32 random chars) | Render (`BACKEND_API_SECRET`) AND Vercel (`BACKEND_API_SECRET`). Both must match. |
| Backend URL | Render (after deploy) | Vercel (`NEXT_PUBLIC_BACKEND_URL`) |
| ALLOWED_ORIGIN | The Vercel URL | Render (`ALLOWED_ORIGIN`) |

That is everything. Follow the steps. Take your time. You can do this.

---

# Help

If you get stuck:

1. Read the **Common Problems** section above.
2. Read the error message on the screen. It usually tells you what is wrong.
3. Check the `secrets.txt` file. Make sure each value is copied exactly. No extra spaces.
4. Restart the failing service. On Render, click **Manual Deploy** then **Deploy latest commit**. On Vercel, click **Redeploy**.

If none of that works, ask for help. Tell the helper:
- Which step you are on.
- What you expected to happen.
- What happened instead.
- The exact error message.

You are now ready. Go back to Step 1 and begin.
