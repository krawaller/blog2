# Krawaller weblog source

This is the source code for the blog at [https://blog.krawaller.se](https://blog.krawaller.se). It was previously a hacked metalsmith thingy, but now it is a beautiful NextJS-powered app! :)

## Installation

Run `npm install`, and then if you want you can start a local hot-reloading version by `npm run dev`.

## Adding a post

1. Create a new foldes in the `./sources` folder. Please follow the existing convention of prefixing with the date.

1. In that folder, create:

   - a `post.md` file with...
     - YAML frontmatter with attributes for title, url, etc. See an existing post for what's available.
     - A body with your content written in markdown!
   - a `static` folder with any images etc. To refer into that folder from the post, use `./static/<whatever>` as you normally would (that path will later be automagically altered).

1. To create a react component for your post, run `npm run makePosts` (this will rebuild all posts and the index)

1. To test locally, run `npm run dev`. This starts a local dev server at [http://localhost:3000](http://localhost:3000) (which will hot reload whenever you run makePosts again).

## Publishing

To publish the blog to [https://blog.krawaller.se](https://blog.krawaller.se) you must run...

1. `npm run build` to create a nextjs site
1. `npm run export` to make that site dump out a front-end only version into `./out`
1. `npm run publish` to actually push that front-end version to the gh-pages webserver

(you can also run `npm run robot` which does all of the above)
