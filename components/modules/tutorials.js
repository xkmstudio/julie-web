import React from 'react'
import MediaTutorial from './mediaTutorial'
import Link from '@components/link'
import VideoDuration from './video-duration'

const Tutorials = ({ data = {} }) => {
  const { title, products } = data

  if (!products || products.length === 0) return null

  return (
    <section className="mx-auto relative px-10 md:px-15">
      {title && (
        <h2 className="mb-20">{title}</h2>
      )}
      <div className="space-y-20">
        {products.map((product, index) => {
          if (!product.tutorial) return null
          
          return (
            <div key={product._id || index} className="tutorial-item">
              <div className="mb-10">
                <h3 className="text-lg font-semibold">{product.title}</h3>
                {product.productType && (
                  <span className="text-sm text-gray-600">{product.productType}</span>
                )}
                {product.tutorial?.video && (
                  <VideoDuration
                    videoUrl={product.tutorial.video}
                    className="text-sm text-gray-600 ml-10"
                  />
                )}
              </div>
              <MediaTutorial
                data={{ videoTutorial: product.tutorial }}
              />
              {product.slug && (
                <div className="mt-10">
                  <Link
                    link={{
                      _type: 'navLink',
                      url: `/products/${product.slug}`,
                      title: 'View Product'
                    }}
                    hasArrow={true}
                  >
                    View Product
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Tutorials

