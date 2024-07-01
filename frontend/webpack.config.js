const path = require('path');

module.exports = {
  entry: './src/App.js',  // Entry point of your application
  output: {
    path: path.resolve(__dirname, 'dist'),  // Output directory
    filename: 'bundle.js'  // Output bundle file name
  },  devServer: {
    port: 3000, // Specify a port number that suits your setup
    open: true, // Open the default browser when webpack-dev-server starts
    // Additional devServer configurations as needed
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'  // Use babel-loader for JavaScript/JSX files
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']  // Use style-loader and css-loader for CSS files
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: {
          loader: 'file-loader',  // Use file-loader for images
          options: {
            name: '[name].[ext]',
            outputPath: 'images/'
          }
        }
      }
    ]
  }
};
