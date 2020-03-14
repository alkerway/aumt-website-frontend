const { override, fixBabelImports, addLessLoader } = require('customize-cra');
const darkTheme = require('@ant-design/dark-theme')

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {
      ...darkTheme.default,
      '@primary-color': '#33b3b3',
      '@body-background': '#141414',
      '@white': 'rgba(255, 255, 255, 0.67)'
    }
  }),
);