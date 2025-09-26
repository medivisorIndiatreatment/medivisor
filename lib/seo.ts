interface MetaTagsProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
}

export function updateMetaTags({ title, description, url, image, type = "website" }: MetaTagsProps) {
  // Update title
  document.title = title;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", description);
  } else {
    const meta = document.createElement("meta");
    meta.name = "description";
    meta.content = description;
    document.head.appendChild(meta);
  }
  
  // Update Open Graph tags
  updateOrCreateMetaTag("property", "og:title", title);
  updateOrCreateMetaTag("property", "og:description", description);
  updateOrCreateMetaTag("property", "og:type", type);
  
  if (url) {
    updateOrCreateMetaTag("property", "og:url", url);
  }
  
  if (image) {
    updateOrCreateMetaTag("property", "og:image", image);
  }
  
  // Update Twitter Card tags
  updateOrCreateMetaTag("name", "twitter:card", "summary_large_image");
  updateOrCreateMetaTag("name", "twitter:title", title);
  updateOrCreateMetaTag("name", "twitter:description", description);
  
  if (image) {
    updateOrCreateMetaTag("name", "twitter:image", image);
  }
}

function updateOrCreateMetaTag(attribute: string, attributeValue: string, content: string) {
  let metaTag = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
  
  if (metaTag) {
    metaTag.setAttribute("content", content);
  } else {
    metaTag = document.createElement("meta");
    metaTag.setAttribute(attribute, attributeValue);
    metaTag.setAttribute("content", content);
    document.head.appendChild(metaTag);
  }
}

export function generateStructuredData(type: "Hospital" | "Doctor" | "MedicalBusiness", data: any) {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  
  let structuredData;
  
  switch (type) {
    case "Hospital":
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Hospital",
        "name": data.name,
        "description": data.description,
        "address": data.address,
        "telephone": data.phone,
        "url": data.website,
        "image": data.image,
        "aggregateRating": data.rating ? {
          "@type": "AggregateRating",
          "ratingValue": data.rating,
          "bestRating": "5.0"
        } : undefined
      };
      break;
      
    case "Doctor":
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Physician",
        "name": data.name,
        "description": data.description,
        "medicalSpecialty": data.specializations,
        "telephone": data.phone,
        "image": data.profilePicture,
        "aggregateRating": data.rating ? {
          "@type": "AggregateRating",
          "ratingValue": data.rating,
          "bestRating": "5.0"
        } : undefined
      };
      break;
      
    case "MedicalBusiness":
      structuredData = {
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        "name": data.name,
        "description": data.description,
        "address": data.address,
        "telephone": data.phone,
        "url": data.website,
        "image": data.image
      };
      break;
  }
  
  script.textContent = JSON.stringify(structuredData);
  
  // Remove existing structured data for this type
  const existingScript = document.querySelector(`script[type="application/ld+json"][data-type="${type}"]`);
  if (existingScript) {
    document.head.removeChild(existingScript);
  }
  
  script.setAttribute("data-type", type);
  document.head.appendChild(script);
}
