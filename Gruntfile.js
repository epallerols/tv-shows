module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    uglify: {
      tvshows: {
        files: {
          'app/scripts/main.min.js': 'app/scripts/main.js'
        }
      }
    },
    cssmin: {
      style: {
        files: {
         'app/styles/styles.min.css': 'app/styles/styles.css'
        }
      }
    },
    watch: {
      js: {
        files: ['app/scripts/main.js'],
        tasks: ['uglify:tvshows']
      },
      css: {
        files: ['app/styles/styles.css'],
        tasks: ['cssmin:style']
      }
    }
  });

  // Load npm tasks.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'cssmin']);
};
