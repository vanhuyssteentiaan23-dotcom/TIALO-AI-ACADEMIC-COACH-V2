# TIALO AI Academic Coach

TIALO is a subscription study platform with an AI tutor, subject-specific materials, focused practice, mock exams and progress tracking.

## Plans
- Basic: R100/month
- Full: R250/month

## Production architecture
- Next.js App Router on Vercel
- GitHub source control
- Supabase Auth + Postgres + Storage for per-user accounts and persistent learning data
- OpenAI API for the AI Tutor and material-grounded generation
- Stripe recurring subscriptions in ZAR

## Required setup
1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Create a Storage bucket for study materials and apply authenticated-user policies.
3. Create two recurring Stripe prices: R100/month and R250/month. Put their IDs in `STRIPE_BASIC_PRICE_ID` and `STRIPE_FULL_PRICE_ID`.
4. Add the variables in `.env.example` to the Vercel project's Environment Variables. Never commit secrets.
5. In Vercel, import `vanhuyssteentiaan23-dotcom/TIALO-AI-ACADEMIC-COACH-V2` from GitHub. Enable automatic deployments from `main`.

## Under-16 parent flow
During onboarding, collect date of birth. Learners under 16 must be linked to a parent account. The parent portal is read-only for progress, task completion, study time and exam results; private AI tutor conversations remain private to the learner.

## Important
The current UI prototype stores some learning state in browser localStorage. Before public launch, wire the UI to Supabase so subjects, uploaded materials, exams, tasks and progress are stored server-side per authenticated user. This prevents data disappearing when a learner changes device or browser.
