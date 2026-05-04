import type FunctionalAstrolabe from 'iztro/lib/astro/FunctionalAstrolabe'

export interface RemappedPalace {
  originalPalace: string
  remappedPalace: string
}

export interface MutagenPlacement {
  star: string
  originalPalace: string
  remappedPalace: string
}

function getStarPalaces(chart: FunctionalAstrolabe, starName: string): string[] {
  return chart.palaces
    .filter((palace) => {
      const inMajor = palace.majorStars.some((star) => star.name === starName)
      const inMinor = palace.minorStars.some((star) => star.name === starName)
      return inMajor || inMinor
    })
    .map((palace) => palace.name)
}

function mapByPalaceNames(chart: FunctionalAstrolabe, palaceNames: string[]): RemappedPalace[] {
  return chart.palaces.map((palace, index) => ({
    originalPalace: palace.name,
    remappedPalace: palaceNames[index],
  }))
}

export function getDecadalRemap(chart: FunctionalAstrolabe, solarDate: string) {
  const horoscope = chart.horoscope(solarDate)
  const palaceMap = mapByPalaceNames(chart, horoscope.decadal.palaceNames)

  const mutagenPlacements: MutagenPlacement[] = horoscope.decadal.mutagen.flatMap((starName) => {
    const originals = getStarPalaces(chart, starName)
    return originals.flatMap((originalPalace) => {
      const mapping = palaceMap.find((item) => item.originalPalace === originalPalace)
      if (!mapping) return []

      return [{
        star: starName,
        originalPalace,
        remappedPalace: mapping.remappedPalace,
      }]
    })
  })

  return {
    stemBranch: `${horoscope.decadal.heavenlyStem}${horoscope.decadal.earthlyBranch}`,
    mutagen: horoscope.decadal.mutagen,
    palaceMap,
    mutagenPlacements,
  }
}

export function getYearlyRemap(chart: FunctionalAstrolabe, solarDate: string) {
  const horoscope = chart.horoscope(solarDate)
  const palaceMap = mapByPalaceNames(chart, horoscope.yearly.palaceNames)

  const mutagenPlacements: MutagenPlacement[] = horoscope.yearly.mutagen.flatMap((starName) => {
    const originals = getStarPalaces(chart, starName)
    return originals.flatMap((originalPalace) => {
      const mapping = palaceMap.find((item) => item.originalPalace === originalPalace)
      if (!mapping) return []

      return [{
        star: starName,
        originalPalace,
        remappedPalace: mapping.remappedPalace,
      }]
    })
  })

  return {
    stemBranch: `${horoscope.yearly.heavenlyStem}${horoscope.yearly.earthlyBranch}`,
    mutagen: horoscope.yearly.mutagen,
    palaceMap,
    mutagenPlacements,
  }
}
