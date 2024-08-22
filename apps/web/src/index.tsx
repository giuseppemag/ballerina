import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'

import { Route, RouterProvider, useRouter } from '@tenet/core-react'

const Rand = ({ params }: { params: any }) => {
  const { navigate } = useRouter()

  console.log('params', params)

  return <p onClick={() => navigate('/')}>Random</p>
}

const rootEl = document.getElementById('root')
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl)
  root.render(
    <React.StrictMode>
      <RouterProvider>
        <Route path="/" component={App} />
        <Route path="/user/:id/:obj" component={Rand} />
      </RouterProvider>
    </React.StrictMode>
  )
}
