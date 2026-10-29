/**
 * Copy for the token specimen route. Internal, but routed through `content/`
 * like everything else — the rule has no exceptions or it is not a rule.
 */
export const tokensPage = {
  title: 'Token specimen',
  intro:
    'Everything below is rendered from CSS custom properties only. No component on this page contains a colour or a font name. Change the preset on <html> and the whole sheet changes with it.',
  sections: {
    colour: 'Colour',
    colourNote:
      'Semantic slots. There is no --grey-400 — a token is named for the job it does, so a preset is free to make it any colour it likes.',
    accentNote:
      'The accent is #900000, the dot over the i. It is the verification mark, the active state and the loading indicator. That is the whole colour story.',
    type: 'Type',
    typeNote:
      'Tracking tightens as size increases. Each step carries its own tracking and leading, so a size class is a complete typographic decision.',
    specimen: 'Specimen',
    weights: 'Weight',
    space: 'Space',
    spaceNote: '4px base.',
    radius: 'Radius',
    radiusNote:
      'Near-square by default. A token rather than an assumption, so the decision can be tested rather than argued about.',
    motion: 'Motion',
    motionNote:
      'One curve everywhere, so the whole site moves with one personality. Hover a swatch to see it.',
    elevation: 'Elevation',
    elevationNote:
      'No decorative shadow in this direction. Depth is a hairline and a surface change; these two exist for the places that genuinely need lift.',
  },
  pangram: 'Circular fashion, worn again',
  paragraph:
    'Every garment on Vaapsi is one of one. It has been somewhere, and its passport says where — who made it, who wore it, what was mended and by whom. A resale listing that hides that history is asking to be trusted. One that shows it does not have to.',
} as const
