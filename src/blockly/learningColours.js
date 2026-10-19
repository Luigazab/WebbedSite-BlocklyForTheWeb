// Keep white block labels and selected category text readable.
const colours = { '#F7DF1E': '#996600', '#E6A817': '#996600', '#E8760A': '#A34700', '#4285F4': '#275DA8', '#E67E22': '#A64D0A', '#9B59B6': '#7E3B99', '#E74C3C': '#B32F24', '#1ABC9C': '#0C7563', '#27AE60': '#187D42', '#2980B9': '#246E9E' }
export const learningColour = colour => colours[colour.toUpperCase()] ?? colour
