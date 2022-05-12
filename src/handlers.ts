import { FastifyRequest, FastifyReply } from "fastify";
import { PokemonWithStats } from "models/PokemonWithStats";
import * as https from "https";
import * as http from "http";
import { getContent } from "Utils";

const BASE_URL = "pokeapi.co";

export async function getPokemonByName(
  request: FastifyRequest,
  reply: FastifyReply
) {
  var name: string = request.params["name"];
  reply.header("Content-Type", "application/json; charset=utf-8");

  const keepAliveAgent = new https.Agent({ keepAlive: true });

  var options = {
    agent: keepAliveAgent,
    hostname: BASE_URL,
    path: `/api/v2/pokemon/${name}`,
  };

  var poke: PokemonWithStats = undefined;

  try {
    let data = await getContent(options);
    poke = JSON.parse(data);

    await computeResponse(poke, reply);
    reply.code(200).send(poke);
  } catch (error) {
    console.log(error);
    reply.code(400).send("Something is wrong");
  }
  return reply;
}
/**
 *
 * Hey, I'm sorry but I really don't get what purpose does this function serve
 *
 * the last loops don't make sens because the Pokemon types don't have stats
 * so I changed the api calls before to get the stats instead of the types.
 * And I tried to keep the same code structure ( avg...)
 *
 * I know I could have reached out and asked but I'm doing this test last minute just before the duration ends so ... Sorry
 *
 *
 */
export const computeResponse = async (
  response: PokemonWithStats,
  reply: FastifyReply
) => {
  const resp: PokemonWithStats = response;

  const keepAliveAgent = new https.Agent({ keepAlive: true });
  var options = {
    agent: keepAliveAgent,
    hostname: BASE_URL,
  };
  let stats = resp.stats.map(({ stat }) => stat.name);
  let pokemonStats = [];

  await Promise.all(
    stats.map(async (type) => {
      // change the path for each stat
      options["path"] = `/api/v2/stat/${type}`;
      try {
        const res = await getContent(options);
        pokemonStats.push(JSON.parse(res));
      } catch (error) {
        console.log(error);
      }
    })
  );
  if (pokemonStats == undefined) throw pokemonStats;

  var statistics = [];
  response.stats.forEach((element) => {
    pokemonStats.forEach((pok) => {
      pok.name == element.stat.name && statistics.push(element.base_stat);
      let sum = statistics.reduce((a, b) => a + b, 0);
      element.averageStat = sum / statistics.length || 0;
    });
  });
};
