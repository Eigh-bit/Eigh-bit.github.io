# Shiyao Chen / 陈仕尧

Astro personal homepage with an independent, real AcadHomepage / Jekyll academic subsite.

Website: [eigh-bit.github.io](https://eigh-bit.github.io/). Academic subsite: [eigh-bit.github.io/academic/](https://eigh-bit.github.io/academic/).
The public repository deploys the combined site through GitHub Actions on pushes to main.

## Structure

```text
src/                      Astro homepage and existing Bookshelf placeholder
public/                   Personal-site assets only
academic-site/            Official AcadHomepage source, personalized for Shiyao Chen
  _config.yml             Profile, SEO, disabled Scholar/analytics options
  _pages/about.md          About, interests, projects and education
  _data/                  Navigation, projects, education, honors; optional publications/news
  _includes/ _layouts/    Personalized upstream AcadHomepage layout and components
  _sass/ assets/          Upstream responsive design, paper styles, JS and local fonts
  images/                 Supplied portrait (non-destructive CSS crop) and SC favicon
  LICENSE UPSTREAM.md     Original MIT license and source/change provenance
scripts/                  Jekyll build, Astro integration and output verification
.github/workflows/        Combined build and optional GitHub Pages deployment
.academic-build/           Generated Jekyll output/config (ignored)
dist/                     Combined static output, including academic/
```

The upstream source comes from [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io), commit `2cc1577eeaf2f74dede6d016a70722dbd409ea2f`. This is Jekyll-rendered source, not an Astro reconstruction. The original sidebar, desktop layout, greedy navigation, responsive Sass, paper-list classes, fonts and JavaScript bundle are used.

## Requirements and installation

- Node.js 22.12+ and npm.
- Ruby 3.3 and Bundler. Windows: install the official [Ruby+Devkit](https://rubyinstaller.org/downloads/) x64 build, and initialize the MSYS2 toolchain if prompted. Native gems need the Devkit.

```sh
npm ci
cd academic-site
bundle install
cd ..
npm run dev -- --host 127.0.0.1 --port 4321
```

Open `http://127.0.0.1:4321/` and `http://127.0.0.1:4321/academic/`. The dev command builds Jekyll before serving. Academic edits trigger a serialized Jekyll rebuild; refresh the academic page after editing. Main-site Astro updates retain their usual development behavior.

If Ruby is not on PATH, set `RUBY_BIN` to the absolute ruby executable path. The integration also detects the usual Windows Ruby 3.3 locations. Keep Ruby's bin directory on PATH when running `bundle install` manually.

Build and verify:

```sh
npm run check
npm run build
npm run verify:academic
npm run preview -- --host 127.0.0.1 --port 4321
```

The Astro build hook runs Bundler/Jekyll and copies its output to `dist/academic/`; a failed Jekyll build fails the combined build. There is no academic Astro route and no generated subsite inside public/. Both development and preview use the Astro origin, without a separate port 4000.

To build only the academic source: `npm run build:academic` (writes .academic-build/site/).

## Content

The profile identifies Shiyao Chen / 陈仕尧 at Zhejiang University. The English text covers undergraduate study in Electronic Information Engineering (2023–present), joint research training with the College of Computer Science and Technology and TeleAI, AI/LLM safety, mechanistic interpretability, internal representations and safety diagnostics. TeleRT is labeled as ongoing development and research, without publication or performance claims.

The profile includes the supplied email (415189279@qq.com), GitHub account (Eigh-bit), and TeleAI affiliation. The original photograph is framed with a reversible CSS crop that centers the head and shoulders; the image itself is not retouched. The classic sidebar displays affiliations, location, GitHub and email.

Selected Projects also includes [Spectra Audio Deepfake Detection](https://github.com/Eigh-bit/Spectra_audio_deepfake_detection), verified against its public README and configuration. The description covers Spectra-0/XLS-R, beginning/middle/end window aggregation, local batch inference, CSV output and offline inference after resource preparation. It makes no benchmark or broad performance claims. No Scholar, ORCID, mentors, positions, research dates, awards or publications have been invented.

Add real email/academic accounts in `academic-site/_config.yml` when available. They render conditionally. Citation fetching additionally requires explicit `google_scholar_stats_enabled: true` and a real stats source; it is disabled now. Analytics is unset. No crawler workflow is installed.

Publications, News and Honors & Awards render only when their corresponding YAML datasets contain records. Their navigation entries follow the same condition. Current awards are grouped by year, newest first. Add verified records using these field names:

- publications.yml: title, authors, optional url, image, venue, description.
- news.yml: date, text.
- honors.yml: year, title, optional distinction. Ordering within a year follows the data file.
- projects.yml: title, description, status, optional url. Project titles, descriptions and status lines have separate styling.

The publications renderer retains upstream `paper-box`, `paper-box-image`, `paper-box-text` and `badge` classes. No empty section headings or navigation links are shown. Source headers and the original MIT license remain; the page includes a compact AcadHomepage credit and license link.

TeleAI joint training appears under Education with a start date of 2027, rather than as a current Research Experience. TeleRT has no public results yet. The sidebar lists Zhejiang University, TeleAI, Shanghai, GitHub and email. Major section headings retain the original markers. Project titles, descriptions and status lines have separate styling.

## GitHub Pages: root and project paths

Use GitHub Actions to publish the combined `dist/` artifact, rather than GitHub's default Jekyll source build. The workflow installs Node and Ruby, restores Bundler dependencies, builds both sites and uploads one artifact. It does not need a git submodule or a separate academic repository.

The workflow detects `USERNAME.github.io` as root; other repository names use `/<repository-name>/`. Set repository Actions variables `ASTRO_SITE` (origin only) and `ASTRO_BASE_PATH` to override for a custom domain. For a custom domain root set base explicitly to `/`. In GitHub Settings → Pages choose GitHub Actions. No push or public deployment was performed during local development.

| Deployment | ASTRO_BASE_PATH | Jekyll baseurl | Personal Home |
| --- | --- | --- | --- |
| Root/custom domain | / | /academic | / |
| Project repository | /personal-site/ | /personal-site/academic | /personal-site/ |

The integration derives all three paths from one base. HTML assets use Jekyll relative_url, SEO uses absolute_url, and font URLs resolve relative to academic CSS. Never hardcode a deployment prefix in content or templates.

PowerShell project-path verification:

```powershell
$env:ASTRO_SITE = 'https://USERNAME.github.io'
$env:ASTRO_BASE_PATH = '/personal-site/'
npm run build
npm run verify:academic
npm run preview -- --host 127.0.0.1 --port 4322
# Visit http://127.0.0.1:4322/personal-site/academic/
Remove-Item Env:ASTRO_SITE, Env:ASTRO_BASE_PATH
```

The same environment variables must remain set for the matching build, verification and preview. The output directory remains `dist/academic/`: Pages/preview mounts dist at the chosen base; do not create an extra `dist/personal-site/` directory.

## Local machine environment

### Homepage video background

The personal homepage alone uses the user-supplied Persona 3 Reload video in its upper introduction region, with centered introductory text and no stock reading photograph. The Academic/Bookshelf entry cards sit below the video on a coordinated solid navy background (#101747). `src/components/HomeBackground.astro` provides muted looping video, an explicit pause/play control within the video region, static poster fallback, reduced-motion/save-data handling and pause-on-hidden behavior. `src/styles/home-background.css` scopes its layout and contrast adjustments to `body.home-wallpaper`; academic and Bookshelf keep their previous appearance. All media URLs use Astro's deployment base.

Web derivatives in `public/media/` keep the complete approximately 40-second loop without audio: desktop 1080p/30fps (~3.5 MB), mobile 960px/24fps (~1.2 MB). The original supplied package is untouched and not included in the web output. Asset provenance and third-party rights notes are in `public/media/README.md`; these assets are not licensed by the site's code license. Confirm permission before any public deployment.

On the development machine, C: ran out of space during dependency installation. Newly installed dependencies and Ruby were placed under `D:\code\codex-academic-runtime\`; the project's node_modules is a local junction to its site-dependencies/node_modules. These are local runtime details, not deployment requirements, and are excluded from source delivery. Set `RUBY_BIN=D:\code\codex-academic-runtime\Ruby33-x64\bin\ruby.exe` for this machine. Fresh installations should simply follow the portable commands above.

The original placeholder source and sample image files have been replaced/removed from the active site. Original upstream metadata, docs, sample images and workflows were moved to the task's work/upstream-originals/ for recoverability, outside the delivered personalized subsite.
