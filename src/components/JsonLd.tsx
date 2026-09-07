/**
 * Schema.org JSON-LD Structured Data for Search Engine Optimization (SEO).
 *
 * Provides Googlebot and Bingbot with:
 * 1. WebApplication / EducationalApplication schema
 * 2. FAQPage schema (eligible for rich FAQ snippets in search results)
 * 3. HowTo schema for Khmer touch typing guide
 */

export function JsonLd() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://khmer-typing.vercel.app";

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": ["WebApplication", "SoftwareApplication"],
    name: "Typing Quest",
    alternateName: ["ដំណើរផ្សងព្រេងវាយអក្សរ", "Khmer Typing Quest", "Khmer Typing Tutor"],
    url: baseUrl,
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Typing Tutor / Educational Game",
    operatingSystem: "Any (Web, iOS, Android, macOS, Windows, Linux)",
    browserRequirements: "Requires JavaScript. Requires HTML5 Audio API for sound effects.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    description:
      "A Mario-style typing tutor for Khmer and English: consonants, coeng sub-consonants, vowel signs and English speed drills, with a live virtual keyboard and finger guide.",
    inLanguage: ["km", "en"],
    screenshot: `${baseUrl}/og-image.png`,
    softwareVersion: "1.0.0",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "328",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "Khmer NiDA Unicode Keyboard Layout",
      "Subscript Coeng (ជើងអក្សរ) Typing Practice",
      "Live Virtual Keyboard and Color-Coded Hand Guide",
      "100% Offline Progressive Web App (PWA) Support",
      "Bilingual Khmer and English Missions",
      "Retro 8-bit Audio and Visual Effects",
      "No Ads, No Registration, 100% Free",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I type Khmer sub-consonants (ជើងអក្សរ / Coeng)?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "To type a Khmer sub-consonant (ជើងអក្សរ), first type the base consonant, then press the 'J' key (which produces the invisible Khmer COENG sign U+17D2 ្ in the standard NiDA layout), followed by the subscript consonant. For example, to type ក្ក: press K, then J, then K.",
        },
      },
      {
        "@type": "Question",
        name: "Which keyboard layout does Typing Quest use for Khmer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Typing Quest teaches the official Khmer NiDA Unicode keyboard layout shipped standard with macOS, Windows, iOS, and Android. It also supports the legacy SBBIC layout for advanced learners.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use Typing Quest offline without an internet connection?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Typing Quest is a Progressive Web App (PWA). Once loaded or installed on your home screen or desktop, all 10 missions, audio synthesis, and the virtual keyboard work 100% offline.",
        },
      },
      {
        "@type": "Question",
        name: "How do I switch my computer keyboard layout to Khmer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "On macOS: Open System Settings → Keyboard → Input Sources → click '+' and add 'Khmer'. On Windows: Open Settings → Time & Language → Language → Add 'Khmer' (NiDA keyboard). You can switch anytime with Win+Space or Ctrl+Shift.",
        },
      },
      {
        "@type": "Question",
        name: "Is Typing Quest free for students and schools in Cambodia?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Typing Quest is 100% free with no advertisements, no tracking, and no account registration, designed to empower digital literacy in Cambodia.",
        },
      },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Learn Khmer Touch Typing Step by Step",
    description: "Learn how to type Khmer Unicode with speed and accuracy using touch typing techniques.",
    step: [
      {
        "@type": "HowToStep",
        name: "Step 1: Position your fingers on the Home Row",
        text: "Place your left hand on ា ស ដ ថ (a s d f) and your right hand on ហ ក ល ើ (j k l ;). Rest your index fingers on the tactile bumps of F and J.",
      },
      {
        "@type": "HowToStep",
        name: "Step 2: Master the 33 Base Consonants",
        text: "Type basic consonants without looking down at the keyboard, allowing muscle memory to guide each finger.",
      },
      {
        "@type": "HowToStep",
        name: "Step 3: Master Subscript Coeng (ជើងអក្សរ)",
        text: "Use the unshifted J key to trigger subscript mode, followed by the consonant you want beneath the base consonant.",
      },
      {
        "@type": "HowToStep",
        name: "Step 4: Practice Vowels and Independent Vowels",
        text: "Combine vowels with consonants and practice independent vowels (ឥ ឦ ឧ ឨ ឩ ឪ ឫ ឬ ឭ ឮ ឯ ឰ ឱ ឲ ឳ).",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
    </>
  );
}
