/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import 'babel-polyfill'

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { applyRouterMiddleware, Router, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { useScroll } from 'react-router-scroll'

import App from './containers/App/index'

import { makeSelectLocationState } from '../app/containers/App/selectors'

import LanguageProvider from '../app/containers/LanguageProvider'

import '!file-loader?name=[name].[ext]!../app/favicon.ico'
import '!file-loader?name=[name].[ext]!../app/manifest.json'
import 'file-loader?name=[name].[ext]!../app/.htaccess'

import configureStore from './store'

import { translationMessages } from '../app/i18n'

import createRoutes from './routes'

import 'antd/dist/antd.less'
import '../libs/react-grid-layout/css/styles.css'
import '../libs/react-resizable/css/styles.css'
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker3.standalone.min.css'
import 'react-quill/dist/quill.snow.css'
import '../app/assets/fonts/iconfont.css'
import '../app/assets/override/antd.css'
import '../app/assets/override/react-grid.css'
import '../app/assets/override/datepicker.css'
import '../app/assets/less/style.less'

import * as echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/scatter'
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/sankey'
import 'echarts/lib/chart/funnel'
import 'echarts/lib/chart/treemap'
import 'echarts/lib/chart/heatmap'
import 'echarts/lib/chart/boxplot'
import 'echarts/lib/chart/graph'
import 'echarts/lib/chart/gauge'
import 'echarts/lib/chart/radar'
import 'echarts/lib/chart/parallel'
import 'echarts/lib/chart/pictorialBar'
import 'echarts-wordcloud'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/legendScroll'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/dataZoom'
import 'echarts/lib/component/visualMap'
import 'echarts/lib/component/geo'
import '../app/containers/Widget/charts/mapFile/china'

import { DEFAULT_ECHARTS_THEME } from '../app/globalConstants'
echarts.registerTheme('default', DEFAULT_ECHARTS_THEME)

const initialState = {}
const store = configureStore(initialState, hashHistory)

const history = syncHistoryWithStore(hashHistory, store, {
  selectLocationState: makeSelectLocationState()
})

const rootRoute = {
  path: '/',
  component: App,
  childRoutes: createRoutes(store),
  indexRoute: {
    onEnter: (_, replace) => {
      replace('/share')
    }
  }
}

const render = (messages) => {
  ReactDOM.render(
    <Provider store={store}>
      <LanguageProvider messages={messages}>
        <Router
          history={history}
          routes={rootRoute}
          render={
            // Scroll to top when going to a new page, imitating default browser
            // behaviour
            applyRouterMiddleware(useScroll())
          }
        />
      </LanguageProvider>
    </Provider>,
    document.getElementById('app')
  )
}

// Hot reloadable translation json files
if (module.hot) {
  // modules.hot.accept does not accept dynamic dependencies,
  // have to be constants at compile-time
  module.hot.accept('../app/i18n', () => {
    render(translationMessages)
  })
}

interface IWindow extends Window {
  Intl: any
  __REACT_DEVTOOLS_GLOBAL_HOOK__: any
}
declare const window: IWindow

// Chunked polyfill for browsers without Intl support
if (!window.Intl) {
  (new Promise((resolve) => {
    resolve(import('intl'))
  }))
    .then(() => Promise.all([
      import('intl/locale-data/jsonp/en.js'),
      import('intl/locale-data/jsonp/de.js')
    ]))
    .then(() => render(translationMessages))
    .catch((err) => {
      throw err
    })
} else {
  render(translationMessages)
}

// Install ServiceWorker and AppCache in the end since
// it's not most important operation and if main code fails,
// we do not want it installed
if (process.env.NODE_ENV === 'production') {
  // disable react developer tools in production
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = () => void 0
  }
}

// if (process.env.NODE_ENV !== 'production') {
//   const { whyDidYouUpdate } = require('why-did-you-update')
//   whyDidYouUpdate(React)
// }
