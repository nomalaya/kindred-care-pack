// Déduction du genre à partir d'un prénom (FR + prénoms maghrébins/africains/arabes courants).
// Renvoie "woman" | "man" | "person" | null (null uniquement si aucun prénom).

export type InferredGender = "woman" | "man" | "person";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

// Liste de prénoms féminins (FR Insee top + diaspora)
const F = new Set([
  // FR top
  "marie","jeanne","francoise","monique","catherine","nathalie","isabelle","sylvie",
  "anne","martine","brigitte","christine","nicole","valerie","veronique","sandrine",
  "stephanie","celine","julie","caroline","emilie","sophie","laure","laurence","helene",
  "patricia","chantal","aurelie","virginie","sabrina","laetitia","amelie","camille",
  "manon","lea","chloe","emma","sarah","clara","jade","louise","lola","ines","mila",
  "rose","alice","anna","lina","ambre","romane","juliette","margot","eva","lily",
  "agnes","beatrice","cecile","claire","dominique","elodie","florence","francine",
  "ghislaine","ines","irene","josiane","lucie","madeleine","marguerite","marion",
  "mireille","muriel","nadia","odile","pascale","raymonde","renee","simone","yvette",
  "yvonne","therese","suzanne","solange","severine","sonia","silvia","sandra",
  "rachel","oceane","noemie","mathilde","melanie","melissa","myriam","nadege",
  "delphine","corinne","aurore","audrey","alexandra","clarisse","constance",
  "diane","eleonore","fanny","gabrielle","ines","jacqueline","josephine","lara",
  "leila","lou","maud","morgane","nina","olivia","pauline","priscilla","sasha",
  "tiphaine","vanessa","victoire","violette","zoe","carla","lana","luna","maya",
  // Diaspora / arabe / maghreb / afrique
  "fatima","aicha","aisha","amina","aminata","awa","aya","bahia","dalila",
  "djamila","fadila","farida","hafsa","hajar","halima","hanane","houda","ikram",
  "imene","jamila","kahina","karima","khadija","leila","lina","mariam","mariama",
  "myriam","naima","nora","nour","nourhane","rachida","rania","rim","rokia",
  "salima","samia","selma","souad","yasmine","yasmina","zahra","zineb","sofia",
  "asma","sumaya","oumou","fatou","aissatou","khady","mariem","binta","kadiatou",
  // Asie / divers
  "linh","mei","yui","sakura","ling","priya","mei","aya","yara",
]);

// Liste de prénoms masculins
const M = new Set([
  "jean","pierre","michel","andre","philippe","alain","bernard","christian",
  "daniel","jacques","marc","claude","francois","gerard","henri","laurent","louis",
  "luc","olivier","patrick","paul","rene","robert","roger","sebastien","serge",
  "thierry","vincent","yves","nicolas","julien","thomas","david","stephane",
  "frederic","alexandre","fabrice","jerome","mathieu","romain","guillaume",
  "antoine","arnaud","benoit","clement","cyril","damien","emmanuel","etienne",
  "florent","gilles","gregory","hugo","loic","ludovic","maxime","quentin",
  "raphael","remi","simon","theo","tristan","valentin","xavier","yann","leo",
  "lucas","nathan","ethan","gabriel","jules","arthur","liam","noah","adam",
  "mathis","sacha","tom","timeo","aaron","axel","enzo","evan","ayoub","amir",
  "anis","ismael","kylian","mael","nolan","sami","yanis","zakaria",
  // Maghreb / arabe / afrique
  "mohamed","mohammed","ahmed","ali","hassan","hussein","ibrahim","ismail",
  "karim","mehdi","mustapha","omar","rachid","said","tarek","walid","yassine",
  "youssef","younes","abdel","abdelkader","abdelaziz","abdellah","amine","aziz",
  "bilal","brahim","driss","farid","habib","hakim","hicham","idriss","issa",
  "jamal","khaled","lahcen","mokhtar","nabil","nordine","othman","redouane",
  "samir","sofiane","sofiene","tahar","wassim","aboubacar","amadou","bakary",
  "demba","mamadou","moussa","ousmane","seydou","sekou","souleymane",
]);

// Prénoms ambigus → on retient "woman" par décision produit
const AMBIGUOUS = new Set([
  "camille","dominique","claude","alex","maxime","sacha","charlie","sasha",
  "ange","loubna","morgan","stephane","kim","yael","noa","eden","andrea",
]);

function classifyOne(name: string): InferredGender | null {
  const n = norm(name);
  if (!n) return null;
  // garder uniquement le premier sous-prénom (avant espace ou tiret)
  const first = n.split(/[\s\-']+/)[0];
  if (!first) return null;

  if (AMBIGUOUS.has(first)) return "woman";
  if (F.has(first)) return "woman";
  if (M.has(first)) return "man";

  // Heuristique de terminaisons FR
  if (/(ette|elle|ine|ique|ence|ance|esse|eline|enne|onne|ille|iane|iane)$/.test(first)) return "woman";
  if (first.endsWith("a") && first.length > 2) return "woman"; // Fatima, Aïcha, Sofia…
  if (/(ic|an|er|ard|aud|ent|ot|on|in|ien|on)$/.test(first)) return "man";

  return null;
}

export function inferGenderFromName(
  ...names: (string | null | undefined)[]
): { gender: InferredGender | null; matchedName: string | null } {
  const cleaned = names.filter((n): n is string => !!n && !!n.trim());
  if (cleaned.length === 0) return { gender: null, matchedName: null };

  for (const raw of cleaned) {
    const g = classifyOne(raw);
    if (g) return { gender: g, matchedName: norm(raw).split(/[\s\-']+/)[0] };
  }
  // Aucun match → valeur neutre signalée
  return { gender: "person", matchedName: cleaned[0] };
}
