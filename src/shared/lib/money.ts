// Costs are written the Ukrainian way: "4 800 ₴", and "12,40 ₴" where kopecks matter
const whole = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'UAH',
  maximumFractionDigits: 0,
})
const precise = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'UAH',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatUah = (amount: number) => whole.format(amount)

/** For small sums, such as a cost per kilometre */
export const formatUahPrecise = (amount: number) => precise.format(amount)
