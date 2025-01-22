import axios from "axios";
import readline from "readline";
import Fuse from "fuse.js";
import Table from "cli-table3";

const formatPokemonData = (pokemon) => {
  const table = new Table({
    head: ["Attribute", "Details"],
    colWidths: [20, 80],
    wordWrap: true,
  });

  table.push(
    ["ID", pokemon.id],
    ["Name", pokemon.name],
    ["Order", pokemon.order],
    ["Weight", `${pokemon.weight} kg`],
    ["Height", `${pokemon.height} m`],
    ["Types", pokemon.types.join(", ")],
    ["Abilities", pokemon.abilities.join(", ")],
    ["Habitat", pokemon.habitat || "Unknown"],
    ["Description", pokemon.description || "No description available"],
    [
      "Evolution Chain",
      pokemon.evolution_chain.map((evo) => evo.name).join(" → "),
    ],
    [
      "Red/Blue Locations",
      pokemon.redBlueLocations
        .map(
          (loc) =>
            `${loc.location_area} (Version: ${loc.version}, Method: ${loc.encounter_method
              .map(
                (method) =>
                  `${method.method} (Lv ${method.min_level}–${method.max_level}, Chance: ${method.chance}%)`,
              )
              .join("; ")})`,
        )
        .join("\n"),
    ],
  );

  return table.toString();
};

const fetchData = async () => {
  const response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=151",
  );
  const pokemonTotal = 9;
  const pokemonList = [];

  //return name and url with pokemon info
  const data = response.data.results.slice(0, pokemonTotal);

  for (const item of data) {
    //pokemon
    const pokemonResponse = await axios.get(item.url);
    const pokemonData = pokemonResponse.data;

    //filter first gen moves
    const moves = pokemonData.moves
      .map((move) => {
        const isRightVersion = move.version_group_details.find(
          (detail) => detail.version_group.name == "red-blue",
        );
        if (isRightVersion) {
          return {
            name: move.move.name,
            level_learned_at: isRightVersion.level_learned_at,
            learn_method: isRightVersion.move_learn_method.name,
          };
        }
        return null;
      })
      .filter((move) => move != null);

    //species
    const speciesResponse = await axios.get(pokemonData.species.url);
    const speciesData = speciesResponse.data;

    //filter flavor for first gen
    const flavorTextEntry = speciesData.flavor_text_entries.find(
      (item) => item.language.name == "en" && item.version.name == "red",
    );

    //evolution
    const evolutionChainResponse = await axios.get(
      speciesData.evolution_chain.url,
    );
    const evolutionChainData = evolutionChainResponse.data.chain;

    const getEvolutions = (chain) => {
      const evolutions = [];
      const traverse = (node, triggerInfo = null) => {
        const currentEvolution = {
          name: node.species.name,
          trigger: triggerInfo?.trigger || null,
          min_level: triggerInfo?.min_level || null,
        };
        evolutions.push(currentEvolution);

        for (const evolution of node.evolves_to) {
          for (const detail of evolution.evolution_details) {
            const triggerData = {
              trigger: detail.trigger.name,
              min_level: detail.min_level,
            };
            traverse(evolution, triggerData);
          }
        }
      };
      traverse(chain);
      return evolutions;
    };

    const evolutionChain = getEvolutions(evolutionChainData);

    //locations
    const locationResponse = await axios.get(
      pokemonData.location_area_encounters,
    );
    const locationsData = locationResponse.data;

    //filter first gen encounters
    const filterLocations = (locationsData) => {
      const filteredLocations = locationsData
        .map((location) => {
          const versionDetails = location.version_details.filter(
            (detail) =>
              detail.version.name == "red" || detail.version.name == "blue",
          );

          if (versionDetails.length > 0) {
            return versionDetails.map((detail) => ({
              location_area: location.location_area.name,
              version: detail.version.name,
              encounter_method: detail.encounter_details.map((encounter) => ({
                method: encounter.method.name,
                min_level: encounter.min_level,
                max_level: encounter.max_level,
                chance: encounter.chance,
              })),
            }));
          }

          return null;
        })
        .filter((location) => location != null);

      return filteredLocations.flat();
    };

    const redBlueLocations = filterLocations(locationsData);

    const pokemon = {
      id: pokemonData.id,
      name: pokemonData.name,
      order: pokemonData.order,
      weight: pokemonData.weight,
      height: pokemonData.height,
      types: pokemonData.types.map((item) => item.type.name),
      abilities: pokemonData.abilities.map((item) => item.ability.name),
      habitat: speciesData.habitat?.name || "Unknown",
      sprite:
        pokemonData.sprites.versions["generation-i"]["red-blue"].front_default,
      description: flavorTextEntry.flavor_text,
      moves,
      evolution_chain: evolutionChain,
      redBlueLocations,
    };
    pokemonList.push(pokemon);
  }

  return pokemonList;
};

const setupFuse = (pokemonList) => {
  const options = {
    keys: ["name"],
    threshold: 0.3, //namen similarity
  };
  return new Fuse(pokemonList, options);
};

const startSearchInterface = (pokemonList, fuse) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = () => {
    rl.question(
      "Enter Pokémon name or ID to search (or type 'exit' to quit): ",
      (input) => {
        if (input.toLowerCase() === "exit") {
          console.log("Exiting search...");
          rl.close();
          return;
        }

        const result = pokemonList.find(
          (pokemon) =>
            pokemon.name.toLowerCase() === input.toLowerCase() ||
            pokemon.id === parseInt(input, 10),
        );

        if (result) {
          console.log(formatPokemonData(result));
        } else {
          const suggestion = fuse.search(input)?.[0]?.item?.name || null;
          if (suggestion) {
            console.log(`No exact match found. Did you mean "${suggestion}"?`);
          } else {
            console.log("No Pokémon found and no suggestions available.");
          }
        }

        askQuestion();
      },
    );
  };

  askQuestion();
};

const start = async () => {
  console.log("Fetching Pokémon data...");
  const pokemonList = await fetchData();
  console.log("Pokémon data fetched successfully!");

  const fuse = setupFuse(pokemonList);

  startSearchInterface(pokemonList, fuse);
};

start();
