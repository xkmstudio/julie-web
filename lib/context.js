import React, { createContext, useContext, useEffect, useState } from 'react'
import { Base64 } from 'base64-string'

// get our API clients (shopify + sanity)
import { getSanityClient } from '@lib/sanity'
// import shopify from '@lib/shopify'
import { shopifyFetch } from '@lib/shopify'

// get our global image GROQ
import { queries } from '@data'

// UTM tracking utilities
import { 
  initializeUTMTracking, 
  getAllUTMParams, 
  utmParamsToCartAttributes,
  addUTMToCheckoutURL 
} from '@lib/utm-tracking'

// Set our initial context states
const initialContext = {
  isPageTransition: false,
  isAnnotate: false,
  intercomOpen: false,
  emailOpen: false,
  emaChatOpen: false,
  emaChatMessages: [],
  emaUserId: null,
  emaSearchResults: null,
  emaInitialSearchQuery: '',
  productCounts: [],
  ema: null,
  shopifyClient: shopifyFetch,
  isLoading: true,
  isAdding: false,
  isUpdating: false,
  isCartOpen: false,
  isModalOpen: false,
  isBookmarking: false,
  bookmarks: [],
  cart: {
    id: null,
    lines: [],
    checkoutUrl: null,
    cost: { subtotalAmount: { amount: 0 } },
  },
}

// Set context
const SiteContext = createContext({
  context: initialContext,
  setContext: () => null,
})

// Cart API localStorage key
const shopifyCartID = 'shopify_cart_id'

// Create a new cart
const createNewCart = async () => {
  const query = `
    mutation cartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                      handle
                    }
                    priceV2 {
                      amount
                    }
                  }
                }
              }
            }
          }
          cost {
            subtotalAmount { amount }
          }
        }
      }
    }
  `
  const response = await shopifyFetch({ query, variables: { input: {} } })
  return response?.cartCreate?.cart
}

// Fetch an existing cart
const fetchCart = async (id) => {
  const query = `
    query cart($id: ID!) {
      cart(id: $id) {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    handle
                  }
                  priceV2 {
                    amount
                  }
                }
              }
            }
          }
        }
        cost {
          subtotalAmount { amount }
        }
      }
    }
  `
  const response = await shopifyFetch({ query, variables: { id } })
  return response?.cart
}

// Update cart attributes with UTM parameters
const updateCartAttributes = async (cartId, attributes) => {
  if (!cartId || Object.keys(attributes).length === 0) return null
  
  const query = `
    mutation cartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
      cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
        cart {
          id
          checkoutUrl
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                      handle
                    }
                    priceV2 {
                      amount
                    }
                  }
                }
              }
            }
          }
          cost {
            subtotalAmount { amount }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `
  
  const attributeInputs = Object.entries(attributes).map(([key, value]) => ({
    key,
    value: String(value)
  }))
  
  const response = await shopifyFetch({ 
    query, 
    variables: { 
      cartId, 
      attributes: attributeInputs 
    } 
  })
  
  return response?.cartAttributesUpdate?.cart
}

// get associated variant from Sanity
const fetchVariant = async (id) => {
  try {
    const variant = await getSanityClient().fetch(
      `*[_type == "productVariant" && variantID == $id][0]{
        "product": *[_type == "product" && productID == ^.productID][0]{
          title,
          "slug": slug.current,
          productThumbnail{${queries.mediaContent}},
          noteShipping
        },
        "id": variantID,
        title,
        "cartImage": cartImage{${queries.assetMeta}},
        price,
        options[]{
          name,
          position,
          value
        }
      }`,
      { id: Number(id) }
    )

    return variant
  } catch (error) {
    console.error('Error fetching variant:', error)
    // Return a minimal variant object to prevent cart errors
    return {
      id: id,
      title: 'Unknown Product',
      price: 0,
      cartImage: null,
      options: [],
      product: {
        title: 'Unknown Product',
        slug: '',
        productThumbnail: null,
        noteShipping: null
      }
    }
  }
}

// set Shopify variables
const shopifyCheckoutID = 'shopify_checkout_id'
const shopifyVariantGID = 'gid://shopify/ProductVariant/'

// Set cart state
const setCartState = async (cart, setContext, openCart) => {
  if (!cart) return null
  if (typeof window !== `undefined`) {
    localStorage.setItem(shopifyCartID, cart.id)
  }
  // get real line data from Sanity
  const linesArray = cart.lines?.edges?.map((edge) => edge.node) || []
  
  try {
    const lines = await Promise.all(
      linesArray.map(async (item) => {
        try {
          const variantID = item.merchandise.id.split('ProductVariant/')[1]
          const variant = await fetchVariant(variantID)
          return { ...variant, quantity: item.quantity, lineID: item.id }
        } catch (error) {
          console.error('Error processing cart item:', error)
          // Return a fallback item
          return {
            id: item.merchandise.id.split('ProductVariant/')[1],
            title: item.merchandise.title || 'Unknown Product',
            price: parseFloat(item.merchandise.priceV2?.amount || 0) * 100,
            quantity: item.quantity,
            lineID: item.id,
            options: [],
            product: {
              title: item.merchandise.product?.title || 'Unknown Product',
              slug: item.merchandise.product?.handle || '',
              thumbnails: [],
              noteShipping: null
            }
          }
        }
      })
    )
    
    // Enhance checkout URL with UTM parameters
    const utmParams = getAllUTMParams()
    const enhancedCheckoutUrl = addUTMToCheckoutURL(cart.checkoutUrl, utmParams)
    
    setContext((prevState) => ({
      ...prevState,
      isAdding: false,
      isLoading: false,
      isUpdating: false,
      isCartOpen: openCart ? true : prevState.isCartOpen,
      cart: {
        id: cart.id,
        lines: lines,
        subTotal: cart.cost.subtotalAmount,
        checkoutUrl: enhancedCheckoutUrl,
      },
    }))
  } catch (error) {
    console.error('Error setting cart state:', error)
    // Still update the cart state even if Sanity fetch fails
    setContext((prevState) => ({
      ...prevState,
      isAdding: false,
      isLoading: false,
      isUpdating: false,
      isCartOpen: openCart ? true : prevState.isCartOpen,
      cart: {
        id: cart.id,
        lines: cart.lines?.edges?.map((edge) => ({
          id: edge.node.merchandise.id.split('ProductVariant/')[1],
          title: edge.node.merchandise.title || 'Unknown Product',
          price: parseFloat(edge.node.merchandise.priceV2?.amount || 0) * 100,
          quantity: edge.node.quantity,
          lineID: edge.node.id,
          options: [],
          product: {
            title: edge.node.merchandise.product?.title || 'Unknown Product',
            slug: edge.node.merchandise.product?.handle || '',
            thumbnails: [],
            noteShipping: null
          }
        })) || [],
        subTotal: cart.cost.subtotalAmount,
        checkoutUrl: cart.checkoutUrl,
      },
    }))
  }
}

/*  ------------------------------ */
/*  Our Context Wrapper
/*  ------------------------------ */

const SiteContextProvider = ({ data, children }) => {
  const { productCounts, ema } = data || {}
  const [context, setContext] = useState({
    ...initialContext,
    ...{ productCounts, ema },
  })
  const [initContext, setInitContext] = useState(false)
  useEffect(() => {
    if (initContext === false) {
      // Initialize UTM tracking
      initializeUTMTracking()
      
      const initializeCart = async () => {
        let existingCartID =
          typeof window !== 'undefined'
            ? localStorage.getItem(shopifyCartID)
            : null
        if (existingCartID) {
          try {
            const existingCart = await fetchCart(existingCartID)
            if (existingCart) {
              setCartState(existingCart, setContext)
              return
            }
          } catch (error) {
            console.error('Error fetching existing cart:', error)
          }
        }
        const newCart = await createNewCart()
        if (newCart?.id) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(shopifyCartID, newCart.id)
          }
          setCartState(newCart, setContext)
        } else {
          console.error('Failed to create new cart')
        }
      }
      initializeCart()
      setInitContext(true)
    }
  }, [initContext, context, setContext, context.shopifyClient?.cart])
  return (
    <SiteContext.Provider value={{ context, setContext }}>
      {children}
    </SiteContext.Provider>
  )
}

// Access our global store states
function useSiteContext() {
  const { context } = useContext(SiteContext)
  return context
}

// Toggle page transition state
function useTogglePageTransition() {
  const {
    context: { isPageTransition },
    setContext,
  } = useContext(SiteContext)

  async function togglePageTransition(state) {
    setContext((prevState) => {
      return { ...prevState, isPageTransition: state }
    })
  }
  return togglePageTransition
}

// Toggle waitlist modal
function useToggleModal() {
  const {
    context: { isModalOpen },
    setContext,
  } = useContext(SiteContext)

  async function toggleModal(state) {
    setContext((prevState) => {
      return { ...prevState, isModalOpen: state }
    })
  }
  return toggleModal
}

// Toggle page transition state
function useToggleBookmarking() {
  const {
    context: { isBookmarking },
    setContext,
  } = useContext(SiteContext)

  async function toggleBookmarking(state) {
    setContext((prevState) => {
      return { ...prevState, isBookmarking: state }
    })
  }
  return toggleBookmarking
}

// Toggle page transition state
function useBookmarks() {
  const {
    context: { bookmarks },
    setContext,
  } = useContext(SiteContext)

  async function setBookmarks(state) {
    setContext((prevState) => {
      return { ...prevState, bookmarks: state }
    })
  }
  return setBookmarks
}

// Toggle page transition state
function useToggleAnnotate() {
  const {
    context: { isAnnotate },
    setContext,
  } = useContext(SiteContext)

  async function toggleAnnotate(state) {
    setContext((prevState) => {
      return { ...prevState, isAnnotate: state }
    })
  }
  return toggleAnnotate
}

// Toggle intercom state
function useToggleIntercom() {
  const {
    context: { intercomOpen },
    setContext,
  } = useContext(SiteContext)

  async function toggleIntercom(state) {
    setContext((prevState) => {
      return { ...prevState, intercomOpen: state }
    })
  }
  return toggleIntercom
}

// Toggle email state
function useToggleEmail() {
  const {
    context: { emailOpen },
    setContext,
  } = useContext(SiteContext)

  async function toggleEmail(state) {
    setContext((prevState) => {
      return { ...prevState, emailOpen: state }
    })
  }
  return toggleEmail
}

// Toggle Ema chat state
function useToggleEmaChat() {
  const {
    context: { emaChatOpen },
    setContext,
  } = useContext(SiteContext)

  async function toggleEmaChat(state) {
    // console.log('toggleEmaChat called with state:', state)
    setContext((prevState) => {
      // console.log('Previous state emaChatOpen:', prevState.emaChatOpen)
      const newState = { ...prevState, emaChatOpen: state }
      // console.log('New state emaChatOpen:', newState.emaChatOpen)
      return newState
    })
  }
  return toggleEmaChat
}

// Set Ema chat messages
function useSetEmaChatMessages() {
  const { setContext } = useContext(SiteContext)

  function setEmaChatMessages(messages) {
    setContext((prevState) => {
      // Support both function and direct value (like React's useState)
      const newMessages = typeof messages === 'function' 
        ? messages(prevState.emaChatMessages || [])
        : messages
      return { ...prevState, emaChatMessages: newMessages }
    })
  }
  return setEmaChatMessages
}

// Set Ema user ID
function useSetEmaUserId() {
  const { setContext } = useContext(SiteContext)

  function setEmaUserId(userId) {
    setContext((prevState) => {
      return { ...prevState, emaUserId: userId }
    })
  }
  return setEmaUserId
}

// Set Ema search results
function useSetEmaSearchResults() {
  const { setContext } = useContext(SiteContext)

  function setEmaSearchResults(results) {
    setContext((prevState) => {
      return { ...prevState, emaSearchResults: results }
    })
  }
  return setEmaSearchResults
}

// Set Ema initial search query
function useSetEmaInitialSearchQuery() {
  const { setContext } = useContext(SiteContext)

  function setEmaInitialSearchQuery(query) {
    setContext((prevState) => {
      return { ...prevState, emaInitialSearchQuery: query }
    })
  }
  return setEmaInitialSearchQuery
}

// Get Ema chat context values
function useEmaChat() {
  const { context } = useContext(SiteContext)
  const {
    emaChatOpen,
    emaChatMessages,
    emaUserId,
    emaSearchResults,
    emaInitialSearchQuery,
  } = context
  const toggleEmaChat = useToggleEmaChat()
  const setEmaChatMessages = useSetEmaChatMessages()
  const setEmaUserId = useSetEmaUserId()
  const setEmaSearchResults = useSetEmaSearchResults()
  const setEmaInitialSearchQuery = useSetEmaInitialSearchQuery()

  return {
    emaChatOpen,
    emaChatMessages,
    emaUserId,
    emaSearchResults,
    emaInitialSearchQuery,
    toggleEmaChat,
    setEmaChatMessages,
    setEmaUserId,
    setEmaSearchResults,
    setEmaInitialSearchQuery,
  }
}

/*  ------------------------------ */
/*  Our Shopify context helpers
/*  ------------------------------ */

// Access our cart item count
function useCartCount() {
  const { context: { cart } } = useContext(SiteContext)
  let count = 0
  if (cart.lines) {
    count = cart.lines.reduce((total, item) => item.quantity + total, 0)
  }
  return count
}

// Access our cart totals
function useCartTotals() {
  const { context: { cart } } = useContext(SiteContext)
  return { subTotal: cart?.subTotal?.amount || 0 }
}

// Access our cart items
function useCartItems() {
  const { context: { cart } } = useContext(SiteContext)
  return cart?.lines || []
}

// Add an item to the checkout cart
function useAddItem() {
  const { context: { cart }, setContext } = useContext(SiteContext)
  async function addItem(variantID, quantity, options = {}) {
    if (!variantID || !quantity) return
    
    const { silent = false } = options
    
    // Only set isAdding if not silent (to avoid affecting button state)
    if (!silent) {
      setContext((prevState) => ({ ...prevState, isAdding: true, isUpdating: true }))
    } else {
      // Still set isUpdating for silent adds to prevent double-clicks
      setContext((prevState) => ({ ...prevState, isUpdating: true }))
    }
    
    try {
      const query = `
        mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
              id
              checkoutUrl
              lines(first: 100) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                        product {
                          title
                          handle
                        }
                        priceV2 {
                          amount
                        }
                      }
                    }
                  }
                }
              }
              cost { subtotalAmount { amount } }
            }
          }
        }
      `
      const variables = {
        cartId: cart.id,
        lines: [
          { merchandiseId: `gid://shopify/ProductVariant/${variantID}`, quantity },
        ],
      }
      const response = await shopifyFetch({ query, variables })
      if (response?.cartLinesAdd?.cart) {
        // Pass silent flag to setCartState - if silent, don't open cart
        await setCartState(response.cartLinesAdd.cart, setContext, !silent)
      } else {
        throw new Error('Failed to add item to cart')
      }
    } catch (error) {
      console.error('Error adding item to cart:', error)
      // Still reset loading state even on error
      if (!silent) {
        setContext((prevState) => ({ ...prevState, isAdding: false, isUpdating: false }))
      } else {
        setContext((prevState) => ({ ...prevState, isUpdating: false }))
      }
    }
  }
  return addItem
}

// Update item in cart
function useUpdateItem() {
  const { context: { cart }, setContext } = useContext(SiteContext)
  async function updateItem(lineID, quantity) {
    if (!lineID || quantity < 1) return
    const query = `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product {
                        title
                        handle
                      }
                      priceV2 {
                        amount
                      }
                    }
                  }
                }
              }
            }
            cost { subtotalAmount { amount } }
          }
        }
      }
    `
    const variables = {
      cartId: cart.id,
      lines: [{ id: lineID, quantity: quantity }],
    }
    const response = await shopifyFetch({ query, variables })
    if (response?.cartLinesUpdate?.cart) {
      setCartState(response.cartLinesUpdate.cart, setContext)
    }
  }
  return updateItem
}

// Remove item from cart
function useRemoveItem() {
  const { context: { cart }, setContext } = useContext(SiteContext)
  async function removeItem(lineID) {
    if (!lineID) return
    setContext((prevState) => ({ ...prevState, isUpdating: true }))
    const query = `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product {
                        title
                        handle
                      }
                      priceV2 {
                        amount
                      }
                    }
                  }
                }
              }
            }
            cost { subtotalAmount { amount } }
          }
        }
      }
    `
    const variables = {
      cartId: cart.id,
      lineIds: [lineID],
    }
    const response = await shopifyFetch({ query, variables })
    if (response?.cartLinesRemove?.cart) {
      setCartState(response.cartLinesRemove.cart, setContext)
    }
    setContext((prevState) => ({ ...prevState, isUpdating: false }))
  }
  return removeItem
}

// Build our Checkout URL
function useCheckout() {
  const { context: { cart } } = useContext(SiteContext)
  return cart.checkoutUrl
}

// Enhanced checkout with UTM parameters
function useEnhancedCheckout() {
  const { context: { cart }, setContext } = useContext(SiteContext)
  
  async function goToCheckout() {
    if (!cart.id) return
    
    try {
      // Get UTM parameters
      const utmParams = getAllUTMParams()
      const cartAttributes = utmParamsToCartAttributes(utmParams)
      
      // Update cart attributes with UTM parameters
      if (Object.keys(cartAttributes).length > 0) {
        const updatedCart = await updateCartAttributes(cart.id, cartAttributes)
        if (updatedCart) {
          setCartState(updatedCart, setContext)
        }
      }
      
      // Return the enhanced checkout URL
      return cart.checkoutUrl
    } catch (error) {
      console.warn('Failed to enhance checkout with UTM parameters:', error)
      return cart.checkoutUrl
    }
  }
  
  return goToCheckout
}

// Toggle cart state
function useToggleCart() {
  const {
    context: { isCartOpen },
    setContext,
  } = useContext(SiteContext)

  async function toggleCart() {
    setContext((prevState) => {
      return { ...prevState, isCartOpen: !isCartOpen }
    })
  }
  return toggleCart
}

// Reference a collection product count
function useProductCount() {
  const {
    context: { productCounts },
  } = useContext(SiteContext)

  function productCount(collection) {
    const collectionItem = productCounts.find((c) => c.slug === collection)
    return collectionItem.count
  }

  return productCount
}

export {
  SiteContextProvider,
  useSiteContext,
  useTogglePageTransition,
  useToggleModal,
  useToggleBookmarking,
  useBookmarks,
  useToggleAnnotate,
  useToggleIntercom,
  useToggleEmail,
  useToggleEmaChat,
  useSetEmaChatMessages,
  useSetEmaUserId,
  useSetEmaSearchResults,
  useSetEmaInitialSearchQuery,
  useEmaChat,
  useCartCount,
  useCartTotals,
  useCartItems,
  useAddItem,
  useUpdateItem,
  useRemoveItem,
  useCheckout,
  useEnhancedCheckout,
  useToggleCart,
  useProductCount,
}
