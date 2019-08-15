// Importing the blog posts from the old blog, and converting them to new format

const fs = require("fs-extra");
const fm = require("front-matter");
const path = require("path");

const output = path.join(__dirname, "../sources/");

fs.emptyDirSync(output);

const old = path.join(__dirname, "/../../krawaller.github.io/");

fs.readdirSync(old + "_source/files/posts/")
  .filter(f => f !== ".DS_Store")
  .forEach(f => {
    let postFile = fs.readFileSync(old + "_source/files/posts/" + f).toString();
    const folderName = f.replace(/\.[^\.]*$/, "");
    fs.mkdirSync(output + folderName);
    const { attributes, body } = fm(postFile);

    // Add id
    const id = folderName.split("_")[1];
    postFile = postFile.replace(/^---\n/, `---\nid: ${id}\n`);

    // Add url
    const url = titleToUrl(attributes.title);
    try {
      fs.readdirSync(old + "/posts/" + url);
    } catch (e) {
      console.log(attributes.title, attributes.date);
      throw "Incorrect URL: " + url;
    }
    postFile = postFile.replace(
      /^---\n/,
      `---\nurl: "${titleToUrl(attributes.title)}"\n`
    );

    // Fix author id
    postFile = postFile.replace("author: David", "author: david");

    // Fix images
    postFile = postFile.replace(
      /(\.\.\/\.\.\/img\/.*?)["') ]/g,
      (full, file) => {
        fs.ensureDirSync(output + folderName + "/static/img/");
        const imgName = file.replace("../../img/", "");
        fs.copyFileSync(
          old + "img/" + imgName,
          output + folderName + "/static/img/" + imgName
        );
        return full.replace("../../img", "./static/img");
      }
    );

    // Fix applets
    postFile = postFile.replace(
      /(\.\.\/\.\.\/applets\/.*?)["') ]/g,
      (full, file) => {
        fs.ensureDirSync(output + folderName + "/static/applets/");
        const appletName = file.replace("../../applets/", "").split("/")[0];
        fs.copySync(
          old + "applets/" + appletName,
          output + folderName + "/static/applets/" + appletName
        );
        return full.replace("../../applets", "./static/applets");
      }
    );

    // Fix diagrams
    postFile = postFile.replace(
      /(\.\.\/\.\.\/diagrams\/.*?)["') ]/g,
      (full, file) => {
        fs.ensureDirSync(output + folderName + "/static/diagrams/");
        const diagramName = file.replace("../../diagrams/", "");
        fs.copyFileSync(
          old + "diagrams/" + diagramName,
          output + folderName + "/static/diagrams/" + diagramName
        );
        fs.copyFileSync(
          old + "diagrams/" + diagramName.replace(/png$|svg$/, "dot"),
          output +
            folderName +
            "/static/diagrams/" +
            diagramName.replace(/png$|svg$/, "dot")
        );
        return full.replace("../../diagrams", "./static/diagrams");
      }
    );

    /*
    // Fix links
    postFile = postFile.replace(
      /[^!]\[([^\]]*)]\(\.\.\/([^)/]*)\/?\)/g,
      (full, text, url) => {
        return `${full[0]}<Link to="${url}">${text}</Link>`;
      }
    );
    */

    fs.outputFileSync(output + folderName + "/post.md", postFile);
  });

function titleToUrl(title) {
  return title
    .replace(/[()\.]/g, " ")
    .replace(/[^0-9a-zåäöA-ZÅÄÖ\- ]/g, "")
    .replace(/ /g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/-$/, "")
    .toLowerCase();
}
