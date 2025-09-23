module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html",
    ],
    theme: {
        extend: {
            animation: {
                'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce': 'bounce 1s infinite',
                'spin': 'spin 1s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'slide': 'slide 2s infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                slide: {
                    '0%': { left: '-100%' },
                    '100%': { left: '100%' },
                }
            },
            perspective: {
                '1000': '1000px',
            },
            transformStyle: {
                'preserve-3d': 'preserve-3d',
            },
            backfaceVisibility: {
                'hidden': 'hidden',
            },
            rotate: {
                'y-180': 'rotateY(180deg)',
            }
        },
    },
    plugins: [
        function({ addUtilities }) {
            const newUtilities = {
                '.perspective-1000': {
                    perspective: '1000px',
                },
                '.transform-style-preserve-3d': {
                    transformStyle: 'preserve-3d',
                },
                '.backface-hidden': {
                    backfaceVisibility: 'hidden',
                },
                '.rotate-y-180': {
                    transform: 'rotateY(180deg)',
                }
            }
            addUtilities(newUtilities)
        }
    ],
}