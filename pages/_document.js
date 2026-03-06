import Document, { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)

    return { ...initialProps }
  }
  

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />
          {/* Pandectes cookie consent - load before app for consent banner */}
          <Script
            id="pandectes-rules"
            src="https://st.pandect.es/julie-products-inc/pandectes-rules.js"
            strategy="beforeInteractive"
          />
        </Head>
        <body className="bg-white">           
          <Main />
          <NextScript />
          <div id="drawer" />
          <div id="ema-chat" />
        </body>
      </Html>
    )
  }
}

export default MyDocument
