module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    uglify: {
      "tvshows": {
        files: {
          'js/tvshows.min.js': 'js/tvshows.js'
        }
      }
    },
    cssmin: {
      "style": {
        files: {
         'css/style.min.css': 'css/style.css'
        }
      }
    },
    watch: {
      "js": {
        files: ['js/tvshows.js'],
        tasks: ['uglify:tvshows']
      },
      "css": {
        files: ['css/style.css'],
        tasks: ['cssmin:style']
      }
      
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'cssmin']);

};