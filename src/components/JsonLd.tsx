/**
 * JSON-LD 구조화 데이터 컴포넌트
 * Google 리치 스니펫을 위한 Schema.org 마크업
 * 네이버/구글 검색 상위노출을 위한 최적화
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
  openingHours?: string;
  geo?: {
    latitude: number;
    longitude: number;
  };
}

interface BusTripSchemaProps {
  departureStation: string;
  arrivalStation: string;
  departureTime?: string;
  arrivalTime?: string;
  price?: number;
  url: string;
  provider?: string;
  busName?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ItemListItem {
  name: string;
  url: string;
  description?: string;
  position?: number;
}

interface HowToStep {
  name: string;
  text: string;
  url?: string;
}

interface TableSchemaProps {
  name: string;
  description: string;
  columns: string[];
  rows: string[][];
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
    sameAs: ['https://mustarddata.com', 'https://calc.mustarddata.com', 'https://apt.mustarddata.com'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Korean',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ItemList 스키마 (터미널/노선 목록용)
export function ItemListJsonLd({ items, name }: { items: ItemListItem[]; name: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: item.position || index + 1,
      name: item.name,
      url: item.url,
      ...(item.description && { description: item.description }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// HowTo 스키마 (버스 이용 방법 안내용)
export function HowToJsonLd({
  name,
  description,
  steps,
  totalTime,
}: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    ...(totalTime && { totalTime }),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.url && { url: step.url }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Table 스키마 (시간표 테이블용)
export function TableJsonLd({ name, description, columns, rows }: TableSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Table',
    name,
    description,
    about: {
      '@type': 'Thing',
      name: '버스 시간표',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Service 스키마 (버스 서비스 정보용)
export function ServiceJsonLd({
  name,
  description,
  provider,
  areaServed,
}: {
  name: string;
  description: string;
  provider: string;
  areaServed: string[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider,
    },
    areaServed: areaServed.map(area => ({
      '@type': 'Place',
      name: area,
    })),
    serviceType: '대중교통 정보 서비스',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// LocalBusiness 스키마 (터미널 상세 정보용)
export function LocalBusinessJsonLd({
  name,
  address,
  telephone,
  url,
  openingHours,
  geo,
}: BusStationSchemaProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': url,
    name,
    url,
    priceRange: '₩',
  };

  if (address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressCountry: 'KR',
      addressLocality: address.split(' ')[0],
    };
  }

  if (telephone) {
    schema.telephone = telephone;
  }

  if (openingHours) {
    schema.openingHours = openingHours;
  }

  if (geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
