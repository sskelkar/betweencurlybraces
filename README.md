# betweencurlybraces

This repository contains the source code for Sojjwal Kelkar's personal blog, built with Hugo.

## Quick Start

### Prerequisites
*   [Hugo](https://gohugo.io/installation/) (extended version recommended)
*   Git

### Development Commands
*   `brew install hugo`: Install Hugo on macOS.
*   `hugo new posts/my-first-post.md`: Create a new blog post markdown file.
*   `hugo server -D`: Run the local development server, including draft content.
*   `./deploy.sh`: Build the project and deploy to [sskelkar.github.io](https://github.com/sskelkar/sskelkar.github.io). Ensure your SSH keys are set up for seamless deployment.

## Theme Customization

*   This project uses the [beautifulhugo](https://github.com/halogenica/beautifulhugo) theme as its base.
*   To override default theme layouts or add custom content, copy the relevant pages from the theme's `layouts` folder to the blog repo's `layouts` folder.
*   **Example:** `post-list.html` has been modified to display reading time while listing all the blog posts.
*   If pages aren't rendering as expected after a theme update, copy the latest theme layout code and re-apply your custom changes on top of it.
*   `git submodule update --remote --merge`: Use this command to update the theme to its latest version.

## How It Works

*   GitHub Pages serves the blog from the [sskelkar/sskelkar.github.io](https://github.com/sskelkar/sskelkar.github.io) repository from the branch specified in that repo's Settings.
*   When you build the blog using the `hugo` command, the generated static resources are placed in the `public` folder.
*   The `public` folder in this repository is configured as a Git submodule, pointing to the `master` branch of the `sskelkar/sskelkar.github.io` repository. This is set up using:
    `git submodule add --force -b master git@github.com:sskelkar/sskelkar.github.io.git public`
*   The `./deploy.sh` command automates the build process, commits changes within the `public` submodule, pushes them to the GitHub Pages repository, and then updates the `public` submodule pointer in this main repository.