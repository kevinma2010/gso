module.exports = function (grunt) {

	var static_dir = 'build/';
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		copy: {
			statics: {
				files: [
					{
						expand: true, 
						src: ['public/images/**'], 
						dest: static_dir
					},
					{
						src: ['public/*'],
						dest: static_dir,
						filter: 'isFile'
					}
				]
			},
			main: {
				files: [
					{
						expand: true, 
						src: ['bin/**', 'lib/**', 'routes/**', 'public/images/**','app.js','LICENSE','README.md','package.json'], 
						dest: 'build/'
					},
					{
						src: ['public/*'],
						dest: 'build/',
						filter: 'isFile'
					}
				]
			},
			views: {
				expand: true,
				src: ['views/**'],
				dest: 'build/',
				options: {
					process: function (content, srcpath) {
						content = content.replace(/\/\/www.google-analytics.com/g, '<%= r_prefix %>\/javascripts');
						content = content.replace(/<!--\/\/gascript/g, ' ');
						content = content.replace(/\/\/gascript-->/g, ' ');
						return content;
					}
				}
			},
			config: {
				src: 'config.js',
				dest: 'build/config.js',
				options: {
					process: function (content, srcpath) {
						// content = content.replace(/r_prefix: ""/g, 'r_prefix: "//gusou.qiniudn.com"');
						content = content.replace(/'en'/g, '\'zh-CN\'');
						content = content.replace(/'https:\/\/www.google.com.hk'/g, '\'http:\/\/74.125.204.94\'');
						return content;
					}
				}
			}
		},
		cssmin: {
			main: {
				files: [{
					expand: true,
					cwd: 'public/stylesheets/',
					src: ['*.css', '!*.min.css'],
					dest: static_dir+'public/stylesheets/'
				}]
			}
		},
		uglify: {
			options: {},
			main: {
				files: [{
					expand: true,
					cwd: 'public/javascripts/',
					src: '**/*.js',
					dest: static_dir+'/public/javascripts/'
				}]
			}
		},
		clean: {
			build: ['build'],
			statics: [static_dir+'/public']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('static',['clean:statics', 'cssmin', 'uglify', 'copy:statics']);

	grunt.registerTask('default', ['clean', 'cssmin', 'uglify', 'copy']);
};
