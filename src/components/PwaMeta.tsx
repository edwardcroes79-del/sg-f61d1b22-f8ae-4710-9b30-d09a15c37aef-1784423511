import Head from "next/head";

interface PwaMetaProps {
  themeColor?: string;
}

export function PwaMeta({ themeColor = "#F8F7F4" }: PwaMetaProps) {
  return (
    <Head>
      <link rel="manifest" href="/api/manifest" />
      <meta name="theme-color" content={themeColor} />
    </Head>
  );
}