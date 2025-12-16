import {
  GlobeSimple,
  Gear,
  House,
  Browser,
  Bag,
  Copy,
  ShoppingCart,
} from 'phosphor-react'

export default (S) =>
  S.list()
    .title('Content')
    .items([
      S.divider(),
      S.listItem()
        .title('Shop')
        .id('shop')
        .child(
          S.list()
            .title('Shop')
            .items([
              S.listItem()
                .title('Products')
                .icon(Bag)
                .child(
                  S.documentTypeList('product')
                    .title('Products')
                    .child((documentId) =>
                      S.document().documentId(documentId).schemaType('product'),
                    ),
                ),
              S.listItem()
                .title('Product Variants')
                .icon(Copy)
                .child(
                  S.list()
                    .title('Product Variants')
                    .items([
                      S.listItem()
                        .title('By Product')
                        .icon(Bag)
                        .child(
                          S.documentTypeList('product')
                            .title('By Product')
                            .menuItems(
                              S.documentTypeList('product').getMenuItems(),
                            )
                            .filter('_type == $type')
                            .params({ type: 'product' })
                            .child((productID) =>
                              S.documentList()
                                .title('Variants')
                                .menuItems(
                                  S.documentTypeList(
                                    'productVariant',
                                  ).getMenuItems(),
                                )
                                .filter('_type == $type && productID == $id')
                                .params({
                                  type: 'productVariant',
                                  id: Number(productID.replace('product-', '')),
                                })
                                .child((documentId) =>
                                  S.document()
                                    .documentId(documentId)
                                    .schemaType('productVariant'),
                                ),
                            ),
                        ),
                    ]),
                ),
              S.divider(),
              S.listItem()
                .title('Shop Home')
                .icon(House)
                .child(
                  S.editor()
                    .title('Shop Home')
                    .schemaType('shopHome')
                    .documentId('shopHome'),
                ),
              S.listItem()
                .title('Collections')
                .schemaType('collection')
                .child(
                  S.documentTypeList('collection')
                    .title('Collections')
                    //                         .filter(
                    //                           `_type == "collection" && !(_id in [
                    //   *[_type == "generalSettings"][0].shop._ref,
                    // ]) && !(_id in path("drafts.**"))`
                    //                         )
                    .child(
                      (documentId) =>
                        S.document()
                          .documentId(documentId)
                          .schemaType('collection'),
                      // .views(standardViews)
                    )
                    .canHandleIntent(
                      (intent, { type }) =>
                        ['create', 'edit'].includes(intent) &&
                        type === 'collection',
                    ),
                ),
            ]),
        )
        .icon(ShoppingCart),
      S.listItem()
        .title('Content')
        .icon(Browser)
        .child(
          S.list()
            .title('Home')
            .items([
              S.listItem()
                .title('Home')
                .icon(House)
                .child(
                  S.editor()
                    .title('Home')
                    .schemaType('home')
                    .documentId('home'),
                ),
              S.divider(),
              S.listItem()
                .title('Tutorials')
                .icon(House)
                .child(
                  S.editor()
                    .title('Tutorials')
                    .schemaType('tutorialsPage')
                    .documentId('tutorialsPage'),
                ),
              S.divider(),
              S.listItem()
                .title('Pages')
                .icon(Bag)
                .child(
                  S.documentTypeList('page')
                    .title('Page')
                    .child((documentId) =>
                      S.document().documentId(documentId).schemaType('page'),
                    ),
                ),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Settings')
        .child(
          S.list()
            .title('Settings')
            .items([
              S.listItem()
                .title('General')
                .child(
                  S.editor()
                    .id('generalSettings')
                    .schemaType('generalSettings')
                    .documentId('generalSettings'),
                )
                .icon(Gear),
              S.divider(),
              S.listItem()
                .title('Header')
                .child(
                  S.editor()
                    .id('headerSettings')
                    .schemaType('headerSettings')
                    .documentId('headerSettings'),
                )
                .icon(Gear),
              S.divider(),
              S.listItem()
                .title('Footer')
                .child(
                  S.editor()
                    .id('footerSettings')
                    .schemaType('footerSettings')
                    .documentId('footerSettings'),
                )
                .icon(Gear),
              S.divider(),
              S.listItem()
                .title('Shop')
                .child(
                  S.editor()
                    .id('shopSettings')
                    .schemaType('shopSettings')
                    .documentId('shopSettings')
                )
                .icon(Gear),
              S.divider(),
              S.listItem()
                .title('Default SEO / Share')
                .child(
                  S.editor()
                    .id('seoSettings')
                    .schemaType('seoSettings')
                    .documentId('seoSettings'),
                )
                .icon(GlobeSimple),
            ]),
        )
        .icon(Gear),
    ])
