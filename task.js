const cron = require("node-cron");
const get = require("lodash.get");

const { addCars } = require("./fire");

const QUERY_LIMIT = 50;
const INITIAL_OFFSET = 0;

const POST_FILTERS = [
  ({ price }) => price <= 62000000,
  //   ({ attributes }) => {
  //     const kilometers = attributes.find(({ id }) => id === "KILOMETERS");
  //     if (!kilometers) return true;
  //     return kilometers.value_struct.number <= 100000;
  //   },
];

const applyPostFilters = (results) => {
  let filteredResults = results;

  POST_FILTERS.forEach((filter) => {
    filteredResults = filteredResults.filter(filter);
  });

  return filteredResults;
};

const getCars = async (offset = 0) => {
  console.log("getCars() offset: ", offset);
  const meliAPIUrl = "https://api.mercadolibre.com/sites/MCO/search";

  const url = new URL(meliAPIUrl);
  url.searchParams.append("category", "MCO1744");
  url.searchParams.append("sort", "date_desc");
  url.searchParams.append("limit", `${QUERY_LIMIT}`);
  url.searchParams.append("price", "4.5E7-9.0E7");
  url.searchParams.append("since", "today");
  url.searchParams.append("KILOMETERS", "[0.001km-35000km]");

  url.searchParams.append("offset", `${offset}`);

  return await fetch(url)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error:", error);
    });

  //   const url =
  //     "https://api.mercadolibre.com/sites/MCO/search?category=MCO1744&sort=date_desc&limit=50&price=4.5E7-9.0E7&since=today";
};

const getFullResults = async () => {
  const { paging, results } = await getCars(INITIAL_OFFSET);

  const { total } = paging;
  console.log("total: ", total);

  const totalPages = Math.ceil(total / QUERY_LIMIT);

  const pagePromises = Array.from({ length: totalPages - 1 }).map(
    (_, page) =>
      new Promise((resolve) => {
        resolve(getCars(QUERY_LIMIT * (page + 1)));
      })
  );

  const resolvedResults = (await Promise.all(pagePromises))
    .map((response) => response.results)
    .flat();

  const fullResult = [...results, ...resolvedResults];

  console.log("fullResult: ", fullResult.length);

  return fullResult;

  //   return applyPostFilters(results);
};

const init = async () => {
  console.log("====================================");
  console.log("====CARCOSA HAS BEEN TICK ============");
  console.log(`====AT ${new Date().toISOString()} ===========`);

  try {
    const result = await getFullResults();
    const filteredResults = applyPostFilters(result);

    console.log("PRE FIRE");
    await addCars(filteredResults);
    console.log("POST FIRE");
  } catch (error) {
    console.log("AN ERROR FATAL");

    console.error(error);
  }
};
init();
// cron.schedule("*/10 * * * * *", init);
