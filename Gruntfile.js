module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

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
        'cssmin',
        'uglify',
        'usemin',
        'clean:post',
    ]);
};
