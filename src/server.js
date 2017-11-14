const toolbox = require('node-toolbox')
const path = require('path')
const requireAll = require('require-all')
const cookieParser = require('cookie-parser')
const app = toolbox.routing.getExpressApp()
app.use(cookieParser())

const routes = requireAll({
  dirname: path.join(__dirname, 'routes'),
  filter: /(.+).js$/
})

for (const key in routes) {
  const route = routes[key]
  app[route.method](route.path, route.handler)
}

toolbox.logger.info(`I'm alive!`)
