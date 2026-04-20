import { Metadata } from "next";

export const staticMetadata: Metadata = {
    metadataBase: new URL("https://health-and-recreation.com/"),
    applicationName: "Health+Recreation",
    title: {
      template: 'Health+Recreation| %s',
      default: 'Health+Recreation', // a default is required when creating a template
    },
    description: "Health+Recreation is the website development studio of otherseas1.",
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
      siteName: "Health+Recreation | Home",
      url: "https://health-and-recreation.com/",
      type: "website",
      images: [
        {
          url: "https://health-and-recreation.com/opengraph.png",
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
          url: "https://health-and-recreation.com/opengraph.png",
          width: 1200,
          height: 630,
          alt: "Health+Recreation"
        }
      ]
    }
  };