const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

function render(resume) {
    console.info("[render]", "starting");
    // const css = fs.readFileSync(__dirname + "/style.css", "utf-8");
    // console.info("[render]", "css", css);
    let cssCompiled;
    try {
        cssCompiled = buildStyles();
    } catch(exc) {
        console.err(exc);
    }
    // console.info("[render]", "cssCompiled", cssCompiled);
	const tpl = fs.readFileSync(__dirname + "/resume.hbs", "utf-8");
	const partialsDir = path.join(__dirname, 'partials');
	const filenames = fs.readdirSync(partialsDir);

	filenames.forEach(function (filename) {
	  const matches = /^([^.]+).hbs$/.exec(filename);
	  if (!matches) {
	    return;
	  }
	  const name = matches[1];
	  const filepath = path.join(partialsDir, filename)
	  const template = fs.readFileSync(filepath, 'utf8');

	  Handlebars.registerPartial(name, template);
	});
	return Handlebars.compile(tpl)({
		css: cssCompiled,
		resume: resume
	});
}

function buildStyles() {
    // console.info("[buildStyles]", "starting");
    const sass = require("node-sass");
 
    const sassSrcPath = path.join(__dirname, 'sass', 'main.scss');
    const foundationSCSSPath = path.join(__dirname, 'node_modules', 'foundation-sites', 'scss');
    // console.info("sassSrcPath", sassSrcPath);
    const resultRender = sass.renderSync({file: sassSrcPath, includePaths: [foundationSCSSPath]});
    const resultCSS = resultRender.css.toString();
    // console.info("[buildStyles]", "resultCSS", resultCSS);
    return resultCSS;
}

module.exports = {
	render: render
};
