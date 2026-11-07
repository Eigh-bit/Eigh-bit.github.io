# AcadHomepage source provenance

This directory vendors the official [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io) Jekyll source at commit `2cc1577eeaf2f74dede6d016a70722dbd409ea2f`.

The upstream MIT license is preserved verbatim in LICENSE (copyright Yi Ren, 2022). Original CSS and JavaScript license headers are retained. AcadHomepage credits Minimal Mistakes, Academic Pages, Font Awesome (MIT / SIL OFL 1.1) and Academicons (MIT / SIL OFL 1.1).

The original layout, sidebar, responsive navigation, Susy / Breakpoint Sass, paper-box styling, local fonts and JavaScript bundle are retained. Personalization changes replace the profile, content, navigation, SEO and favicon; remove sample records and imagery; and make paths work below the Astro base path.

Personalization replaces profile, content, navigation, SEO and favicon; removes sample records and imagery; and makes paths work below the Astro base path. Projects, education, honors, future publications and news are maintained as YAML data and rendered by Liquid includes. Optional sections and their navigation entries are hidden when empty. All original license notices remain.

Build-only changes use Jekyll 3.10 with jekyll-sass-converter 1.5 / Ruby Sass 3.7 instead of the full github-pages / hawkins development bundle. The source is still rendered by Jekyll. The old lockfile is replaced with the resolved Windows/Linux lockfile. The upstream example docs, crawler, workflows and Git metadata are not part of the personalized subsite; citation fetching is disabled until real Scholar data is configured.
