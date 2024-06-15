import pool from './database';

export async function getAllData2() {
  const query = `
  SELECT 
  F.food_id, 
  F.name AS food_name, 
  F.category, 
  F.description, 
  F.serving_size, 
  F.calories,
  F.glycemic_index,
  F.organic,
  F.allergens,
  F.environmental_impact,
  F.image_reference,
  F.cultural_significance,
  array_agg(DISTINCT V.variety) FILTER (WHERE V.variety IS NOT NULL) AS varieties,
  array_agg(DISTINCT ST.tip) FILTER (WHERE ST.tip IS NOT NULL) AS storage_tips,
  array_agg(DISTINCT UT.tip) FILTER (WHERE UT.tip IS NOT NULL) AS usage_tips,
  array_agg(DISTINCT CU.use) FILTER (WHERE CU.use IS NOT NULL) AS common_uses,
  array_agg(DISTINCT HB.benefit) FILTER (WHERE HB.benefit IS NOT NULL) AS health_benefits,
  json_agg(DISTINCT jsonb_build_object('nutrient_name', N.name, 'amount', FN.amount, 'unit', N.unit)) FILTER (WHERE N.name IS NOT NULL) AS nutrients,
  array_agg(DISTINCT P.pairing) FILTER (WHERE P.pairing IS NOT NULL) AS pairings,
  array_agg(DISTINCT S.season) FILTER (WHERE S.season IS NOT NULL) AS seasonality,
  array_agg(DISTINCT H.history) FILTER (WHERE H.history IS NOT NULL) AS history,
  array_agg(DISTINCT PD.information) FILTER (WHERE PD.information IS NOT NULL) AS pesticides_info,
  json_agg(DISTINCT jsonb_build_object('family', BI.family, 'genus', BI.genus, 'species', BI.species)) FILTER (WHERE BI.family IS NOT NULL OR BI.genus IS NOT NULL OR BI.species IS NOT NULL) AS botanical_information
FROM Food F
LEFT JOIN FoodNutrient FN ON F.food_id = FN.food_id
LEFT JOIN Nutrient N ON FN.nutrient_id = N.nutrient_id
LEFT JOIN FoodVarieties V ON F.food_id = V.food_id
LEFT JOIN StorageTips ST ON F.food_id = ST.food_id
LEFT JOIN UsageTips UT ON F.food_id = UT.food_id
LEFT JOIN CommonUses CU ON F.food_id = CU.food_id
LEFT JOIN HealthBenefits HB ON F.food_id = HB.food_id
LEFT JOIN Pairings P ON F.food_id = P.food_id
LEFT JOIN Seasonality S ON F.food_id = S.food_id
LEFT JOIN History H ON F.food_id = H.food_id
LEFT JOIN Pesticides PD ON F.food_id = PD.food_id
LEFT JOIN BotanicalInformation BI ON F.food_id = BI.food_id
GROUP BY F.food_id
ORDER BY F.food_id;

  `;

  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getAllData() {
  try {
    const foodDetails = await fetchFoodDetails();

    const detailedFoodData = await Promise.all(
      foodDetails.map(async (food) => {
        const [
          nutrients,
          usageTips,
          commonUses,
          varieties,
          healthBenefits,
          storageTips,
          pairings,
          seasonality,
          history,
          pesticidesInfo,
          botanicalInfo,
        ] = await Promise.all([
          fetchFoodNutrients(food.food_id),
          fetchUsageTips(food.food_id),
          fetchCommonUses(food.food_id),
          fetchVarieties(food.food_id),
          fetchHealthBenefits(food.food_id),
          fetchStorageTips(food.food_id),
          fetchPairings(food.food_id),
          fetchSeasonality(food.food_id),
          fetchHistory(food.food_id),
          fetchPesticidesInfo(food.food_id),
          fetchBotanicalInformation(food.food_id),
        ]);

        return {
          ...food,
          nutrients,
          varieties,
          usageTips,
          commonUses,
          healthBenefits,
          storageTips,
          pairings,
          seasonality,
          history,
          pesticidesInfo,
          botanicalInfo,
        };
      })
    );

    return detailedFoodData;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Fetches basic details for all food items.
 * @returns {Promise<any[]>} - A promise that resolves to an array of food item details.
 */
async function fetchFoodDetails(): Promise<any[]> {
  const query = `
      SELECT 
          food_id,
          name,
          category,
          description,
          serving_size,
          calories,
          glycemic_index
          organic,
          allergens
          enviromental_impact,
          image_reference,
          cultural_significance
      FROM Food;
  `;

  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (err) {
    console.error('Error fetching food details:', err);
    throw err;
  }
}

/**
 * Fetches nutritional information for a specific food item.
 * @param {number} foodId - The ID of the food item.
 * @returns {Promise<any[]>} - A promise that resolves to an array of nutrient data.
 */
async function fetchFoodNutrients(foodId: number): Promise<any[]> {
  const query = `
        SELECT 
            N.nutrient_id,
            N.name AS nutrient_name,
            FN.amount,
            N.unit
        FROM FoodNutrient FN
        INNER JOIN Nutrient N ON FN.nutrient_id = N.nutrient_id
        WHERE FN.food_id = $1;
    `;

  try {
    const { rows } = await pool.query(query, [foodId]);
    return rows;
  } catch (err) {
    console.error('Error fetching food nutrients:', err);
    throw err;
  }
}

/**
 * Fetches usage tips for a specific food item.
 * @param {number} foodId - The ID of the food item.
 * @returns {Promise<string[]>} - A promise that resolves to an array of usage tips.
 */
async function fetchUsageTips(foodId: number): Promise<string[]> {
  const query = `
      SELECT tip
      FROM usagetips
      WHERE food_id = $1;
  `;

  try {
    const { rows } = await pool.query(query, [foodId]);
    return rows.map((row) => row.tip);
  } catch (err) {
    console.error('Error fetching usage tips:', err);
    throw err;
  }
}

/**
 * Fetches common uses for a specific food item.
 * @param {number} foodId - The ID of the food item.
 * @returns {Promise<string[]>} - A promise that resolves to an array of common uses.
 */
async function fetchCommonUses(foodId: number): Promise<string[]> {
  const query = `
      SELECT use
      FROM CommonUses
      WHERE food_id = $1;
  `;

  try {
    const { rows } = await pool.query(query, [foodId]);
    return rows.map((row) => row.use);
  } catch (err) {
    console.error('Error fetching common uses:', err);
    throw err;
  }
}

/**
 * Fetches varieties for a specific food item.
 * @param {number} foodId - The ID of the food item.
 * @returns {Promise<string[]>} - A promise that resolves to an array of varieties.
 */
async function fetchVarieties(foodId: number): Promise<string[]> {
  const query = `
      SELECT variety
      FROM FoodVarieties
      WHERE food_id = $1;
  `;

  try {
    const { rows } = await pool.query(query, [foodId]);
    return rows.map((row) => row.variety);
  } catch (err) {
    console.error('Error fetching food varieties:', err);
    throw err;
  }
}

/**
 * Fetches health benefits for a specific food item.
 * @param {number} foodId - The ID of the food item.
 * @returns {Promise<string[]>} - A promise that resolves to an array of health benefits.
 */
async function fetchHealthBenefits(foodId: number): Promise<string[]> {
  const query = `
      SELECT benefit
      FROM HealthBenefits
      WHERE food_id = $1;
  `;

  try {
    const { rows } = await pool.query(query, [foodId]);
    return rows.map((row) => row.benefit);
  } catch (err) {
    console.error('Error fetching health benefits:', err);
    throw err;
  }
}

/**
 * Fetches storage tips for a specific food item.
 * @param {number} foodId - The ID of the food item.
 * @returns {Promise<string[]>} - A promise that resolves to an array of storage tips.
 */
async function fetchStorageTips(foodId: number): Promise<string[]> {
  const query = `
      SELECT tip
      FROM StorageTips
      WHERE food_id = $1;
  `;

  try {
    const { rows } = await pool.query(query, [foodId]);
    return rows.map((row) => row.tip);
  } catch (err) {
    console.error('Error fetching storage tips:', err);
    throw err;
  }
}

/**
 * Fetches food pairings for a specific food item.
 * @param {number} foodId - The ID of the food item.
 * @returns {Promise<string[]>} - A promise that resolves to an array of food pairings.
 */
async function fetchPairings(foodId: number): Promise<string[]> {
  const query = `
      SELECT pairing
      FROM Pairings
      WHERE food_id = $1;
  `;

  try {
    const { rows } = await pool.query(query, [foodId]);
    return rows.map((row) => row.pairing);
  } catch (err) {
    console.error('Error fetching food pairings:', err);
    throw err;
  }
}

/**
 * Fetches seasonality information for a specific food item.
 * @param {number} foodId - The ID of the food item.
 * @returns {Promise<string[]>} - A promise that resolves to an array of seasons.
 */
async function fetchSeasonality(foodId: number): Promise<string[]> {
  const query = `
      SELECT season
      FROM Seasonality
      WHERE food_id = $1;
  `;

  try {
    const { rows } = await pool.query(query, [foodId]);
    return rows.map((row) => row.season);
  } catch (err) {
    console.error('Error fetching seasonality information:', err);
    throw err;
  }
}

/**
 * Fetches historical information for a specific food item.
 * @param {number} foodId - The ID of the food item.
 * @returns {Promise<string>} - A promise that resolves to a string containing the history.
 */
async function fetchHistory(foodId: number): Promise<string> {
  const query = `
      SELECT history
      FROM History
      WHERE food_id = $1;
  `;

  try {
    const { rows } = await pool.query(query, [foodId]);
    // Assuming that each food item has a single, possibly long, history entry
    return rows.length > 0 ? rows[0].history : null;
  } catch (err) {
    console.error('Error fetching history:', err);
    throw err;
  }
}

export async function getBasicFoodInfo() {
  const query = `
        SELECT
        food_id,
        name AS food_name,
        category,
        description,
        serving_size,
        calories,
        glycemic_index,
        organic,
        allergens,
        environmental_impact,
        image_reference,
        cultural_significance
      FROM Food;
  `;

  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Fetches information about pesticides used on a specific food item.
 * @param {number} foodId - The ID of the food item.
 * @returns {Promise<string>} - A promise that resolves to a string containing pesticide information.
 */
async function fetchPesticidesInfo(foodId: number): Promise<string> {
  const query = `
      SELECT information
      FROM Pesticides
      WHERE food_id = $1;
  `;

  try {
    const { rows } = await pool.query(query, [foodId]);
    // Assuming each food item has a single entry for pesticide information
    return rows.length > 0 ? rows[0].information : null;
  } catch (err) {
    console.error('Error fetching pesticides information:', err);
    throw err;
  }
}

/**
 * Fetches botanical information for a specific food item.
 * @param {number} foodId - The ID of the food item.
 * @returns {Promise<any>} - A promise that resolves to an object containing botanical information.
 */
async function fetchBotanicalInformation(foodId: number): Promise<any> {
  const query = `
      SELECT family, genus, species
      FROM botanicalInformation
      WHERE food_id = $1;
  `;

  try {
    const { rows } = await pool.query(query, [foodId]);
    // Assuming each food item has a single entry for botanical information
    return rows.length > 0 ? rows[0] : {};
  } catch (err) {
    console.error('Error fetching botanical information:', err);
    throw err;
  }
}

export async function getNutrientFoodInfo() {
  const query = `
          SELECT
          N.name AS nutrient_name,
          FN.amount,
          N.unit
          FROM FoodNutrient FN
          JOIN Nutrient N ON FN.nutrient_id = N.nutrient_id
          WHERE FN.food_id = $1;
  `;

  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
