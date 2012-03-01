###
#
# Project build process specification
#

  This is basically like a makefile. I like to keep all build
  related stuff in the build-folder, but keep paths realtive to the
  web root directory. This mean the builder is invoked from the root:

  `node build/compile.js build/project.coffee`

  About this example:
    This is an example project.coffee, detailing a fictional project.
    The project has a couple of interesting features, such as mingling
    of coffee and pure-js source code, minification, and drawing modules
    from a persistent, project-agnostic library (I keep mine in Dropbox;
    could easily be a github repo etc).

  Single hash '#' coffeescript comments are part of project file docs
  Double hash '##' comments are my commentary about this fictional
    example project

###


project =

    # Configuration switches
    options :

        # Uses uglify to minify output if true
        minify : off

        # Use coffeescript's security context wrapper
        bare : on

        # Include files defined under 'tests' or not
        test : on

        # Watch for changes in paths defined by 'monitor'
        watch : on
            ## If not set, compiles once and exits.


    # Specify directories or files to monitor for file writes
    monitor : [
        "src"
        "lib"
        "~/Dropbox/jslib/"
        "build/project.coffee"  ## You can totally monitor this file too
    ]


    # Target file contains resulting compiled code
    target : "bin/app.min.js"


    # List of source files, in concatenation order
    source : [

        # Frameworks
        "lib/threejs.js"
        # "lib/jquery-1.7.1.min.js"
            ## Have disabled jquery compilation for now as it
            ## makes the resulting file to large - use CDN instead


        # Libraries
        "~/Dropbox/jslib/common-tools.coffee"
        "~/Dropbox/jslib/broadcaster.coffee"
            ## Centrally-maintained common library of modules

        "lib/underscore.js"
            ## Project-local copies of libs I don't maintain


        # App Structure
        "src/cs/app.coffee"
        "src/cs/program.coffee"
        "src/cs/tools.coffee"
            ## Architectural stuff, main program controller etc


        # Modules
        "src/cs/underscore_ext.coffee" ## My custom underscore mixins
        "src/cs/myclass.coffee"
        "src/cs/someclass.coffee"
        "src/cs/otherclass.coffee"
            ## Guts of the program

        "src/js/collection.js"
        "src/js/helpers.js"
        "src/js/feature.js"
            ## Code modules maintained by a project
            ## collaborator; she writes pure javascript

    ]


    # Files to be included when options.test is on
    tests : [

        # Test runner
        "test/lib/qunit.js"

        # Unit Tests              ## CS/JS mixed in
        "test/underscore_ext.coffee"
        "test/myclass.coffee"
        "test/feature.js"
        "test/someclass.coffee"
        "test/otherclass.coffee"
        "test/collection.js"
        "test/myhelpers.js"
        "test/tools.coffee"

        # Integration tests
        "test/integration.coffee"

    ]


    # End of project configuration

