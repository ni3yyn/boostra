This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment and Deployment

Copy `.env.example` to `.env.local` for local development. Never commit `.env.local` or SMTP credentials to this public repository. Configure production values through the deployment provider's secret or environment-variable settings.

The current Firebase Hosting configuration uses Next.js static export (`out`). `NEXT_PUBLIC_*` values must be present when the static build runs. The `/api/admin/send-email` and `/api/admin/send-gift` routes require a server runtime and will not run from static Firebase Hosting alone; deploy those routes separately using a server-capable target such as Firebase Functions or App Hosting.

### Firebase + Vercel split

The intended no-Firebase-Functions setup is:

- Firebase Hosting serves `boostraagency.org`.
- Vercel serves the API routes at `api.boostraagency.org`.
- Set `NEXT_PUBLIC_API_URL=https://api.boostraagency.org` in the Firebase build environment.
- Set `NEXT_PUBLIC_APP_URL=https://boostraagency.org` and `NEXT_PUBLIC_API_URL=https://api.boostraagency.org` in Vercel.
- Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` only in Vercel. Do not expose them to the Firebase build or GitHub.
- In Vercel, add the GitHub repository as a project and attach `api.boostraagency.org` as its custom domain.
- At the domain registrar, create the DNS record Vercel provides for `api`.

Build the Firebase frontend with `npm run build:firebase` (or `yarn build:firebase`) before `firebase deploy --only hosting`. Use the normal `npm run build` command for Vercel so the API routes remain available there.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
