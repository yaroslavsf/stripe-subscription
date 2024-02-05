import { Html, Head, Main, NextScript } from 'next/document'
import {Metadata} from "next";

// <!-- SEO ops: enc, IE, mobiles, info -->
//     If encoding problem met: https://github.com/vercel/next.js/issues/237
//      <meta charset="UTF-8">
//     Supported out of the box:
//      <meta http-equiv="X-UA-Compatible" content="IE=edge">
//     If problem met: https://stackoverflow.com/questions/65832820/next-js-viewport-meta-tags-should-not-be-used-in-document-jss-head
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
export const metadata: Metadata = {
    title: 'Stripe test',
    //if internationalization needed: https://developers.google.com/search/docs/specialty/international/localized-versions?visit_id=638403913016375032-3938119663&rd=1&hl=ru
    description: 'Subscription',

}
export default function Document() {
    return (
        <Html>
            <Head />
            <body>
            <Main />
            <NextScript />
            </body>
        </Html>
    )
}