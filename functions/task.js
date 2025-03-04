const logger = require("firebase-functions/logger");

const { addCars } = require("./fire");

const QUERY_LIMIT = 50;
const INITIAL_OFFSET = 0;
const MIN_YEAR = 2019;

const POST_FILTERS = [
  ({ price }) => price <= 62000000,
  ({ attributes }) => {
    const year = attributes.find(({ id }) => id === "VEHICLE_YEAR");
    if (!year) return true;
    return +year.value_name >= MIN_YEAR;
  },
];

const applyPostFilters = (results) => {
  let filteredResults = results;

  POST_FILTERS.forEach((filter) => {
    filteredResults = filteredResults.filter(filter);
  });

  return filteredResults;
};

const getCars = async (offset = 0) => {
  logger.info("getCars() offset: ", offset);
  const meliAPIUrl = "https://api.mercadolibre.com/sites/MCO/search";

  const url = new URL(meliAPIUrl);
  url.searchParams.append("category", "MCO1744");
  url.searchParams.append("sort", "date_desc");
  url.searchParams.append("limit", `${QUERY_LIMIT}`);
  url.searchParams.append("price", "4.5E7-9.0E7");
  url.searchParams.append("since", "today");
  url.searchParams.append("KILOMETERS", "[0.001km-35000km]");
  url.searchParams.append("state", "TUNPUEJPR1gxMDljZA");
  url.searchParams.append("VEHICLE_YEAR", "[0.001km-35000km]");

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
  logger.info("total: ", total);

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

  logger.info("fullResult: ", fullResult.length);

  return fullResult;

  //   return applyPostFilters(results);
};

const start = async () => {
  logger.info("====================================");

  logger.info("====CARCOSA HAS BEEN TICK ============");

  logger.info(`====AT ${new Date().toISOString()} ===========`);

  try {
    const result = await getFullResults();
    const filteredResults = applyPostFilters(result);

    logger.info("PRE FIRE");
    await addCars(filteredResults);

    logger.info("POST FIRE:", filteredResults.length);
    logger.info("====CARCOSA HAS BEEN TACK ============");
  } catch (error) {
    logger.error("AN ERROR FATAL");

    logger.error(error);
  }
};
// start();
module.exports = { start };

// cron.schedule("*/10 * * * * *", init);
