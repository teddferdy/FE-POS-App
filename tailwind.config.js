/* eslint-disable no-undef */
/* eslint-disable no-dupe-keys */
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem", // Default padding for all devices
        sm: "1.5rem", // Small screens
        lg: "2rem", // Large screens
        xl: "2.5rem", // Extra-large screens
        "2xl": "3rem" // 2XL screens
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px"
      }
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        "label-md": ["Inter"],
        "body-md": ["Inter"],
        display: ["Inter"],
        "data-mono": ["Inter"],
        "body-lg": ["Inter"],
        "headline-md": ["Inter"],
        "headline-lg": ["Inter"],
        "title-lg": ["Inter"]
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        "surface-tint": "#005ac2",
        "on-tertiary-fixed-variant": "#653e00",
        "on-error": "#ffffff",
        "on-tertiary-fixed": "#2a1700",
        "surface-container": "#e5eeff",
        "on-primary-container": "#fefcff",
        "on-surface": "#0b1c30",
        "on-primary-fixed": "#001a42",
        "tertiary-fixed": "#ffddb8",
        "on-secondary-container": "#00714d",
        "primary-fixed": "#d8e2ff",
        "surface-container-low": "#eff4ff",
        "surface-container-lowest": "#ffffff",
        "surface-bright": "#f8f9ff",
        "on-primary-fixed-variant": "#004395",
        "surface-dim": "#cbdbf5",
        "on-tertiary-container": "#fffbff",
        "on-secondary-fixed-variant": "#005236",
        "surface-variant": "#d3e4fe",
        "surface-container-highest": "#d3e4fe",
        "on-secondary": "#ffffff",
        "surface-container-high": "#dce9ff",
        "on-primary": "#ffffff",
        "inverse-on-surface": "#eaf1ff",
        "surface": "#f8f9ff",
        "secondary-fixed": "#6ffbbe",
        "inverse-primary": "#adc6ff",
        "on-tertiary": "#ffffff",
        "on-background": "#0b1c30",
        "secondary-container": "#6cf8bb",
        "secondary-fixed-dim": "#4edea3",
        "primary-fixed-dim": "#adc6ff",
        "outline": "#727785",
        "inverse-surface": "#213145",
        "on-error-container": "#93000a",
        "error-container": "#ffdad6",
        "on-surface-variant": "#424754",
        "tertiary-fixed-dim": "#ffb95f",
        "tertiary-container": "#a36700",
        "primary-container": "#2170e4",
        "error": "#ba1a1a",
        "on-secondary-fixed": "#002113",
        "tertiary": "#825100",
        "outline-variant": "#c2c6d6"
      },
      spacing: {
        xs: "4px",
        md: "16px",
        xl: "32px",
        lg: "24px",
        gutter: "24px",
        base: "8px",
        "container-margin": "32px",
        sm: "8px"
      },
      fontSize: {
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "500" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        display: ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "data-mono": ["14px", { lineHeight: "20px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-lg": ["28px", { lineHeight: "36px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "title-lg": ["18px", { lineHeight: "24px", fontWeight: "600" }]
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.75rem"
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0"
          },
          to: {
            height: "var(--radix-accordion-content-height)"
          }
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)"
          },
          to: {
            height: "0"
          }
        },
        "accordion-down": {
          from: {
            height: "0"
          },
          to: {
            height: "var(--radix-accordion-content-height)"
          }
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)"
          },
          to: {
            height: "0"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
