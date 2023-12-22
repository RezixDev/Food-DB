import pool from './database';

export async function getAllData() {
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
