import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)

    return { ...initialProps }
  }
  

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=yes" />
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
