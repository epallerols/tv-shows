module.exports = function(grunt) {
    grunt.initConfig({
        clean: ['build'],
        copy: {
            html: {
                src: 'app/index.html',
                dest: 'build/index.html'
            }
        },
        uglify: {
            scripts: {
                files: {
                    'build/scripts/main.min.js': 'app/scripts/main.js'
                }
            }
        },
        cssmin: {
            styles: {
                files: {
                    'build/styles/styles.min.css': 'app/styles/styles.css'
                }
            }
        },
        watch: {
            html: {
                files: ['app/index.html'],
                tasks: ['copy:html']
            },
            scritps: {
                files: ['app/scripts/main.js'],
                tasks: ['uglify:scripts']
            },
            styles: {
                files: ['app/styles/styles.css'],
                tasks: ['cssmin:styles']
            }
        }
    });

    // Load npm tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'copy', 'uglify', 'cssmin']);
};
