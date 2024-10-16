# Magnolia Home Banners

[Preview site >>](https://www.campaign.hogarthww.digital/ctus-jameshardie/jameshardie-h243113/preview/)

[JIRA >>](https://hogarthdigital.atlassian.net/browse/CTUS-577)
<!-- u: ctus-jameshardie
p: aIdq+j2PtDLrO3CCeDXtiQ== -->

## Getting Started
- This project uses [Gulp](https://gulpjs.com/docs/en/getting-started/quick-start/) tasks to automate the workflow.
- All banners are compiled from handlebars templates via [gulp-compile-handlebars](https://www.npmjs.com/package/gulp-compile-handlebars)
- To install the packages needed to run the Gulp tasks open the command line and run `npm install`. That will download `node_modules` (not included in this repo).
- Banners are compiled as minified if the variable `isProduction` in gulpfile is set to `true`.
``` bash
cd your_project_folder
npm install
```
---
## Dev Notes
- To automate building the many different layouts, this uses a module based approach. 
- Inside `src/config.json` there's an object for each banner. The array named `frame_modules` contains a module for each frame except for the end frame (which is coded into `main.html.hbs`)
- Each module can list a unique css template to style that module. For instance `module_intro.html.hbs` is paired with and of the css templates that have the `intro_` prefix.
- The most common module is `module_picTxt.html.hbs` & `module_picTxt.css.hbs` as it contains a photo and a paragraph of text. You can customize this by passing in css inside `config.json`. 
- Inside `config.json` individual css properties are listed in camelCase. But any key/value pairs inside a `css` object will need to be written as actual css because it will get printed into template. 
  
  Here's an example. This is a portion of module listed in config.json
    
  ```json
  "id": "mod3",
  "txt": {
    "spans":[
      { "class":"brandon", "txt": "TRANSFORM", "css": {"letter-spacing": "3px"}},
      { "class":"minion", "txt": "your home", "css": {"margin-top": "7px"}}
    ]
  }
  ```
  Will print this HTML.
  ```html
  <div id="mod3-txt-wrapper" class="txt-wrapper">
    <p>
      <span id="mod3-txt1" class="brandon">TRANSFORM</span>
      <span id="mod3-txt2" class="minion">your home</span>
    </p>	
  </div>
  ```
  And this CSS.
  ```css
  span#mod3-txt1 {
    letter-spacing: 3px;
  }
  span#mod3-txt2 {
    margin-top: 7px;
  }
  ```
---
## Gulp Tasks
To run a task enter in the keyword `gulp` followed by one of the tasks listed below. For example:
``` bash
gulp build:all
``` 
Setting the `currentGroup` variable to one of the build group names (ex. "h2") will switch that to become the build that runs in the default build task.
``` bash
gulp
``` 

### Task List

Task Name    | What it Does
-------------|-----------
`all` | Runs `clean:html`, `build` and `zip` tasks a series.
`backups` | Copies all images from `src/backups/`. There's an option (in the comments) to add compression if needed.
`build` (default) | Compiles banners that the `currentGroup` variable is set to.
`build:img` | Compiles banners that the `currentGroup` variable is set to + copies over images.
`b(1-6)` | Compiles all banners for Concept(#).
`bi(1-6)` | Compiles Concept(#) banners and copies & all images from `src/banners/`.
`build:all` | Compiles all Concepts banners & copies & all images from `src/banners/` into `/build`.
`clean` | Deletes all files from the `build/html/`.
`clean:all` | Deletes all files from the `build/html/` & `build/zips/` folders.
`clean:backups` | Deletes all png and jpg files inside `build/html/`.
`clean:zips` | Deletes all files from the `build/zips/`.
`clean:fpo` | Deletes the `fpo` folder from each banner folder in `build/`.
`fpo(1-6)` | Injects an FPO image (1-6) into the HTML. Useful for aligning text over the layouts.
`preview` | This automatically creates the file `contentData.js` to list all banners for the preview site. All categories are printed onto a single page. *Be sure to set your naming + banner dimensions in `src/confg.json`.
`watch` | Automatically runs the `build` task if any files in `src/banners/` change.
`w(1-6)` | Starts a watch task for each FPO frame. So you can make edits while in FPO mode.
`zip` | Zips all deliverable banner files (excluding backups). Sets HTML name back to banner name.
