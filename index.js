const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const dateFnParse = require('date-fns/parse');
const dateFnFormat = require('date-fns/format');

function render(resume) {
    console.info("[render]", "starting", arguments.length);
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
    const sass = require("sass");
    const sassSrcPath = path.join(__dirname, 'sass', 'main.scss');
    const foundationSCSSPath = path.join(__dirname, 'node_modules', 'foundation-sites', 'scss');
    const resultRender = sass.renderSync({file: sassSrcPath, includePaths: [foundationSCSSPath]});
    return resultRender.css.toString();
}

Handlebars.registerHelper("standardizeDate", function(options) {
    const resumeDate = options.fn(this);
    if (!resumeDate) {
        return 'Present';
    }

    const regexYearMonth = /\d{4}-\d{2}/;
    let newDate;
    if (resumeDate.length === 4) {
        // assume year
        newDate = resumeDate;
    } else if (regexYearMonth.test(resumeDate)) {
        newDate = dateFnFormat(dateFnParse(`${resumeDate}-01`), 'MMM YYYY');
    } else {
        console.info('[standardizeDate]', 'fell through', resumeDate);
    }

    // console.info('newDate: ' + newDate);
    return newDate;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

module.exports = {
	render: render
};
