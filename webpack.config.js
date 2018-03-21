var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var autoprefixer = require('autoprefixer');
var projectRoot = path.resolve(__dirname, './');

var config = {
	entry: {
    app: "./src/app.js"
  },
	output: {
		path: path.join(__dirname, "dist"),
		filename: "main.js"
	},
  resolve: {
    extensions: ['', '.js'],
    alias: {
      'src': path.resolve(__dirname, './src'),
      'assets': path.resolve(__dirname, './src/assets'),
      'utils': path.resolve(__dirname, './src/utils')
    }
  },
	module: {
		loaders: [
			{test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader')},
			{test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?-autoprefixer&sourceMap&?imortLoaders=1!postcss-loader!less-loader')},
			{test: /\.html$/, loader: 'html'},
      {test: /\.js$/, loader: 'babel', include: projectRoot, exclude: /node_modules/, query: {presets: ['es2015']} },
      {test: /\.png$/, loader: 'url?limit=8192&mimetype=image/png'},
      {test: /\.jpe?g$/, loader: 'url?limit=8192&mimetype=image/jpg'},
      {test: /\.gif$/, loader: 'url?limit=8192&mimetype=image/gif'},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=image/svg+xml'},
      {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=application/font-woff2'},
      {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=application/font-woff'},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=application/octet-stream'},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'}
		]
	},
  babel: {
    presets: ['es2015'],
    plugins: ['transform-runtime']
  },
  postcss: [ autoprefixer({ browsers: ['ie >= 8'] }) ],
	plugins: [
		new ExtractTextPlugin('style.css', {
			allChunks: true
		}),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
		new CopyWebpackPlugin([
      {from: './index.html', to: './index.html'},
      {from: './static', to: './static'}
		])
	]
};

if(process.env.NODE_ENV === 'production'){
	config.plugins = config.plugins.concat([
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
	]);
}

module.exports = config;
