// Comic Vine occasionally returns a broken link or a "no image on file"
// placeholder. This gives every <img> a graceful, on-brand fallback
// (character initials on a flat card) instead of a broken image icon.
export function fallbackAvatar(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=d9cba3&color=201c14&size=512&bold=true&font-size=0.4`
}

export function handleImgError(name: string) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null
    e.currentTarget.src = fallbackAvatar(name)
  }
}
