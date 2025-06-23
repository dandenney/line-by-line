import Head from 'next/head';
import Auth from '@/components/Auth';

export default function AuthPage() {
  return (
    <>
      <Head>
        <title>Sign In - Line by Line</title>
        <meta name="description" content="Sign in to your journal" />
      </Head>
      <Auth />
    </>
  );
}

export async function getServerSideProps() {
  return { props: {} };
} 