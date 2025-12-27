import { useEffect, Suspense } from 'react'
import { Link } from '@remix-run/react'

export const MapModule = ({
  enableMap
}) => {
  useEffect(() => {
    setTimeout(() => {
      const script = document.createElement('script');
      script.id = 'stockists';
      script.src = '//stockist.co/embed/v1/widget.min.js';
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }, 1000)

    return () => {
      window.Stockist.loaded = false
      document.getElementById('stockists')?.remove();
      document.querySelector('.stockist-autocomplete')?.remove();
    }
  }, []);
  return (
    <div className='col-span-6 800:col-span-12 border-[3px] border-solid rounded-[10px]'>
    <style>{`  
      .stockist-themed {
        height: calc(100vh - 40px);
      }
      .stockist-horizontal { 
        height: calc(100vh - 440px);
      }
      .stockist-result-list {
        height: calc(100vh - 40px) !important;
        overflow: scroll;
      }
      #stockist-widget.stockist-responsive .stockist-map {
        margin-bottom: 0 !important;
      }
      .stockist-feature-color {
        color: currentColor !important;
      }
      #stockist-widget .stockist-result-list ul > li {
        border-top: 2px dotted currentColor !important;
      }
      #stockist-widget .stockist-result-list ul {
        margin-right: 0 !important;
      }
      .stockist-result-distance { display: none; }
      #stockist-widget .stockist-list-result > div {
        padding-left: 20px !important;
      }
      .stockist-search-form {
        position: relative;
      }
      #stockist-widget .stockist-query-entry .stockist-search-field {
        font-family: 'Landa'
      }
      #stockist-widget .stockist-query-entry .stockist-search-field {
        padding: 10px !important;
      }
      #stockist-widget .stockist-search-form {
        margin-bottom: 0px !important;
      }
      #stockist-widget .stockist-query-entry .stockist-search-button button {
        color: currentColor !important;
      }
      #stockist-widget .stockist-result-list ul > li:first-child {
        border-top: none !important;
      }
      #stockist-widget .stockist-query-entry .stockist-search-button {
        width: 80px !important;
        display: flex;
        justify-content: center;
        align-content: center;
        align-items: center;
        background-color: transparent;
      }
      #stockist-widget .stockist-icon {
        color: currentColor !important;
        font-size: 20px;
      }
      #stockist-widget .stockist-query-entry .stockist-search-button .stockist-feature-bg-color {
        background-color: transparent;
      }
      #stockist-widget .stockist-query-entry {
        width: 100% !important;
        display: block !important;
        padding: 14px 0 !important;
      }
      .stockist-search-button {
        position: absolute;
        top: 0;
        height: 100%;
        right: 0;
      }
      .stockist-search-form input {
          background: transparent !important;
          border: 0 !important;
          font-size: 14px;
          color: currentColor !important;
          width: 100%;
          height: 70px !important;
          border-bottom: 3px solid currentColor !important;
        }
      @media screen and (min-width: 800px) {
        .stockist-horizontal { 
        height: calc(100vh - 140px);
      }
      .stockist-themed {
        height: calc(100vh - 140px);
      }
        .stockist-search-form {
          position: absolute;
          top: 0;
          width: 100%;
        }
        .stockist-search-form input {
          font-size: 36px;
        }

        .stockist-side-panel {
          position: static !important;
          margin-top: 0px !important;
          width: 40% !important;
          border-right: 3px solid currentColor !important;
        }
        .stockist-map {
          top: 0px !important;
          left: auto !important;
          right: 0 !important;
          width: 60% !important;
        }
      }
      @media screen and (min-width: 1200px) {
        .stockist-side-panel {
          width: 30% !important;
        }
        .stockist-map {
          width: 70% !important;
        }
      }
    `}</style>
      <>
        <div data-stockist-widget-tag="u13647" />
      </>
    </div>
  )
}