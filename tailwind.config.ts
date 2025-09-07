
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				game: {
					purple: '#8B5CF6',
					blue: '#0EA5E9',
					orange: '#F97316',
					pink: '#D946EF',
					darkpurple: '#7E69AB',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-left': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-100%)' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'pulse-light': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				},
				'rotate-y': {
					'0%': { transform: 'rotateY(0deg)' },
					'100%': { transform: 'rotateY(180deg)' }
				},
				// Game-specific animations
				'slide-up': {
					'0%': { 
						transform: 'translateY(100%)',
						opacity: '0'
					},
					'100%': { 
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'sudoku-slide': {
					'0%': { 
						transform: 'translateY(100%) scale(0.9)',
						opacity: '0'
					},
					'50%': {
						transform: 'translateY(50%) scale(0.95)'
					},
					'100%': { 
						transform: 'translateY(0) scale(1)',
						opacity: '1'
					}
				},
				'tetris-drop': {
					'0%': { 
						transform: 'translateY(-100%) rotate(-10deg)',
						opacity: '0'
					},
					'50%': {
						transform: 'translateY(20%) rotate(5deg)',
						opacity: '0.8'
					},
					'100%': { 
						transform: 'translateY(0) rotate(0deg)',
						opacity: '1'
					}
				},
				'quiz-flip': {
					'0%': { 
						transform: 'translateY(100%) rotateX(-90deg)',
						opacity: '0'
					},
					'50%': {
						transform: 'translateY(50%) rotateX(-45deg)',
						opacity: '0.5'
					},
					'100%': { 
						transform: 'translateY(0) rotateX(0deg)',
						opacity: '1'
					}
				},
				'memory-reveal': {
					'0%': { 
						transform: 'translateY(100%) scale(0)',
						opacity: '0'
					},
					'60%': {
						transform: 'translateY(10%) scale(1.1)',
						opacity: '0.8'
					},
					'100%': { 
						transform: 'translateY(0) scale(1)',
						opacity: '1'
					}
				},
				'math-popup': {
					'0%': { 
						transform: 'translateY(100%) scale(0.5)',
						opacity: '0'
					},
					'70%': {
						transform: 'translateY(-10%) scale(1.05)',
						opacity: '0.9'
					},
					'100%': { 
						transform: 'translateY(0) scale(1)',
						opacity: '1'
					}
				},
				'emoji-bounce': {
					'0%': { 
						transform: 'translateY(100%) scale(0.8)',
						opacity: '0'
					},
					'50%': {
						transform: 'translateY(-20%) scale(1.2)',
						opacity: '0.8'
					},
					'75%': {
						transform: 'translateY(10%) scale(0.9)',
						opacity: '0.9'
					},
					'100%': { 
						transform: 'translateY(0) scale(1)',
						opacity: '1'
					}
				},
				'word-scatter': {
					'0%': { 
						transform: 'translateY(100%) translateX(-50px) rotate(-20deg)',
						opacity: '0'
					},
					'50%': {
						transform: 'translateY(50%) translateX(20px) rotate(10deg)',
						opacity: '0.7'
					},
					'100%': { 
						transform: 'translateY(0) translateX(0) rotate(0deg)',
						opacity: '1'
					}
				},
				'balloon-float': {
					'0%': { 
						transform: 'translateY(100%) scale(0.9)',
						opacity: '0'
					},
					'30%': {
						transform: 'translateY(80%) scale(0.95)',
						opacity: '0.3'
					},
					'60%': {
						transform: 'translateY(30%) scale(1.02)',
						opacity: '0.7'
					},
					'100%': { 
						transform: 'translateY(0) scale(1)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-left': 'slide-out-left 0.3s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'pulse-light': 'pulse-light 1.5s infinite',
				'rotate-y-180': 'rotate-y 0.5s forwards',
				// Game-specific animations
				'slide-up': 'slide-up 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'sudoku-slide': 'sudoku-slide 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
				'tetris-drop': 'tetris-drop 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'quiz-flip': 'quiz-flip 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'memory-reveal': 'memory-reveal 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'math-popup': 'math-popup 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'emoji-bounce': 'emoji-bounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'word-scatter': 'word-scatter 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'balloon-float': 'balloon-float 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

