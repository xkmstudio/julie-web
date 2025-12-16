import React from 'react'
import styled, { css } from 'styled-components'

const Logo = ({ projectName }) => {
  return (
    <Icon isLogin={projectName}>
      <img className="w-20" src="../static/marcd_studio_favicon_touch.png" />
    </Icon>
  )
}

const Icon = styled.div`
  display: block;
  width: auto;
  height: 1.5em;
  max-width: 100%;
  margin: auto;
  color: white;

  ${props =>
    props.isLogin &&
    css`
      display: block;
      margin: 0 auto;
      height: 4em;
      color: black;
    `}

  img {
    display: block;
    margin: 0 auto;
    height: 100% !important;
    width: auto;
    fill: currentColor;
  }
`

export default Logo
