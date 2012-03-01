
var fs  = require('fs'),
    cs  = require('coffee-script').CoffeeScript,
    min = require('uglify-js');

// Get filenames from inside 'src="..."' strings
function extractSrc (str) {
    var matches = str.match(/src ?[=:] ?"([-_\w\\\/\.]*)"/)
    if (matches === null) return "";
    return matches[1];
}

// Get list of target files by filtering index lines by some criteria
function compileList (lines, search) {
    var list = [];
    search = search || /\.coffee/;
    for (var i in lines) {
        if (lines[i].match(search)) {
            list.push(extractSrc(lines[i]));
        }
    }
    return list;
}

// If source file contains 'coffee', requires compiling before concatenating
function needsCompiling (filename) {
    return /\.coffee$/.test(filename);
}

// If destination file contains '.min.', wants crushing before finishing
function needsMinifying (filename) {
    return /\.min\.\w+$/.test (filename);
}

// Join files, compiling and minifying where required
function catFiles (filelist, minify) {

    var text = ""

    for (var i in filelist) {

        var filename = filelist[i],
            filetext = fs.readFileSync(filename, 'utf-8');

        text += "/*\n * " + filename + " - File number: " + i + "\n *\n */\n\n\n";

        if (needsCompiling(filename)) {
            filetext = cs.compile(filetext);
        }

        text += filetext
        text += "\n\n\n"
    }

    return minify ? min(text) : text;

}

// Make buildspec from project file
function getBuildOptions (specfile) {
    return cs.eval(fs.readFileSync(specfile, 'utf-8'), { bare : true });
}

// Scrapes given file for project structure
function buildProject (spec) {

    var proj = catFiles(spec.source, spec.minify);

    fs.writeFileSync(spec.target, proj);

}

// Watch directory for filechanges
function monitorFiles (dirlist) {

    var currentTimer = 0;

    function debounce () {
        clearTimeout(currentTimer);
        currentTimer = setTimeout(function () {
            console.log("Rebuilding...");
            rebuild();
        }, 200);
    }

    for (var i in dirlist) {

        var dir = dirlist[i];

        fs.watch(dir, function (event, filename) {
            if (filename && /\.(coffee|js)$/.test(filename) && event === 'change') {
                debounce();
            }
        });

    }
}



// Get project makefile
var spec = getBuildOptions(process.argv[2]);

// If monitoring set, create file watchers
if (spec.monitor) { monitorFiles(spec.monitor); }

rebuild = function () {
    buildProject(spec);
}

// Initial build
rebuild();
