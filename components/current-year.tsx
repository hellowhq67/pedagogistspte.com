async function getCurrentYear() {
  'use cache'
  return new Date().getFullYear()
}

export default async function CurrentYear() {
  const year = await getCurrentYear()
  return <span>{year}</span>
}
