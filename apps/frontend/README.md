# OP2P White Label Frontend

Frontend application for the OP2P White Label project.

## Stack

- Next.js App Router
- TypeScript
- CSS Modules
- Motion

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev` - start local development server
- `npm run build` - create production build
- `npm run start` - start production server
- `npm run lint` - run ESLint

## Architecture Notes

The frontend renders UI, handles navigation and client-side interactions, and must communicate only with the project Backend. It must not call Only P2P directly or contain external API credentials.

The current implementation contains the public landing page. Authentication pages and Backend integration are planned next.
## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
