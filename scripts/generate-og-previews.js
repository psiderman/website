#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs'
import path from 'path'

const FILTERS = ['building', 'life', 'money', 'music', 'travel', 'work']
const DIST_DIR = 'dist'
const OG_IMAGE_URL = 'https://psiderman.com/og.png'

function main() {
  const indexPath = path.join(DIST_DIR, 'index.html')
  const html = fs.readFileSync(indexPath, 'utf8')

  const outDir = path.join(DIST_DIR, 'og-previews')
  fs.mkdirSync(outDir, { recursive: true })

  for (const filter of FILTERS) {
    const preview = html.replaceAll(OG_IMAGE_URL, `https://psiderman.com/og_${filter}.png`)
    fs.writeFileSync(path.join(outDir, `${filter}.html`), preview)
    console.log(`og-preview ${filter}.html`)
  }
}

main()
