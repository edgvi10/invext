import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <meta charSet="utf-8" />
                    <link rel="stylesheet" href={`/plugins/fontawesome/css/all.min.css`} />
                    <link rel="stylesheet" href={`/plugins/bootstrap/bootstrap.min.css`} />
                    <script src={`/plugins/bootstrap/bootstrap.bundle.min.js`} />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}