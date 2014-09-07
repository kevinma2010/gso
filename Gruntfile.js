module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		copy: {
			main: {
				files: [
					{
						expand: true, 
						src: ['bin/**', 'lib/**', 'routers/**', 'public/images/**','app.js','LICENSE','README.md','package.json'], 
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
						content = content.replace(/r_prefix: ""/g, 'r_prefix: "//gusou.qiniudn.com"');
						content = content.replace(/'en',/g, '\'zh-CN\'');
						content = content.replace(/'https:\/\/www.google.com.hk'/g, '\'http:\/\/74.125.235.68\'');
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
					dest: 'build/public/stylesheets/'
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
					dest: 'build/public/javascripts/'
				}]
			}
		},
		clean: {
			build: ['build']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['clean', 'cssmin', 'uglify', 'copy']);
};
