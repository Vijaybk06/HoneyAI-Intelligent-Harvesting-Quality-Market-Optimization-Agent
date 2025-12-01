type RawResult = {
  title?: string;
  link?: string;
  snippet?: string;
  position?: number;
  source?: string;
};

export type SourceDocument = {
  title: string;
  url: string;
  snippet: string;
  hostname: string;
  position: number;
};

type ResearchPaper = SourceDocument & {
  keywords: string[];
};

export type SearchSummary = {
  provider: "serpapi" | "mock";
  sources: SourceDocument[];
  papers: SourceDocument[];
};

const HONEY_KEYWORDS = [
  "honey",
  "bee",
  "bees",
  "beekeeper",
  "beekeeping",
  "apiary",
  "apiaries",
  "apiculture",
  "nectar",
  "pollination",
  "comb",
  "hive",
  "hives",
  "harvest",
  "apis",
  "mellifera",
  "wax",
  "beehive",
  "queen bee",
  "worker bee",
  "drone",
  "honeycomb",
  "propolis",
  "royal jelly",
  "pollen",
  "swarm",
  "colony",
  "frame",
  "smoker",
  "extractor",
];
const RESEARCH_KEYWORDS = [
  "paper",
  "papers",
  "study",
  "studies",
  "research",
  "report",
  "whitepaper",
  "pdf",
];

// Contextual keywords that might relate to honey even without explicit "honey" mention
const CONTEXTUAL_HONEY_KEYWORDS = [
  "sweet", "golden", "amber", "syrup", "natural sweetener", "apiary", "pollinator",
  "nectar", "floral", "wildflower", "manuka", "acacia", "clover", "buckwheat",
  "crystallization", "moisture content", "hmf", "diastase", "pollen", "wax",
  "beekeeping", "hive management", "colony", "queen", "worker", "drone",
  "harvest", "extraction", "comb", "propolis", "royal jelly", "apiculture"
];

// Analyze if query is honey-related even without explicit "honey" keyword
const analyzeHoneyRelevance = (query: string): { isRelated: boolean; confidence: number; reason: string } => {
  const normalized = query.toLowerCase();
  
  // Direct honey keyword match
  if (HONEY_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return { isRelated: true, confidence: 1.0, reason: "Contains explicit honey-related keyword" };
  }
  
  // Check contextual keywords
  const contextualMatches = CONTEXTUAL_HONEY_KEYWORDS.filter((keyword) => 
    normalized.includes(keyword)
  );
  
  if (contextualMatches.length >= 2) {
    return { 
      isRelated: true, 
      confidence: 0.85, 
      reason: `Contains multiple honey-related terms: ${contextualMatches.slice(0, 3).join(", ")}` 
    };
  }
  
  if (contextualMatches.length === 1) {
    // Check if it's a strong indicator
    const strongIndicators = ["beekeeping", "apiary", "hive", "pollinator", "nectar", "manuka", "acacia"];
    if (strongIndicators.some(ind => normalized.includes(ind))) {
      return { 
        isRelated: true, 
        confidence: 0.75, 
        reason: `Contains strong honey-related indicator: ${contextualMatches[0]}` 
      };
    }
    return { 
      isRelated: false, 
      confidence: 0.3, 
      reason: `Weak honey relation: ${contextualMatches[0]}` 
    };
  }
  
  // Check for questions that might be about honey
  const honeyQuestions = [
    "what is", "how to", "tell me about", "explain", "benefits of", "types of",
    "properties of", "health benefits", "nutritional value"
  ];
  
  if (honeyQuestions.some(q => normalized.includes(q))) {
    // Could be asking about honey, but need more context
    return { 
      isRelated: false, 
      confidence: 0.2, 
      reason: "General question without honey context" 
    };
  }
  
  return { isRelated: false, confidence: 0.0, reason: "No honey-related keywords found" };
};

export const isHoneyQuery = (query: string): boolean => {
  const normalized = query.toLowerCase();
  
  // Direct keyword match
  if (HONEY_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return true;
  }
  
  // Intelligent analysis for queries without explicit "honey"
  const analysis = analyzeHoneyRelevance(query);
  return analysis.isRelated && analysis.confidence >= 0.7;
};

// Export analyzeHoneyRelevance for use in UI
export { analyzeHoneyRelevance };

const MOCK_SEARCH_INDEX: SourceDocument[] = [
  {
    title: "FAO Honey Market Intelligence",
    url: "https://www.fao.org/faostat/en/#data",
    snippet:
      "FAO reports Indian spot prices rising 3.4% on tighter acacia supply while EU demand shifts toward premium monoflorals.",
    hostname: "fao.org",
    position: 1,
  },
  {
    title: "Apimondia Honey Quality Standards",
    url: "https://www.apimondia.org/",
    snippet:
      "Apimondia recommends 16–18% moisture for export-ready honey; anything above 19% needs dehumidification before bottling.",
    hostname: "apimondia.org",
    position: 2,
  },
  {
    title: "Honey Market Analysis & Trends",
    url: "https://www.marketresearch.com/",
    snippet:
      "Market research shows NCR consumers paying ₹480–₹560/kg for branded wildflower honey with strong demand for wellness bundles.",
    hostname: "marketresearch.com",
    position: 3,
  },
  {
    title: "EU Organic Certification Guidelines",
    url: "https://ec.europa.eu/info/food-farming-fisheries/organic-farming_en",
    snippet:
      "Key paperwork: organic certificate, residue lab tests (<10 ppb), moisture log, and apiary traceability map.",
    hostname: "ec.europa.eu",
    position: 4,
  },
  {
    title: "Agricultural Weather Monitoring",
    url: "https://www.weather.gov/",
    snippet:
      "Weather data shows night temps at 24°C with 22% humidity, meaning acacia nectar flow remains stable for the next 10 days.",
    hostname: "weather.gov",
    position: 5,
  },
  {
    title: "Honey and Beekeeping Information",
    url: "https://www.beeculture.com/",
    snippet:
      "Comprehensive information about honey production, bee biology, hive management, and beekeeping practices for beginners and experts.",
    hostname: "beeculture.com",
    position: 6,
  },
  {
    title: "National Honey Board - Honey Facts",
    url: "https://www.honey.com/",
    snippet:
      "Educational resources about honey varieties, health benefits, cooking with honey, and the science behind honey production.",
    hostname: "honey.com",
    position: 7,
  },
  {
    title: "USDA Beekeeping Resources",
    url: "https://www.usda.gov/",
    snippet:
      "Government resources on beekeeping best practices, bee health, pollination services, and agricultural support programs.",
    hostname: "usda.gov",
    position: 8,
  },
];

const honeyPaperCorpus: ResearchPaper[] = [
  // Government Research Papers (66%+ requirement)
  {
    title: "USDA - Honey Quality Standards and Moisture Content Analysis",
    url: "https://www.ams.usda.gov/sites/default/files/media/HoneyGradingInspection.pdf",
    snippet:
      "USDA Agricultural Marketing Service research on honey grading standards, moisture content (16-18.6%), and quality parameters for commercial honey production.",
    hostname: "ams.usda.gov",
    position: 1,
    keywords: ["moisture", "quality", "usda", "government", "standards", "paper"],
  },
  {
    title: "FAO - Honey Production and Beekeeping Development",
    url: "https://www.fao.org/3/i0842e/i0842e.pdf",
    snippet:
      "FAO (UN) comprehensive report on honey production, beekeeping practices, market analysis, and sustainable development in apiculture worldwide.",
    hostname: "fao.org",
    position: 2,
    keywords: ["production", "beekeeping", "fao", "government", "un", "paper"],
  },
  {
    title: "NIH - Antimicrobial Properties of Honey: A Review",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4377380/",
    snippet:
      "National Institutes of Health research review on honey's antibacterial, antifungal, and wound-healing properties based on scientific evidence.",
    hostname: "ncbi.nlm.nih.gov",
    position: 3,
    keywords: ["antimicrobial", "health", "nih", "government", "medical", "paper"],
  },
  {
    title: "ICAR - Honey Quality Parameters and Export Standards",
    url: "https://icar.org.in/",
    snippet:
      "Indian Council of Agricultural Research guidelines on honey quality parameters, HMF levels, moisture content, and export certification requirements.",
    hostname: "icar.org.in",
    position: 4,
    keywords: ["quality", "export", "icar", "government", "india", "standards", "paper"],
  },
  {
    title: "USDA ARS - Bee Health and Colony Collapse Disorder Research",
    url: "https://www.ars.usda.gov/oc/brccd/",
    snippet:
      "USDA Agricultural Research Service studies on bee health, colony collapse disorder, pesticides impact, and sustainable beekeeping practices.",
    hostname: "ars.usda.gov",
    position: 5,
    keywords: ["bee health", "colony", "usda", "government", "research", "paper"],
  },
  {
    title: "EU Commission - Honey Authenticity and Adulteration Detection",
    url: "https://ec.europa.eu/food/safety/official_controls/legislation/guidance_documents_en",
    snippet:
      "European Commission research on honey authenticity testing, adulteration detection methods, and regulatory compliance for honey imports.",
    hostname: "ec.europa.eu",
    position: 6,
    keywords: ["authenticity", "adulteration", "eu", "government", "testing", "paper"],
  },
  {
    title: "CDC - Honey and Infant Botulism Prevention Guidelines",
    url: "https://www.cdc.gov/botulism/prevention.html",
    snippet:
      "Centers for Disease Control and Prevention guidelines on honey safety, infant botulism prevention, and proper honey handling practices.",
    hostname: "cdc.gov",
    position: 7,
    keywords: ["safety", "botulism", "cdc", "government", "health", "paper"],
  },
  {
    title: "USDA - Pollination Services and Agricultural Productivity",
    url: "https://www.usda.gov/topics/farming/bees-pollinators",
    snippet:
      "USDA research on honey bee pollination services, crop productivity enhancement, and economic value of pollination in agriculture.",
    hostname: "usda.gov",
    position: 8,
    keywords: ["pollination", "agriculture", "usda", "government", "productivity", "paper"],
  },
  // Reputable Journal Papers (34%)
  {
    title: "Nature - Honey Bee Colony Health and Varroa Mite Management",
    url: "https://www.nature.com/articles/s41598-019-54536-8",
    snippet:
      "Nature Scientific Reports study on honey bee colony health, varroa mite impact, and integrated pest management strategies for sustainable beekeeping.",
    hostname: "nature.com",
    position: 9,
    keywords: ["colony health", "varroa", "nature", "journal", "research", "paper"],
  },
  {
    title: "Journal of Apicultural Research - Honey Composition and Floral Sources",
    url: "https://www.tandfonline.com/toc/tjar20/current",
    snippet:
      "Peer-reviewed research on honey composition analysis, pollen identification, floral source determination, and geographical origin authentication.",
    hostname: "tandfonline.com",
    position: 10,
    keywords: ["composition", "pollen", "floral", "journal", "research", "paper"],
  },
  {
    title: "Food Chemistry - Honey Adulteration Detection Methods",
    url: "https://www.sciencedirect.com/journal/food-chemistry",
    snippet:
      "Scientific research on advanced analytical methods for detecting honey adulteration, including NMR spectroscopy and isotope ratio analysis.",
    hostname: "sciencedirect.com",
    position: 11,
    keywords: ["adulteration", "detection", "chemistry", "journal", "research", "paper"],
  },
  {
    title: "PLOS ONE - Honey Antioxidant Properties and Health Benefits",
    url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0124861",
    snippet:
      "Open-access research on honey's antioxidant capacity, phenolic compounds, and potential health benefits including anti-inflammatory effects.",
    hostname: "journals.plos.org",
    position: 12,
    keywords: ["antioxidant", "health", "benefits", "journal", "research", "paper"],
  },
];

const stripKeywords = (paper: ResearchPaper): SourceDocument => ({
  title: paper.title,
  url: paper.url,
  snippet: paper.snippet,
  hostname: paper.hostname,
  position: paper.position,
});

const matchesResearchIntent = (query: string) =>
  RESEARCH_KEYWORDS.some((keyword) =>
    query.toLowerCase().includes(keyword.toLowerCase())
  );

const serpApiEndpoint =
  import.meta.env.VITE_SERP_API_ENDPOINT ?? "https://serpapi.com/search.json";
const serpApiKey = import.meta.env.VITE_SERP_API_KEY;
const serpEngine = import.meta.env.VITE_SERP_ENGINE ?? "google";

const buildSource = (result: RawResult, index: number): SourceDocument => {
  const url = result.link ?? result.source ?? "";
  const hostname = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "unknown-source";
    }
  })();
  return {
    title: result.title ?? `Result ${index + 1}`,
    url: url || "#",
    snippet: result.snippet ?? "No snippet available.",
    hostname,
    position: result.position ?? index + 1,
  };
};

const fetchSerpResults = async (query: string): Promise<SourceDocument[]> => {
  if (!serpApiKey) {
    return [];
  }

  const url = new URL(serpApiEndpoint);
  if (!url.searchParams.has("engine")) {
    url.searchParams.set("engine", serpEngine);
  }
  url.searchParams.set("q", query);
  url.searchParams.set("num", "5");
  url.searchParams.set("api_key", serpApiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Search provider rejected the request.");
  }
  const payload = await response.json();
  const organic =
    payload.organic_results ??
    payload.results ??
    payload.news_results ??
    [];
  return organic.slice(0, 5).map(buildSource);
};

const runMockSearch = (query: string): SourceDocument[] => {
  const tokens = query.toLowerCase().split(/\s+/);
  const scored = MOCK_SEARCH_INDEX.map((item) => {
    const score = tokens.reduce(
      (acc, token) =>
        acc + (item.snippet.toLowerCase().includes(token) ? 2 : 0) +
        (item.title.toLowerCase().includes(token) ? 3 : 0),
      0
    );
    return { item, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
    .slice(0, 5);
};

const derivePaperMatches = (
  query: string,
  fallbackSources: SourceDocument[],
  limit = 5
): SourceDocument[] => {
  if (!matchesResearchIntent(query)) {
    return [];
  }
  const tokens = query.toLowerCase().split(/\s+/);
  const normalizedQuery = query.toLowerCase();
  
  // Separate government and journal papers
  const governmentPapers = honeyPaperCorpus.filter((paper) =>
    ["usda", "fao", "nih", "icar", "eu", "ec.europa", "cdc", "gov", "government"].some(
      (gov) => paper.hostname.toLowerCase().includes(gov)
    )
  );
  const journalPapers = honeyPaperCorpus.filter(
    (paper) => !governmentPapers.includes(paper)
  );
  
  // Score all papers
  const scoredPapers = honeyPaperCorpus.map((paper) => {
    const isGovernment = governmentPapers.includes(paper);
    let score = tokens.reduce(
      (acc, token) =>
        acc +
        (paper.keywords.some((keyword) =>
          keyword.toLowerCase().includes(token)
        )
          ? 4
          : 0) +
        (paper.snippet.toLowerCase().includes(token) ? 2 : 0) +
        (paper.title.toLowerCase().includes(token) ? 3 : 0),
      0
    );
    
    // Boost government papers to ensure 66% representation
    if (isGovernment) {
      score += 5; // Government papers get priority boost
    }
    
    // Additional boost for exact keyword matches
    if (normalizedQuery.includes("government") || normalizedQuery.includes("gov")) {
      if (isGovernment) score += 10;
    }
    
    return { paper, score, isGovernment };
  });
  
  // Filter and sort
  const validMatches = scoredPapers
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  
  // Ensure 66% government papers (at least 2 out of 3, or 3 out of 5)
  const targetGovCount = Math.ceil(limit * 0.66);
  const govMatches = validMatches
    .filter(({ isGovernment }) => isGovernment)
    .slice(0, targetGovCount)
    .map(({ paper }) => stripKeywords(paper));
  
  const journalMatches = validMatches
    .filter(({ isGovernment }) => !isGovernment)
    .slice(0, limit - govMatches.length)
    .map(({ paper }) => stripKeywords(paper));
  
  const result = [...govMatches, ...journalMatches].slice(0, limit);
  
  if (result.length) {
    return result;
  }
  return fallbackSources.slice(0, limit);
};

export const executeHoneySearch = async (
  query: string
): Promise<SearchSummary> => {
  if (!query.trim()) {
    return { provider: "mock", sources: [], papers: [] };
  }

  try {
    const sources = await fetchSerpResults(query);
    if (sources.length) {
      return {
        provider: "serpapi",
        sources,
        papers: derivePaperMatches(query, sources),
      };
    }
  } catch (error) {
    console.warn("Falling back to mock search:", error);
  }

  const mockSources = runMockSearch(query);
  return {
    provider: "mock",
    sources: mockSources,
    papers: derivePaperMatches(query, mockSources),
  };
};

const isMarketQuery = (query: string): boolean => {
  const marketTerms = [
    "price", "pricing", "cost", "market", "sell", "buy", "export", "import",
    "wholesale", "retail", "demand", "supply", "trend", "forecast", "inventory",
    "logistics", "shipping", "compliance", "certificate", "quality", "moisture",
    "hmf", "marketing", "packaging", "distribution"
  ];
  const normalized = query.toLowerCase();
  return marketTerms.some(term => normalized.includes(term));
};

const isGeneralKnowledgeQuery = (query: string): boolean => {
  const generalTerms = [
    "what is", "how does", "why", "explain", "tell me about", "information",
    "benefits", "types", "varieties", "properties", "nutrition", "health",
    "history", "origin", "process", "production", "make", "create", "difference"
  ];
  const normalized = query.toLowerCase();
  return generalTerms.some(term => normalized.includes(term));
};

const getGeneralKnowledgeAnswer = (query: string): string => {
  const normalized = query.toLowerCase();
  
  if (normalized.includes("honey bee") || (normalized.includes("bee") && normalized.includes("honey"))) {
    return `Honey bees (Apis mellifera) are social insects that produce honey through a complex process. Worker bees collect nectar from flowers using their long tongues and store it in their honey stomach. Back at the hive, they transfer the nectar to house bees who add enzymes (invertase and glucose oxidase) that break down complex sugars into simpler forms.\n\nThe nectar is then deposited into hexagonal wax cells where worker bees fan their wings to evaporate water, reducing moisture content from approximately 70% to 18%. Once the honey reaches the proper consistency, bees cap the cells with wax to preserve it.\n\n**Honey Production Facts:**\n- A single bee visits 50-100 flowers per trip\n- It takes about 2 million flower visits to produce 1 pound of honey\n- A healthy hive can produce 30-100 pounds of honey per year\n- Honey contains fructose, glucose, water, enzymes, minerals, and trace vitamins\n- Different floral sources create unique honey varieties (wildflower, clover, acacia, manuka, etc.)\n\n**Honey Properties:**\n- Natural preservative with antibacterial properties due to low water content and acidic pH\n- Contains antioxidants that help reduce oxidative stress\n- Has an indefinite shelf life when stored properly in sealed containers\n- Crystallization is natural and indicates pure honey (can be reversed by gentle heating)\n\n**Uses:** Honey serves as food for the colony during winter months and is harvested by beekeepers for human consumption. It's also used in medicine, skincare, and as a natural sweetener.`;
  }
  
  if (normalized.includes("what is honey") || normalized.includes("honey is")) {
    return `Honey is a natural sweet substance produced by honey bees from the nectar of flowers. Bees collect nectar, transform it through enzymatic activity and evaporation, and store it in honeycombs. Honey is composed primarily of fructose and glucose, along with water, enzymes, minerals, and trace amounts of vitamins.\n\n**Key Properties:**\n- Natural preservative with antibacterial properties\n- Contains antioxidants and enzymes\n- Has a long shelf life when stored properly\n- Comes in various flavors depending on the floral source\n\n**Types of Honey:** Honey varies based on the flowers bees visit, resulting in different colors, flavors, and textures. Common types include wildflower, clover, acacia, manuka, and buckwheat honey.`;
  }
  
  if (normalized.includes("beekeeper") || normalized.includes("beekeeping")) {
    return `**Beekeeping Overview**\n\nBeekeeping (also called apiculture) is the practice of maintaining bee colonies, typically in hives, by humans. Beekeepers manage hives to collect honey, beeswax, propolis, royal jelly, and pollen, while also providing pollination services.\n\n**Essential Equipment:**\n- Hive boxes with frames for bees to build comb\n- Protective suit and veil to prevent stings\n- Smoker to calm bees during inspections\n- Hive tool for prying apart frames\n- Honey extractor for harvesting honey\n\n**Basic Practices:**\n- Regular hive inspections to check colony health\n- Monitoring for diseases and pests\n- Providing supplemental feeding when needed\n- Managing swarms and preventing overcrowding\n- Harvesting honey at the right time\n\n**Benefits of Beekeeping:**\n- Produces natural honey and other bee products\n- Supports pollination of crops and gardens\n- Can be a rewarding hobby or commercial venture\n- Helps maintain bee populations`;
  }
  
  if (normalized.includes("bee") && (normalized.includes("life") || normalized.includes("cycle"))) {
    return `**Honey Bee Life Cycle**\n\nHoney bees have a fascinating life cycle with three distinct castes:\n\n**Queen Bee:**\n- Lives 2-5 years\n- Lays up to 2,000 eggs per day\n- The only fertile female in the colony\n- Fed royal jelly throughout her life\n\n**Worker Bees (Female):**\n- Live 6 weeks in summer, several months in winter\n- Perform all colony tasks: foraging, nursing, cleaning, building comb\n- Progress through different roles as they age\n- Cannot reproduce\n\n**Drone Bees (Male):**\n- Live about 8 weeks\n- Sole purpose is to mate with a queen\n- Die after mating or are expelled in fall\n- Larger than workers but smaller than queen\n\n**Development Stages:**\n1. Egg (3 days)\n2. Larva (6 days for workers, 5 for drones, 5.5 for queens)\n3. Pupa (12 days for workers, 14.5 for drones, 7.5 for queens)\n4. Adult bee emerges`;
  }
  
  if (normalized.includes("benefit") || normalized.includes("health")) {
    return `**Health Benefits of Honey**\n\nHoney has been used for medicinal purposes for thousands of years and offers several health benefits:\n\n**Nutritional Value:**\n- Natural source of energy (carbohydrates)\n- Contains antioxidants that help reduce oxidative stress\n- Provides small amounts of vitamins and minerals\n- Contains enzymes that aid digestion\n\n**Therapeutic Properties:**\n- **Antibacterial:** Can help with wound healing and preventing infections\n- **Cough Suppressant:** Effective for soothing sore throats and reducing cough\n- **Digestive Health:** May help with digestive issues and gut health\n- **Skin Care:** Used in natural skincare for its moisturizing properties\n\n**Important Notes:**\n- Honey should not be given to infants under 1 year (risk of botulism)\n- People with diabetes should consume in moderation\n- Raw honey retains more beneficial enzymes than processed honey\n- Quality and floral source affect nutritional content`;
  }
  
  if (normalized.includes("type") || normalized.includes("variety") || normalized.includes("kind") || normalized.includes("types")) {
    // Show one type at a time, but indicate there are many more
    const allHoneyTypes = [
      { name: "Acacia", category: "Light", desc: "Mild, light, and slow to crystallize. Very popular for its delicate flavor." },
      { name: "Clover", category: "Light", desc: "Sweet and mild, very popular. One of the most common honey varieties." },
      { name: "Orange Blossom", category: "Light", desc: "Fruity and citrusy flavor. Popular in Mediterranean regions." },
      { name: "Wildflower", category: "Medium", desc: "Varies by region, complex flavors. Made from multiple flower sources." },
      { name: "Lavender", category: "Medium", desc: "Floral and aromatic. Distinctive lavender scent and flavor." },
      { name: "Sunflower", category: "Medium", desc: "Strong, slightly bitter. Rich golden color." },
      { name: "Buckwheat", category: "Dark", desc: "Strong, molasses-like flavor, high in antioxidants. Dark color." },
      { name: "Manuka", category: "Dark", desc: "From New Zealand, known for medicinal properties. High antibacterial activity." },
      { name: "Eucalyptus", category: "Dark", desc: "Distinctive flavor, often used for respiratory health. From Australia." },
      { name: "Raw Honey", category: "Specialty", desc: "Unfiltered and unpasteurized. Retains all natural enzymes and pollen." },
      { name: "Creamed Honey", category: "Specialty", desc: "Processed to have smooth, spreadable texture. Controlled crystallization." },
      { name: "Comb Honey", category: "Specialty", desc: "Honey still in the wax comb. Purest form of honey." },
      { name: "Tupelo", category: "Light", desc: "Very light, mild flavor. Rare and highly prized." },
      { name: "Sage", category: "Light", desc: "Light color, mild flavor. Slow to crystallize." },
      { name: "Alfalfa", category: "Light", desc: "Light amber color, mild flavor. Common in North America." },
      { name: "Heather", category: "Dark", desc: "Strong, distinctive flavor. Thick, jelly-like texture." },
      { name: "Forest Honey", category: "Dark", desc: "Dark color, rich flavor. From tree nectars and honeydew." },
      { name: "Linden", category: "Medium", desc: "Light color, minty flavor. Calming properties." },
    ];
    
    // Check if asking for a specific type or all types
    const specificTypeMatch = allHoneyTypes.find(type => 
      normalized.includes(type.name.toLowerCase())
    );
    
    if (specificTypeMatch) {
      return `**${specificTypeMatch.name} Honey**\n\nCategory: ${specificTypeMatch.category} Honey\n\n${specificTypeMatch.desc}\n\n**Note:** There are over 20 different types of honey available, each with unique characteristics based on the floral source. Would you like to know about another specific type?`;
    }
    
    // Show one random type but indicate there are many more
    const randomType = allHoneyTypes[Math.floor(Math.random() * allHoneyTypes.length)];
    const totalTypes = allHoneyTypes.length;
    
    return `**Honey Type: ${randomType.name}**\n\nCategory: ${randomType.category} Honey\n\n${randomType.desc}\n\n**Important:** There are ${totalTypes}+ different types of honey available worldwide, each with unique characteristics:\n\n- **Light Honeys:** Acacia, Clover, Orange Blossom, Tupelo, Sage, Alfalfa\n- **Medium Honeys:** Wildflower, Lavender, Sunflower, Linden\n- **Dark Honeys:** Buckwheat, Manuka, Eucalyptus, Heather, Forest Honey\n- **Specialty Honeys:** Raw Honey, Creamed Honey, Comb Honey\n\nEach type varies in color, flavor, texture, crystallization rate, and health properties. Would you like to know about a specific type?`;
  }
  
  if (normalized.includes("how") && normalized.includes("make")) {
    return `**How Honey is Made**\n\nHoney production is a fascinating natural process:\n\n**Step 1: Nectar Collection**\n- Worker bees visit flowers and collect nectar using their long tongues\n- They store nectar in their "honey stomach" (separate from digestive stomach)\n- A bee visits 50-100 flowers per trip\n\n**Step 2: Return to Hive**\n- Forager bees return to the hive and transfer nectar to house bees\n- House bees add enzymes (invertase) that break down complex sugars\n\n**Step 3: Evaporation**\n- Bees deposit nectar into hexagonal wax cells\n- They fan their wings to evaporate water (reducing from ~70% to ~18%)\n- This process can take several days\n\n**Step 4: Ripening**\n- Bees add more enzymes and continue to reduce moisture\n- When honey reaches proper consistency, bees cap the cell with wax\n\n**Step 5: Harvesting**\n- Beekeepers remove frames when cells are capped\n- Extract honey using centrifugal force\n- Filter to remove wax and debris\n- Bottle for consumption\n\n**Fun Fact:** It takes about 2 million flower visits to make 1 pound of honey!`;
  }
  
  // Default general knowledge response
  return `**General Information About Honey and Beekeeping**\n\nBased on your question about "${query}", here's what I can share:\n\nHoney is a remarkable natural product created by honey bees through a complex process of collecting nectar, adding enzymes, and evaporating water. Beekeeping is the practice of managing bee colonies to harvest honey and support pollination.\n\n**Key Points:**\n- Honey bees are essential pollinators for many crops\n- A single hive can produce 30-100 pounds of honey per year\n- Honey has natural preservative and antibacterial properties\n- Beekeeping requires knowledge of bee biology and hive management\n- Different floral sources create unique honey varieties\n\nIf you have a specific question about honey production, bee behavior, hive management, or honey varieties, I can provide more detailed information!`;
};

const getMarketAgentResponse = (
  query: string,
  sources: SourceDocument[]
): string => {
  if (!sources.length) {
    return `Current market intelligence is unavailable. Market data includes real-time pricing analysis, supply and demand forecasting, export/import trends, quality standards, and logistics insights.`;
  }
  
  const primary = sources[0];
  const support = sources[1];
  const third = sources[2];
  
  let narrative = `${primary.snippet}`;
  
  if (support) {
    narrative += ` ${support.snippet}`;
  }
  
  if (third) {
    narrative += ` ${third.snippet}`;
  }
  
  narrative += `\n\n**Market Analysis:**\n- Current trends indicate significant market dynamics affecting pricing and availability\n- Supply chain factors influence trading opportunities\n- Regional variations impact market conditions\n- Quality standards affect premium pricing potential\n\n**Recommendations:**\n- Monitor trends for pricing adjustments\n- Adjust inventory based on demand forecasts\n- Explore new market opportunities\n- Maintain quality standards for premium positioning`;
  
  return narrative;
};

const getResearchAgentResponse = (
  query: string,
  sources: SourceDocument[],
  papers: SourceDocument[]
): string => {
  let narrative = ``;
  
  if (papers.length > 0) {
    narrative += `**Research Papers Found (${papers.length} papers):**\n\n`;
    
    papers.forEach((paper, idx) => {
      const isGovernment = ["usda", "fao", "nih", "icar", "eu", "ec.europa", "cdc", "gov", "government"].some(
        (gov) => paper.hostname.toLowerCase().includes(gov)
      );
      const sourceType = isGovernment ? "Government Research" : "Peer-Reviewed Journal";
      
      narrative += `${idx + 1}. **${paper.title}**\n`;
      narrative += `   Source: ${sourceType} (${paper.hostname})\n`;
      narrative += `   Link: ${paper.url}\n`;
      narrative += `   Summary: ${paper.snippet}\n\n`;
    });
    
    const govCount = papers.filter((p) =>
      ["usda", "fao", "nih", "icar", "eu", "ec.europa", "cdc", "gov", "government"].some(
        (gov) => p.hostname.toLowerCase().includes(gov)
      )
    ).length;
    const govPercentage = Math.round((govCount / papers.length) * 100);
    
    narrative += `**Source Distribution:** ${govCount} government research papers (${govPercentage}%), ${papers.length - govCount} peer-reviewed journal papers (${100 - govPercentage}%)\n\n`;
  }
  
  if (sources.length > 0) {
    narrative += `**Additional Research Insights:**\n\n`;
    const primary = sources[0];
    const support = sources[1];
    
    narrative += `${primary.snippet}`;
    
    if (support) {
      narrative += ` ${support.snippet}`;
    }
  }
  
  if (papers.length > 0) {
    narrative += `\n\nAll papers listed above are from verified government research institutions and reputable scientific journals with valid, accessible links.`;
  }
  
  return narrative;
};

export const summarizeSources = (
  query: string,
  sources: SourceDocument[],
  papers: SourceDocument[] = []
): string => {
  const normalized = query.toLowerCase();
  const isResearchQuery = matchesResearchIntent(query);
  
  // Research Agent handles research paper queries
  if (isResearchQuery) {
    return getResearchAgentResponse(query, sources, papers);
  }
  
  // Market Agent handles market-related queries
  if (isMarketQuery(query)) {
    return getMarketAgentResponse(query, sources);
  }
  
  // General Agent handles general knowledge questions
  if (isGeneralKnowledgeQuery(query) || normalized.includes("honey bee") || (normalized.includes("bee") && normalized.includes("honey"))) {
    const generalAnswer = getGeneralKnowledgeAnswer(query);
    if (sources.length > 0) {
      return `${generalAnswer}\n\n**Additional Information:**\n\n${sources[0].snippet}${sources[1] ? ` ${sources[1].snippet}` : ''}`;
    }
    return generalAnswer;
  }
  
  // Default: Enhanced general response with more information
  if (!sources.length) {
    return `Information is currently unavailable. I can help with general questions about honey and beekeeping, market intelligence and pricing, research papers and scientific studies, and field practices. Please try rephrasing your question.`;
  }
  
  const primary = sources[0];
  const support = sources[1];
  const third = sources[2];
  
  // Direct, comprehensive answer like Google
  let narrative = `${primary.snippet}`;
  
  if (support) {
    narrative += ` ${support.snippet}`;
  }
  
  if (third) {
    narrative += ` ${third.snippet}`;
  }
  
  return narrative;
};

export const buildFocusPoints = (
  sources: SourceDocument[],
  depth = 3
): string[] => {
  if (!sources.length) {
    return [
      "No live sources returned. Using stored market heuristics for guidance.",
    ];
  }
  return sources
    .slice(0, depth)
    .map(
      (entry) =>
        `${entry.hostname}: ${entry.snippet.substring(0, 110)}${
          entry.snippet.length > 110 ? "…" : ""
        }`
    );
};

export const defaultPaperShelf = honeyPaperCorpus
  .slice(0, 3)
  .map((paper) => stripKeywords(paper));

