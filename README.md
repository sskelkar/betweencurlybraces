# betweencurlybraces

Repo for personal blog

* `brew install hugo`
* `hugo new posts/my-first-post.md`
* `hugo server -D`
* `./deploy.sh` (To build the project and deploy to [sskelkar.github.io](https://github.com/sskelkar/sskelkar.github.io))


Troubleshooting
* The theme provides a default layout. This is at https://github.com/zwbetz-gh/minimal-bootstrap-hugo-theme/tree/master/layouts
* This can be overwritten if you want to add more content/bells/whistles on top of the default layout.
* This is done by copying all relevant pages from the theme's layouts folder to the blog repo's layouts folder.
* Eg: post-list.html has been modified to display reading time while listing all the blog posts.
* If pages aren't rendering as expected, perhaps the code in the theme has changed. Again copy the theme layout code and apply your custom changes on top of it.
* `git submodule update --remote --merge` to get fresh pull of theme