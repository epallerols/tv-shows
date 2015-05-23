module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-autoprefixer');

    grunt.initConfig({
        clean: {
            pre: ['build', '.tmp'],
            post: ['.tmp']
        },
        copy: {
            html: {
                src: 'app/index.html',
                dest: 'build/index.html'
            }
        },
        wiredep: {
            html: {
                src: 'build/index.html'
            }
        },
        autoprefixer: {
            css: {
                src: '.tmp/concat/styles/styles.min.css',
                options: {
                    browsers: ['last 2 versions', 'ie 9'],
                    cascade: false
                }
            }
        },
        useminPrepare: {
            html: 'build/index.html',
            options: {
                root: 'app',
                dest: 'build'
            }
        },
        usemin: {
            html: 'build/index.html'
        }
    });

    grunt.registerTask('default', [
        'clean:pre',
        'copy',
        'wiredep',
        'useminPrepare',
        'concat',
        'autoprefixer',
        'cssmin',
        'uglify',
        'usemin',
        'clean:post'
    ]);
};
