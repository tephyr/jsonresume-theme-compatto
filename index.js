const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const dateFnParse = require('date-fns/parse');
const dateFnFormat = require('date-fns/format');

function render(resume) {
    const _fnName = '[render]';
    console.info(_fnName, "starting", arguments.length);
    // const css = fs.readFileSync(__dirname + "/style.css", "utf-8");
    // console.info(_fnName, "css", css);
    let cssCompiled;
    try {
        cssCompiled = buildStyles();
    } catch(exc) {
        console.err(exc);
    }

    console.info(_fnName, "cssCompiled length", cssCompiled.length);

	const tpl = fs.readFileSync(path.join(__dirname, "resume.hbs"), "utf-8");
	const partialsDir = path.join(__dirname, 'partials');
	const filenames = fs.readdirSync(partialsDir);

    console.info(_fnName, 'resume.hbs size', tpl.length);
    console.info(_fnName, '# of template files', filenames.length);

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

    let location = 0;

    try {
        const template = Handlebars.compile(tpl);
        location++;
    	return template({
    		css: cssCompiled,
    		resume: resume
    	});
    } catch(exc) {
        console.error(exc);
        console.info(_fnName, `ERROR: compiling/using template (location: ${location})`, exc.formatted);
    }
}

function buildStyles() {
    const _fnName = '[buildStyles]';
    console.info(_fnName, 'starting');

    const sass = require("sass");
    const sassSrcPath = path.join(__dirname, 'sass', 'main.scss');
    const foundationSCSSPath = path.join(__dirname, 'node_modules', 'foundation-sites', 'scss');

    // console.info(_fnName, 'sassSrcPath', sassSrcPath);
    // console.info(_fnName, 'foundationSCSSPath', foundationSCSSPath);

    try {
        const resultRender = sass.renderSync({file: sassSrcPath, includePaths: [foundationSCSSPath]});
        return resultRender.css.toString();
    } catch(exc) {
        console.error(exc);
        console.info(exc.formatted);
    }
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
        const parsedDate = dateFnParse(`${resumeDate}-01`, 'yyyy-MM-dd', new Date());
        newDate = dateFnFormat(parsedDate, 'MMM yyyy');
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
