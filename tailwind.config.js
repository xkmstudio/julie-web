module.exports = {
  corePlugins: {
    preflight: false,
  },
  mode: 'jit',
  purge: {
    content: [
      './components/**/*.js',
      './lib/**/*.js',
      './pages/**/*.js',
      './tailwind.safelist.txt',
    ],
    options: {
      // Note: safelist is not utlized in JIT mode, use tailwind.safelist.txt instead
      safelist: [
        /^grid-cols-/,
        /^xs:grid-cols-/,
        /^sm:grid-cols-/,
        /^md:grid-cols-/,
        /^lg:grid-cols-/,
        /^xl:grid-cols-/,

        /^col-span-/,
        /^xs:col-span-/,
        /^sm:col-span-/,
        /^md:col-span-/,
        /^lg:col-span-/,
        /^xl:col-span-/,

        /^col-start-/,
        /^xs:col-start-/,
        /^sm:col-start-/,
        /^md:col-start-/,
        /^lg:col-start-/,
        /^xl:col-start-/,

        /^justify-self-/,
        /^xs:justify-self-/,
        /^sm:justify-self-/,
        /^md:justify-self-/,
        /^lg:justify-self-/,
        /^xl:justify-self-/,

        /^self-/,
        /^xs:self-/,
        /^sm:self-/,
        /^md:self-/,
        /^lg:self-/,
        /^xl:self-/,

        /^max-w-/,
        /^text-/,
      ],
    },
  },
  darkMode: false,
  theme: {
    fontFamily: {
      sans: ['Ladna Medium', 'sans-serif'],
      inter: ['var(--font-inter)', 'sans-serif'],
      mono: ['var(--font-jetbrains-mono)', 'monospace'],
      lb: 'Ladna Bold',
      lxb: 'Ladna ExtraBold',
      lm: 'Ladna Medium',
      plaid: 'Plaid',
      // Legacy font classes mapped to Inter weights
      vr: ['var(--font-inter)', 'sans-serif'],
      vm: ['var(--font-inter)', 'sans-serif'],
      vs: ['var(--font-inter)', 'sans-serif'],
      vb: ['var(--font-inter)', 'sans-serif'],
    },
    screens: {
      xs: '480px',
      sm: '768px',
      md: '850px',
      lg: '1200px',
      xl: '1500px',
      '2xl': '1900px',
    },
    colors: {
      inherit: 'inherit',
      transparent: 'transparent',
      current: 'currentColor',
      pageText: '#000000',
      pageBG: '#ffffff',
      black: '#000000',
      white: '#FFFFFF',
      cement: '#F9F9F9',
      stone: '#E8E8E8',
      ash: '#CFCFCF',
      pink: '#ED0E6A',
      magenta: '#E31479',
      primary: '#fff',
      secondary: '#000',
      slate: '#777777'
    },
    backdropBlur: {
      frame: '30px',
    },
    boxShadow: {
      light: '0 3px 3px rgba(0, 0, 0, 0.15), inset 0 0 0 0 transparent',
      primary: '0 4px 4px rgba(0, 0, 0, 0.2), inset 0 0 0 0 transparent',
      primaryInner: '0 0 0 0 transparent, inset 0 4px 4px 0 rgb(0 0 0 / 20%);',
    },
    fontSize: new Array(201)
      .fill()
      .map((_, i) => i)
      .reduce((acc, val) => {
        acc[val] = `${val / 10}rem`
        return acc
      }, {}),
    lineHeight: new Array(161)
      .fill()
      .map((_, i) => i)
      .reduce((acc, val) => {
        acc[val] = val / 100
        return acc
      }, {}),
    spacing: new Array(351)
      .fill()
      .map((_, i) => i)
      .reduce((acc, val) => {
        acc[val] = `${val / 10}rem`
        return acc
      }, {}),
    opacity: new Array(21)
      .fill()
      .map((_, i) => i * 5)
      .reduce((acc, val) => {
        acc[val] = `${val / 100}`
        return acc
      }, {}),
    zIndex: new Array(11)
      .fill()
      .map((_, i) => i)
      .reduce((acc, val) => {
        acc[val] = val
        return acc
      }, {}),
    height: {
      ...new Array(200)
        .fill()
        .map((_, i) => i * 5)
        .reduce((acc, val) => {
          acc[val] = `${val / 10}rem`
          return acc
        }, {}),
      full: '100%',
      screen: 'calc(var(--vh, 1vh) * 100)',
      index: 'calc((var(--vh, 1vh) * 100) - var(--headerHeight))',
    },
    extend: {
      fontFamily: {
        inherit: 'inherit',
      },
      maxWidth: {
        xs: '20rem',
        sm: '30rem',
        md: '40rem',
        lg: '50rem',
        xl: '60rem',
        '2xl': '70rem',
        '3xl': '80rem',
        '4xl': '90rem',
        '5xl': '100rem',
        '6xl': '115rem',
        '7xl': '130rem',
        prose: '100ch',
      },
      fontFamily: {
        inherit: 'inherit',
      },
      zIndex: {
        '-1': '-10',
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        50: 50,
        60: 60,
        70: 70,
        80: 80,
        90: 90,
      },
    },
  },
  plugins: [],
}
