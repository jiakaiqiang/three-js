const { defineConfig } = require('@vue/cli-service')
const {resolve} = require("path");
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave:false,
 configureWebpack:{
    resolve:{
      alias:{
        "@":resolve(__dirname,"src"),
      }
    }
  },
  // devServer:{
  //   headers: {
  //     "Access-Control-Allow-Origin": "*" // 开启应用间的跨域访问
  //   },
    
  // }
  
})
