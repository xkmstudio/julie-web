import {
  GlobeSimple,
  Gear,
  House,
  Browser,
  Bag,
  Copy,
  ShoppingCart,
  Book,
  SmileyBlank,
  Tag,
  Notebook,
  Article,
  Browsers,
} from 'phosphor-react'

export default (S) =>
  S.list()
    .title('Content')
    .items([
      S.divider(),
      S.listItem()
        .title('Blog')
        .id('blog')
        .child(
          S.list()
            .title('Blog')
            .items([
              S.listItem()
                .title('Blog')
                .icon(Notebook)
                .child(
                  S.editor()
                    .title('Blog')
                    .schemaType('blog')
                    .documentId('blog'),
                ),
              S.divider(),
              S.listItem()
                .title('Articles')
                .icon(Article)
                .child(
                  S.documentTypeList('article')
                    .title('Articles')
                    .child((documentId) =>
                      S.document().documentId(documentId).schemaType('article'),
                    ),
                ),
              S.divider(),
              S.listItem()
                .title('Tags')
                .icon(Tag)
                .child(
                  S.documentTypeList('tag')
                    .title('Tags')
                    .child((documentId) =>
                      S.document().documentId(documentId).schemaType('tag'),
                    ),
                ),
              S.divider(),
              S.listItem()
                .title('Profiles')
                .icon(SmileyBlank)
                .child(
                  S.documentTypeList('profile')
                    .title('Profiles')
                    .child((documentId) =>
                      S.document().documentId(documentId).schemaType('profile'),
                    ),
                ),
            ]),
        ),
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
                .title('Pages')
                .icon(Browsers)
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
                    .documentId('shopSettings'),
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
              S.divider(),
              S.listItem()
                .title('EMA')
                .child(
                  S.editor()
                    .id('emaSettings')
                    .schemaType('emaSettings')
                    .documentId('emaSettings'),
                )
                .icon(Gear),
            ]),
        )
        .icon(Gear),
    ])
