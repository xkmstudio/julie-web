import {useEffect} from 'react';

const appendScript = ({attributes, innerHtml}) => {
  const script = document.createElement('script');
  const attributeKeys = Object.keys(attributes);
  attributeKeys.forEach((key) => {
    script.setAttribute(key, attributes[key]);
  });

  if (innerHtml) script.innerHTML = innerHtml;

  document.head.appendChild(script);
};

const LuckyLocalScripts = ({currentProductId, firstVariantId}) => {
  useEffect(() => {
    appendScript({
      attributes: {
        id: 'lucky-initial-script',
      },
      innerHtml: `
      window.CURRENT_PRODUCT_ID = '${currentProductId}';
      window.LUCKY_FIRST_VARIANT_ID = '${firstVariantId}';
      window.LK_APP_BASE_URL = '/lucky-local/shopify';
      window.LK_BRAND_NAME = 'juliecare';`,
    });

    appendScript({
      attributes: {
        id: 'lucky-cdn',
        type: 'module',
        crossOrigin: 'anonymous',
        src: 'https://cdn.luckylabs.io/prd/lucky-local/org/built-sources/index.js',
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export const LuckyIdScripts = () => {
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_LK_APP_BASE_URL || '/lucky-local/shopify';
    const brandName = process.env.NEXT_PUBLIC_LK_BRAND_NAME || 'juliecare';
    
    appendScript({
      attributes: {
        id: 'lucky-initial-script',
      },
      innerHtml: `
      window.LK_APP_BASE_URL = '${baseUrl}';
      window.LK_BRAND_NAME = '${brandName}';
      `,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default LuckyLocalScripts;
