import Head from "next/head";

interface PwaMetaProps {
  themeColor?: string;
  logoUrl?: string;
  appName?: string;
}

export function PwaMeta({ themeColor = "#F8F7F4", logoUrl, appName = "Torque Log" }: PwaMetaProps) {
  return (
    <Head>
      <link rel="manifest" href="/api/manifest" />
      <meta name="theme-color" content={themeColor} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={appName} />
      {logoUrl && (
        <>
          <link rel="apple-touch-icon" href={logoUrl} />
          <link rel="apple-touch-icon" sizes="180x180" href={logoUrl} />
          <link rel="icon" href={logoUrl} />
        </>
      )}
    </Head>
  );
}