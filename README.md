# betweencurlybraces

This repository contains the source code for Sojjwal Kelkar's personal blog, built with Hugo.

**Live site:** https://sskelkar.github.io/

## Quick Start

### Prerequisites
*   [Hugo](https://gohugo.io/installation/) v0.148.2 or later (extended version required)
*   Git

### Development Commands
*   `brew install hugo`: Install Hugo on macOS.
*   `hugo new post/my-first-post.md`: Create a new blog post markdown file.
*   `hugo server -D`: Run the local development server at http://localhost:1313, including draft content.
*   `hugo`: Build the site locally to check for errors before deploying.
*   `./deploy.sh`: Build the project and deploy to [sskelkar.github.io](https://github.com/sskelkar/sskelkar.github.io). This script builds the Hugo site, commits the changes in the `public` directory, and pushes them to the `master` branch of the `sskelkar/sskelkar.github.io` repository. It does not commit or push any changes to the main `betweencurlybraces` repository.

## Post Frontmatter

When creating a new blog post, include these fields in the frontmatter:

```yaml
---
title: "Your Post Title"
date: 2025-10-05T22:01:56+02:00
draft: false  # Set to true for unpublished drafts
tags:
  - Tag1
  - Tag2
author: "Sojjwal Kelkar"
---
```

## Theme Customization

*   This project uses the [beautifulhugo](https://github.com/halogenica/beautifulhugo) theme as its base.
*   To override default theme layouts or add custom content, copy the relevant pages from the theme's `layouts` folder to the blog repo's `layouts` folder.
*   `git submodule update --remote --merge`: Use this command to update the theme to its latest version.

### Custom Overrides

The following files have been customized to override theme defaults:

**Layouts:**
*   `layouts/partials/post_meta.html` - Modified to display tags alongside date and reading time in the header
*   `layouts/partials/post_preview.html` - Customized post listing display with tags in metadata
*   `layouts/partials/nav.html` - Simplified navigation (removed hamburger menu for mobile)
*   `layouts/partials/header.html` - Custom header layout
*   `layouts/_default/single.html` - Removed duplicate tag listing from bottom of posts
*   `layouts/_default/terms.html` - Tags sorted alphabetically instead of by count

**Styling:**
*   `static/css/main.css` - Extensive custom styling including:
  - Smaller heading font sizes (h1-h6)
  - Professional sans-serif fonts for metadata (Open Sans)
  - Cleaner tag styling with consistent spacing
  - Mobile-optimized navigation
  - Custom "Read more" link styling

**Translations:**
*   `i18n/en.yaml` - Modified text strings (removed "Posted on", "Tags:", updated "Read more")

**Configuration:**
*   `config.toml` - Simplified navigation menu (only About and Tags)

If pages aren't rendering as expected after a theme update, copy the latest theme layout code and re-apply your custom changes on top of it.

## How It Works

*   GitHub Pages serves the blog from the [sskelkar/sskelkar.github.io](https://github.com/sskelkar/sskelkar.github.io) repository from the branch specified in that repo's Settings.
*   When you build the blog using the `hugo` command, the generated static resources are placed in the `public` folder.
*   The `public` folder in this repository is configured as a Git submodule, pointing to the `master` branch of the `sskelkar/sskelkar.github.io` repository. This is set up using:
    `git submodule add --force -b master git@github.com:sskelkar/sskelkar.github.io.git public`
*   The `./deploy.sh` command automates the build process, commits changes within the `public` submodule, and pushes them to the GitHub Pages repository. After running the script, you need to manually commit and push the updated `public` submodule pointer in this main repository.

## SEO

*   **Sitemap:** Hugo automatically generates `sitemap.xml` during build. Available at https://sskelkar.github.io/sitemap.xml
*   **Robots.txt:** Located in `static/robots.txt`, points search engines to the sitemap.

## Workflow for creating/updating a blog post

**Note:** The `master` branch is protected and requires pull requests. You cannot push directly to master.

1.  **Create a new branch:**
    `git checkout -b <branch-name>`
2.  **Create a new post:**
    `hugo new post/<post-name>.md`
3.  **Write the blog post.**
4.  **Run the local server to preview the changes:**
    `hugo server -D`
5.  **If satisfied, set `draft: false` in the frontmatter and run the deploy script:**
    `./deploy.sh`
6.  **Commit the file and the public submodule:**
    `git add content/post/<post-name>.md public`
    `git commit -m "Publish blog post: <title>"`
7.  **Push the changes to the remote repository:**
    `git push origin <branch-name>`
8.  **Create a pull request** and merge it into the `master` branch.