import NextNProgress from 'nextjs-progressbar';
import { AppProps } from 'next/app';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <NextNProgress color="#ff57b2" />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
