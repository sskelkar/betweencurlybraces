# betweencurlybraces

### Commands

* `brew install hugo`
* `hugo new posts/my-first-post.md`
* `hugo server -D`
* `./deploy.sh` (To build the project and deploy to [sskelkar.github.io](https://github.com/sskelkar/sskelkar.github.io))


### Minimal theme
* The [minimal-bootstrap-hugo-theme](https://github.com/zwbetz-gh/minimal-bootstrap-hugo-theme/tree/master/layouts) provides a default layout.
* This can be overwritten if you want to add more content/bells/whistles on top of the default layout.
* This is done by copying all relevant pages from the theme's layouts folder to the blog repo's layouts folder.
* Eg: post-list.html has been modified to display reading time while listing all the blog posts.
* If pages aren't rendering as expected, perhaps the code in the theme has changed. Again copy the theme layout code and apply your custom changes on top of it.
* `git submodule update --remote --merge` to get fresh pull of theme

### How it works
* GitHub Pages serves the blog from the [this repo](https://github.com/sskelkar/sskelkar.github.io) from the branch specified in the repo's Settings.
* When you clone this repo and build the blog using `hugo` command, the resources are generated in the 'public' folder.
* This public folder should point to the above repo that is used to serve the GitHub Pages.
* This can be done by adding that repo as a submodule of this repo. `git submodule add --force -b master git@github.com:sskelkar/sskelkar.github.io.git public`. 
* With the above command the public folder of this repo points to the master branch of that repo.
* When you run the `./deploy.sh` command, it builds the hugo site. Then it goes into the public directory and commits the changes to the GitHub Pages repo. 
* If during `git push` it asks for credentials, use the github personal access token instead of the github password. 
