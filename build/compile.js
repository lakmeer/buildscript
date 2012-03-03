
var fs    = require('fs'),
//    cs    = require('coffee-script').CoffeeScript,
    min   = require('uglify-js'),

    Tools         = require('helpers'),
    File          = require('fileclass'),
    Messenger     = require('messenger'),
    ErrorReporter = require('errors');





// Load project file

var projectFile = (function (projectFilename) {

    var defaults = {
        options : {
            watch  : false,
            bare   : false,
            minify : false,
            test   : false,
            errors : {
                shell   : false,
                console : false,
                dom     : false
            }
        },
        monitor : [],
        source  : [],
        tests   : []
    };

    // Extract file contents, compiling from CS if required
    var config = eval(new File(projectFilename, true).compiled);

    // Make sure critical parts of config haven't been missed. All are set to
    // false so that values in project spec are false by omission, not true.
    (function checkExistance(config, defaults) {
        for (var k in defaults) {
            if (typeof config[k] === 'object') {
                checkExistance(config[k], defaults[k]);
            } else {
                if (typeof config[k] === 'undefined') {
                    config[k] = defaults[k];
                }
            }
        }
    }(config, defaults));

    // Use options to set error reporting level
    ErrorReporter.setLevels(config.options.errors);

    // Expose configuration to application
    return config;

}(process.argv[2]));








var Monitor = function MonitorClass (filelist, callback) {

    console.log('Monitor mode enabled...');

    // Watch directory for filechanges
    var currentTimer = 0;

    function debounce (filename) {
        clearTimeout(currentTimer);
        currentTimer = setTimeout(function () {
            callback(filanme);
        }, 200);
    }

    for (var i in filelist) {
        var dir = filelist[i];
        console.log('Monitoring ' + dir + "...");
        fs.watch(dir, function (event, filename) {
            if (filename && /\.(coffee|js)$/.test(filename) && event === 'change') {
                debounce(filname);
            }
        });
    }

}





var Compiler = function CompilerClass (projectFilename) {

    // Bind class scope
    var _this = this;

    // Read project config
    var theProject = this.loadProject(projectFilename, _this);

    // Set up file monitoring for compile-on-write
    if (theProject.config.options.watch) {

        var _compile = this.compile;

        new Monitor(theProject.config.monitor, function (filename) {

            console.log("File write detected, rebuilding...");
            _compile();

        });

    }

}


Compiler.prototype.loadProject = function _Compiler_loadProject (projectFilename, _this) {

    var project  = new Project(projectFilename, function (err) {
        return _this.errorHandler(err);
    });

    this.options     = project.config.options;
    this.destination = project.config.target;

    // Get all file contents
    this.sourceFiles = this.createFileList(project.config.source);
    this.testFiles   = this.createFileList(project.config.tests);

    return project;

}





Compiler.prototype.createFileList = function _Compiler_createFileList (filenames) {

    var _handler = this.errorHandler,
        _errors  = this.options.errors;

    var results = [];

    for (var i in filenames) {
        var thisFilename = filenames[i];
        results.push(new File(thisFilename, function (e) { return _handler(e, _errors); }, this.options.bare));
    }

    return results;
}


Compiler.prototype.writeHeader = function _Compiler_writeHeader(filename, fileNumber) {
    var fileNumber = fileNumber || "";
    return Tools.jsCommentString(filename + " - File number: " + (Number(fileNumber) + 1));
}


Compiler.prototype.compile = function _Compiler_compile() {

    var concatenatedScript = "";

    if (this.attribution) { concatenatedScript += this.options.attribution; }
    if (this.options.errors.dom) { concatenatedScript += new File('build/domerror.js'); }

    concatenatedScript += Tools.jsCommentString(this.destination + '\n' + Tools.becomeLine(this.destination, '=') + '\n\nBuilt last on ' + Tools.today());
    concatenatedScript += this.concatenate(this.sourceFiles);

    if (this.options.test)   { concatenatedScript += this.concatenate(this.testFiles); }
    if (this.options.minify) { concatenatedScript = min(concatenatedScript) }

    this.write(concatenatedScript);
    return concatenatedScript;

}


Compiler.prototype.concatenate = function _Compiler_concatenate (list) {

    var result = "";

    for (var i in list) {
        var thisFile = list[i];
        result += this.writeHeader(thisFile.filename, i);
        result += thisFile.compiled + "\n\n\n\n";
    }

    return result;
}


Compiler.prototype.write = function _Compiler_write (text) {

    try {

        fs.writeFileSync(this.destination, text);

    } catch (e) {

        var targetDir = this.destination.replace(/\/[^\/]*$/, '');
        console.error("Can't open destination file for reading... hang on...");

        try {
            console.log("Trying to find directory:", targetDir);
            fs.readdirSync(targetDir);
        } catch (e) {
            console.log("Can't find it. Attempting to mkdir...")
            fs.mkdirSync(targetDir);
            try {
                this.write(text);
            } catch (e) {
                console.error("!! FATAL: Nope, can't open it. Final error message follows:\n" + e)
                process.exit(1);
            }
        }
    }
}
