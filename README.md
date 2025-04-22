# Audio Sorcery

This is the Audio Sorcery project, a web application built with React and Vite.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment to GitHub Pages

### Automatic Deployment
This project is configured for automatic deployment to GitHub Pages using GitHub Actions. When you push to the `main` branch, the GitHub workflow will automatically build and deploy your site.

### Manual Deployment
You can also deploy manually using the gh-pages package:

```bash
# Build and deploy
npm run deploy
```

### Setup for GitHub Pages
1. In your GitHub repository, go to Settings > Pages
2. For Source, select "GitHub Actions"
3. Make sure your repository is public or you have GitHub Pro for private repository hosting

## Project Configuration
- The site is configured to be deployed at: `https://USERNAME.github.io/audio-sorcery/`
- The router is configured with a basename of `/audio-sorcery`
- The Vite configuration includes a base path of `/audio-sorcery/`

## Customizing the Base Path
If you want to use a different repository name, you'll need to update:
1. The `base` path in `vite.config.ts`
2. The `basename` prop in the `BrowserRouter` in `src/App.tsx` 
3. The `pathSegmentsToKeep` variable in `public/404.html`
4. Update the og-image path in `index.html`

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/fb2085ea-ef0e-449b-851e-4fa35fca4191

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/fb2085ea-ef0e-449b-851e-4fa35fca4191) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/fb2085ea-ef0e-449b-851e-4fa35fca4191) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
