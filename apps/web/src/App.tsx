import './App.css'

import { Link, useRouter } from '@tenet/core-react'
import React from 'react'

import { Authentication } from '@domains/authentication/authentication.domain'
import { AuthenticationTemplate } from '@domains/authentication/authentication.template'
import { AuthenticationLayout } from '@domains/authentication/components/AuthenticationLayout'

const App = () => {
  const { path, navigate, searchParams } = useRouter()

  console.log('path', path)
  console.log('searchParams', searchParams.toString())

  const [authentication, setAuthentication] = React.useState(Authentication.Default())

  const authenticationForeignMutations = React.useMemo(() => {
    return Authentication.ForeignMutations({ context: authentication, setState: setAuthentication })
  }, [authentication, setAuthentication])

  const states = [{ x: 5 }, { y: 2 }].map((obj) => React.useState(obj))

  console.log(states[0][0], states[1][0])

  // React.useEffect(() => {
  //   const handler = (e: FocusEvent) => {
  //     console.log('focussing')

  //     if (!AsyncState.Operations.isLoading(authentication.user.response)) {
  //       console.log('not loading true')

  //       setAuthentication(Authentication.Updaters.Core.user(Queryable.Updaters.response(AsyncState.Updaters.toReloading()))(authentication))
  //     }
  //   }

  //   window.addEventListener('focus', handler)

  //   return () => {
  //     window.removeEventListener('focus', handler)
  //   }
  // }, [authentication, setAuthentication])

  return (
    <div className="content">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>

      <Link href="/user/500/a">User</Link>

      {/* <ParentCoroutinesRunner context={parent} setState={setParent} foreignMutations={authenticationForeignMutations} view={unit} /> */}

      <AuthenticationTemplate
        context={authentication}
        setState={setAuthentication}
        foreignMutations={{}}
        view={AuthenticationLayout}
      />
    </div>
  )
}

export default App
