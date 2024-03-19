// import { List } from 'immutable'
// import React, { useEffect, useState } from 'react'
// import UrlPattern from 'url-pattern'
// import { Fun, Unit } from '../basics/fun'
// import { Options } from '../basics/options'
// import { Widget, fromJSX } from '../basics/widget'

// /**
//  * A wrapper over an untyped `React.Route` that adds a type `R` to the captured parameters of the route
//  */
// export interface Route<R> {
//   /**
//    * The title to show in the browser's tab, when the route matches.
//    *
//    * If not given defaults to empty string.
//    */
//   title?: string

//   /** The underlying URL path-template of the untyped `React.Route`.
//    *
//    * - It may be a hardcoded (relative)url path.
//    * - It may include the HTTP query parameters.
//    * - It can capture parameters.
//    *
//    * Note: all templates use `exact` matching and no partial matching.
//    *
//    * Template URL examples:
//    * - `/sometext`  , Exact matching of the string
//    * - `/static/:foo/more` , Captures to the `foo` variable a url segment as string. This string will never contain forward slashes (i.e. single url segment). String can be empty.
//    * - `/:foo/:bar?/static` , An optional url segment, the leading slash in front of `/:bar?` is optional in case `:bar` is empty.
//    * - `/:segs*` , 0 or more url segments captured in a single `segs` string-variable. The string may contain slashes, thus can be turned into an array of segments with `segs.splt('/')`
//    * - `/:segs(\\d+-[^/]*)+` , A variable followed by parentheses is a named regex. In this case, it matches 1 or more segments as in the example url: `1-somedecr1ption/6491237-othEr_Description/...`
//    *
//    * For more info on route templates, see the official repository: <https://github.com/pillarjs/path-to-regexp>
//    */
//   path?: string

//   /**
//    * A function that gets as input the untyped captured parameters returned the React-Router parser,
//    * and returns an equivalent but typed representation of the parameters, typed by `R`.
//    */
//   paramsToRoute: Fun<any, R>
// }

// /**
//  * A collection of routes that have the same parameters.
//  */
// export type Routes<R> = Array<Route<R>>

// /**
//  * A helper function to create a typed-[[Route]] with no title.
//  */
// export const route = <P, R>(path: string, paramsToRoute: Fun<P, R>): Route<R> => ({
//   path: path,
//   paramsToRoute: paramsToRoute,
// })

// /**
//  * A helper function to construct a typed [[Route]] which has no path and no parameters.
//  * It acts as a **catch-all** (default) router.
//  */
// export const notFoundRouteCase = <R,>(makeRoute: Fun<Unit, R>): Route<R> => ({ paramsToRoute: makeRoute })

// /**
//  * An adapter from an array of routes `R` into a widget `R`
//  * Note: There is no support for "nested routing". All hereby supllied routes act at top-level.
//  */
// export const routerSwitch =
//   <o,>(options?: Options) =>
//   (routes: Routes<o>): Widget<o> =>
//     router<o>(options)(routes)

// export const router =
//   <o,>(options?: Options) =>
//   (routes: Routes<o>): Widget<o> =>
//     fromJSX((setState) => <Router key={options?.key} routes={routes} setState={setState} />)

// export const Router = <o,>(props: { routes: Routes<o>; setState: (_: o) => void }) => {
//   const [currentLocation, setLocation] = useState<{ pathname?: string; search?: string }>({})
//   useEffect(() => {
//     const checkRouteChanges = setInterval(() => {
//       const location = window.location
//       const pathname = location.pathname
//       const search = location.search
//       if (pathname !== currentLocation.pathname || search !== currentLocation.search) {
//         setLocation({ pathname: pathname, search: search })
//         const matchedRoute = List(props.routes)
//           .map((route) => ({
//             route: route,
//             match:
//               route.path === undefined
//                 ? null
//                 : new UrlPattern(route.path, { segmentValueCharset: 'a-zA-Z0-9-_~ %/' }).match(pathname),
//           }))
//           .filter((routeAndMatch) => routeAndMatch.match !== null)
//           .first()
//         if (matchedRoute !== undefined) {
//           const searchParams: { [key: string]: undefined | string | string[] } = {}
//           for (const [key, value] of new URLSearchParams(search)) {
//             const currentValue = searchParams[key]
//             if (searchParams[key] === undefined) searchParams[key] = value
//             if (typeof currentValue === 'string') searchParams[key] = [currentValue, value]
//             if (Array.isArray(currentValue)) searchParams[key] = [...currentValue, value]
//           }
//           const params = { ...matchedRoute.match, ...searchParams }
//           props.setState(matchedRoute.route.paramsToRoute(params))
//           if (matchedRoute.route.title !== undefined) document.title = matchedRoute.route.title
//         }
//       }
//     }, 100)
//     return () => clearInterval(checkRouteChanges)
//   }, [currentLocation, props, props.routes])

//   return <></>
// }

// /**
//  * @deprecated
//  * A `browserRouter` decorates a widget with a `ReactRouterDom.BrowserRouter` top-level component.
//  * @param w is a widget, and *normally* this should contain a routerswitch
//  */
// export const browserRouter =
//   (options?: Options) =>
//   <o,>(w: Widget<o>): Widget<o> =>
//     fromJSX((onDone) => <React.Fragment key={options?.key}>{w.run(onDone)}</React.Fragment>)

// /**
//  * @deprecated
//  * A `memoryRouter` decorates a widget with a `ReactRouterDom.memoryRouter` top-level component.
//  * This router behaves the same as the browserRouter, but does not change the url of the document.
//  * This is useful for none browser environments like React native, electron app or when you simply
//  * don't have a real web server
//  * @see https://reactrouter.com/web/api/MemoryRouter
//  * @param w is a widget, and *normally* this should contain a routerswitch
//  */
// export const memoryRouter =
//   (options?: Options) =>
//   <O,>(w: Widget<O>): Widget<O> =>
//     fromJSX((onDone) => <React.Fragment key={options?.key}>{w.run(onDone)}</React.Fragment>)

// export const Link = (
//   props: { to: string } & Omit<
//     React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>,
//     'href'
//   >
// ) => {
//   const { to, onClick, ...rest } = props
//   return (
//     <a
//       href={to}
//       onClick={(event) => {
//         event.preventDefault()
//         navigate(props.to)
//         if (onClick !== undefined) onClick(event)
//       }}
//       {...rest}
//     />
//   )
// }

// /**
//  * @todo
//  */
// export const NavLink = (
//   props: { to: string; activeClassName?: string } & Omit<
//     React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>,
//     'href'
//   >
// ) => <Link {...props} />

// /**
//  * @deprecated use {@link navigate} directly instead (to prevent using effects unnecessarily)
//  */
// export const Redirect = (props: { to: string }) => {
//   useEffect(() => navigate(props.to), [props, props.to])
//   return <></>
// }

// export const navigate = (to: string) => window.history.pushState({}, '', to)

export {};
