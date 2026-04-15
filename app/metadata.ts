import { Metadata } from "next";

export const staticMetadata: Metadata = {
    metadataBase: new URL("https://health-and-recreation.com/"),
    applicationName: "Health+Recreation",
    title: {
      template: 'Health+Recreation| %s',
      default: 'Health+Recreation', // a default is required when creating a template
    },
    description: "Health+Recreation is the design studio of otherseas1.",
    keywords: ["design", "websites", "freelance", "media", "music", "services"],
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
      googleBot: "index, follow"
    },
    openGraph: {
      locale: "en_US",
      siteName: "Health+Recreation | Studio",
      url: "https://health-and-recreation.com/",
      type: "website",
      images: [
        {
          url: "https://health-and-recreation.com/sign.svg",
          width: 1200,
          height: 630,
          alt: "Health+Recreation"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "Health+Recreation | Studio",
      
      images: [
        {
          url: "https://health-and-recreation.com/",
          width: 1200,
          height: 630,
          alt: "Health+Recreation"
        }
      ]
    }
  };