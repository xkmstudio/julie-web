export function dateOrder(date) {
  return `
      ${date.split('-')[1]}.${date.split('-')[2]}.${date
    .split('-')[0]
    .replace('20', '')}`
}
