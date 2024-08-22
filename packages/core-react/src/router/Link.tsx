import React from 'react'

import { useRouter } from './useRouter'

export interface LinkProps
  extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
  href: string
}

export const Link = ({ href, onClick, ...props }: LinkProps) => {
  const { navigate } = useRouter()

  const handleClick = React.useCallback((e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()

    if (onClick) {
      onClick(e)
    }

    React.startTransition(() => {
      navigate(href)
    })
  }, [])

  return <a href={href} onClick={handleClick} {...props}></a>
}
