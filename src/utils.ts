export const openLink = (link?: null | string) => {
  if (link) window.open(link, '_blank')
}
