
const path = require('path');

module.exports = {
  // ...existing code...
  resolve: {
    alias: {
      'react-native-maps': path.resolve(__dirname, 'mocks/react-native-maps.js'),
    },
  },
};