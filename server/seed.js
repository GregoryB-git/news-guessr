const mongoose = require('mongoose');
const { connectDB } = require('./db');
const News = require('./models/News');

const SEED_ARTICLES = [
  {
    headline: 'NASA Discovers Atmospheric Clues on Earth-Sized Rocky Exoplanet',
    newsbody: `Astronomers analyzing spectroscopic data from the James Webb Space Telescope have observed compelling evidence of atmospheric gases enveloping a rocky exoplanet orbiting within the habitable zone of a nearby red dwarf star. The planetary body, designated LP 791-18 d, exhibits thermal and chemical signatures that suggest volcanic venting actively replenishes a carbon-rich vapor mantle. Researchers believe that if an atmosphere is stabilized against stellar flares, the world could support liquid water lakes on its terminator boundary between permanent day and night. Further transit spectroscopy observations are scheduled to determine atmospheric density and water vapor content.`,
    source_url: 'https://www.nasa.gov/missions/webb/webb-reveals-atmospheric-diversity-on-rocky-exoplanets',
    source_name: 'NASA Science',
    category: 'Science',
    difficulty: 'Medium',
    summary: 'Webb telescope identifies atmospheric vapor on a temperate terrestrial exoplanet.',
    status: 'current',
  },
  {
    headline: 'European Fusion Facility Sets Historic Clean Energy Generation Record',
    newsbody: `Engineers and nuclear physicists at the Joint European Torus (JET) facility in Oxford have achieved a landmark breakthrough in controlled nuclear fusion energy production. Using a specialized deuterium-tritium fuel mixture, the magnetic confinement tokamak sustained high-power plasma for an uninterrupted pulse, yielding 69 megajoules of energy and shattering the previous global milestone. The milestone provides critical experimental verification for ITER, the massive international fusion reactor currently under construction in Saint-Paul-lès-Durance, France, which aims to achieve net energy gain and pave the path toward decarbonized baseload electrical power for future generations.`,
    source_url: 'https://www.euro-fusion.org/news/2024/breakthrough-fusion-energy-record',
    source_name: 'EuroFusion',
    category: 'Science',
    difficulty: 'Hard',
    summary: 'Tokamak facility generates sustained high-power fusion plasma pulses.',
    status: 'upcoming',
  },
  {
    headline: 'Archaeologists Unearth Hidden Ancient City Deep Inside Amazon Rainforest',
    newsbody: `Using airborne LiDAR laser-scanning technology, an international team of archaeologists has discovered a sprawling network of ancient urban centers buried beneath dense tree canopies in the Upano Valley of eastern Ecuador. The settlement complex, dating back over 2,500 years to roughly 500 BCE, features monumental earthen mounds, sunken agricultural plazas, and interconnected paved roadways spanning hundreds of square kilometers. Anthropologists state the discovery completely overturns long-standing colonial assumptions that pre-Columbian Amazonian societies consisted solely of nomadic hunter-gatherer populations, revealing instead an interconnected agrarian civilization of tens of thousands.`,
    source_url: 'https://www.science.org/doi/10.1126/science.adi6317',
    source_name: 'Science Journal',
    category: 'World',
    difficulty: 'Medium',
    summary: 'LiDAR scanning uncovers a 2,500-year-old urban agrarian civilization in Ecuador.',
    status: 'upcoming',
  },
  {
    headline: 'Global Climate Summit Finalizes Pact to Triple Renewable Power Capacity',
    newsbody: `Delegates representing nearly two hundred nations concluded marathon international climate negotiations in Dubai by signing a binding accord that mandates tripling global installed renewable energy capacity by 2030. The declaration specifically targets accelerating the deployment of utility-scale solar photovoltaic arrays, offshore wind farms, and next-generation battery energy storage systems (BESS). In addition, developed nations pledged billions in climate transition finance to support emerging economies in replacing legacy coal and gas thermal plants with clean grid infrastructure while establishing strict monitoring benchmarks.`,
    source_url: 'https://unfccc.int/cop28/renewable-energy-commitments',
    source_name: 'UN Climate News',
    category: 'Climate',
    difficulty: 'Easy',
    summary: 'Worldwide treaty establishes ambitious 2030 renewable generation benchmarks.',
    status: 'upcoming',
  },
  {
    headline: 'Engineers Unveil Solid-State Battery Delivering Thousand Kilometer Vehicle Range',
    newsbody: `Automotive engineers and materials scientists have revealed a commercial solid-state ceramic electrolyte battery cell capable of powering passenger electric vehicles for over 1,000 kilometers on a single charge. The breakthrough design replaces conventional flammable liquid lithium-ion electrolytes with a nanostructured composite separator that dramatically inhibits dendrite formation during rapid charging. Laboratory stress tests indicate the cells retain over 90 percent capacity after 1,200 fast-charge cycles, while reducing thermal runaway hazard to virtually zero. Pilot assembly lines are scheduled to begin vehicle integration trials next year.`,
    source_url: 'https://www.reuters.com/technology/next-gen-solid-state-battery-advancements',
    source_name: 'Reuters Technology',
    category: 'Tech',
    difficulty: 'Medium',
    summary: 'Ceramic electrolyte battery cells achieve 1000km electric range and rapid charging.',
    status: 'upcoming',
  },
  {
    headline: 'Ocean Explorers Discover Pristine Deepwater Coral Reef Thriving in Galapagos',
    newsbody: `Marine biologists aboard the Falkor research vessel have identified an extensive, pristine deepwater coral reef thriving along a previously uncharted underwater ridge in the Galapagos Marine Reserve. Located between 400 and 600 meters below sea surface level, the vertical coral wall supports a biodiversity haven of prehistoric glass sponges, pink sea fans, deepwater sharks, and potentially dozens of undiscovered crustacean species. Conservationists emphasize that because the reef has developed undisturbed by warming ocean surface temperatures, it serves as an irreplaceable living laboratory for marine resilience.`,
    source_url: 'https://www.schmidtocean.org/galapagos-deep-reef-discovery',
    source_name: 'Schmidt Ocean Institute',
    category: 'World',
    difficulty: 'Hard',
    summary: 'Deep-sea exploration discovers thriving cold-water reef at 600 meters depth.',
    status: 'archived',
  },
  {
    headline: 'Quantum Computing Laboratory Demonstrates Fault-Tolerant Logical Qubits',
    newsbody: `A consortium of physicists and computer scientists has demonstrated fault-tolerant quantum error correction on a neutral-atom processor, executing complex algorithmic circuits across dozens of entangled logical qubits. By continuously detecting and correcting physical noise through surface code algorithms without disturbing the quantum superposition, the team suppressed algorithmic calculation error rates by a factor of eight hundred. Industry experts consider the benchmark a watershed transition from noisy intermediate-scale quantum devices toward mathematically reliable quantum supercomputing.`,
    source_url: 'https://www.nature.com/articles/s41586-023-06927-3',
    source_name: 'Nature News',
    category: 'Tech',
    difficulty: 'Hard',
    summary: 'Neutral-atom quantum processor achieves operational fault-tolerant logical qubits.',
    status: 'archived',
  },
  {
    headline: 'Marathon Legend Smashes Historic World Record Under Blue Skies',
    newsbody: `Before cheering crowds lining the historic streets of Berlin, the reigning Olympic champion produced an astonishing masterclass of long-distance pacing to lower the official world marathon record. Traversing the flat 42.195-kilometer course with metronomic 2-minute-and-52-second kilometer splits, the runner broke away from the pacemaker pack at the thirty-kilometer mark before crossing the Brandenburg Gate finish line in 2 hours and 35 seconds. Sports scientists hailed the performance as one of the greatest endurance achievements in athletic history.`,
    source_url: 'https://www.worldathletics.org/news/berlin-marathon-world-record-shattered',
    source_name: 'World Athletics',
    category: 'Culture',
    difficulty: 'Easy',
    summary: 'Elite distance runner establishes new all-time marathon mark in Berlin.',
    status: 'archived',
  },
];

async function seed() {
  await connectDB();
  console.log('Seeding news articles...');

  await News.deleteMany({});
  const inserted = await News.insertMany(SEED_ARTICLES);
  console.log(`Successfully seeded ${inserted.length} news articles with statuses!`);

  for (const article of inserted) {
    console.log(`- [${article.status.toUpperCase()}] ${article.headline}`);
  }

  process.exit(0);
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = { seed, SEED_ARTICLES };
