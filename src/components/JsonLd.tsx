/**
 * JSON-LD 구조화 데이터 컴포넌트
 * Google 리치 스니펫을 위한 Schema.org 마크업
 */

interface WebSiteSchemaProps {
  name: string;
  url: string;
  description: string;
}

interface BusStationSchemaProps {
  name: string;
  address?: string;
  telephone?: string;
  url: string;
}

interface BusTripSchemaProps {
  departureStation: string;
  arrivalStation: string;
  departureTime?: string;
  arrivalTime?: string;
  price?: number;
  url: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

// WebSite 스키마 (메인 페이지용)
export function WebSiteJsonLd({ name, url, description }: WebSiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/terminal?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// BusStation 스키마 (터미널 페이지용)
export function BusStationJsonLd({
  name,
  address,
  telephone,
  url,
}: BusStationSchemaProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BusStation',
    name,
    url,
  };

  if (address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressCountry: 'KR',
    };
  }

  if (telephone) {
    schema.telephone = telephone;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// BusTrip 스키마 (노선 페이지용)
export function BusTripJsonLd({
  departureStation,
  arrivalStation,
  departureTime,
  arrivalTime,
  price,
  url,
}: BusTripSchemaProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BusTrip',
    name: `${departureStation} → ${arrivalStation} 고속버스`,
    departureBusStop: {
      '@type': 'BusStation',
      name: departureStation,
    },
    arrivalBusStop: {
      '@type': 'BusStation',
      name: arrivalStation,
    },
    url,
  };

  if (departureTime) {
    schema.departureTime = departureTime;
  }

  if (arrivalTime) {
    schema.arrivalTime = arrivalTime;
  }

  if (price) {
    schema.offers = {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb 스키마
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ 스키마
export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Organization 스키마 (사이트 전체용)
export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '버스 시간표 - mustarddata',
    url: 'https://bus.mustarddata.com',
    logo: 'https://bus.mustarddata.com/icon.png',
    sameAs: ['https://mustarddata.com'],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
