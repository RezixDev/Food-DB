import pool from './database';

export async function insertFoodData(jsonData: any) {
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    throw new Error('Invalid input: jsonData should be a non-empty array.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const item of jsonData) {
      const foodRes = await client.query(
        'INSERT INTO Food (name, category, description, serving_size, calories, glycemic_index, organic, allergens, environmental_impact, image_reference, cultural_significance) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING food_id',
        [
          item.name,
          item.category,
          item.description || '',
          item.servingSize,
          item.calories,
          item.glycemic_index,
          item.organic,
          item.allergens,
          item.environmental_impact,
          item.image_reference,
          item.cultural_significance,
        ]
      );
      const foodId = foodRes.rows[0].food_id;

      // Inserting varieties, storageTips, usageTips, healthBenefits, and commonUses as separate entries
      // These require additional tables or a different schema design

      // Varieties
      for (const variety of item.varieties) {
        await client.query(
          'INSERT INTO FoodVarieties (food_id, variety) VALUES ($1, $2)',
          [foodId, variety]
        );
      }

      // Storage Tips
      for (const tip of item.storageTips) {
        await client.query(
          'INSERT INTO StorageTips (food_id, tip) VALUES ($1, $2)',
          [foodId, tip]
        );
      }

      // Usage Tips
      for (const tip of item.usageTips) {
        await client.query(
          'INSERT INTO UsageTips (food_id, tip) VALUES ($1, $2)',
          [foodId, tip]
        );
      }

      // Common Uses
      for (const use of item.commonUses) {
        await client.query(
          'INSERT INTO CommonUses (food_id, use) VALUES ($1, $2)',
          [foodId, use]
        );
      }

      for (const pairing of item.pairings) {
        await client.query(
          'INSERT INTO Pairings (food_id, pairing) VALUES ($1, $2)',
          [foodId, pairing]
        );
      }

      // Insert Seasonality
      for (const season of item.seasonality) {
        await client.query(
          'INSERT INTO Seasonality (food_id, season) VALUES ($1, $2)',
          [foodId, season]
        );
      }

      // Insert History
      if (item.history) {
        await client.query(
          'INSERT INTO History (food_id, history) VALUES ($1, $2)',
          [foodId, item.history]
        );
      }

      // Insert Pesticides Information
      if (item.pesticides) {
        await client.query(
          'INSERT INTO Pesticides (food_id, information) VALUES ($1, $2)',
          [foodId, item.pesticides]
        );
      }

      // Insert Botanical Information
      if (item.botanicalInformation) {
        await client.query(
          'INSERT INTO botanical_information (food_id, family, genus, species) VALUES ($1, $2, $3, $4)',
          [
            foodId,
            item.botanicalInformation.family,
            item.botanicalInformation.genus,
            item.botanicalInformation.species,
          ]
        );
      }

      // Insert into Nutrient and FoodNutrient
      for (const nutrient of item.nutrients) {
        let nutrientId;

        // Check if nutrient exists
        const nutrientCheck = await client.query(
          'SELECT nutrient_id FROM Nutrient WHERE name = $1',
          [nutrient.name]
        );
        if (nutrientCheck.rowCount === 0) {
          // Insert new nutrient
          const nutrientRes = await client.query(
            'INSERT INTO Nutrient (name, unit) VALUES ($1, $2) RETURNING nutrient_id',
            [nutrient.name, nutrient.unit]
          );
          nutrientId = nutrientRes.rows[0].nutrient_id;
        } else {
          nutrientId = nutrientCheck.rows[0].nutrient_id;
        }

        // Insert into FoodNutrient
        await client.query(
          'INSERT INTO FoodNutrient (food_id, nutrient_id, amount) VALUES ($1, $2, $3)',
          [foodId, nutrientId, nutrient.amount]
        );
      }

      // Insert into HealthBenefits
      if (item.healthBenefits) {
        for (const benefit of item.healthBenefits) {
          await client.query(
            'INSERT INTO HealthBenefits (food_id, benefit) VALUES ($1, $2)',
            [foodId, benefit]
          );
        }
      }
    }

    await client.query('COMMIT');
    client.release();
    return { message: 'Data processed successfully' };
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error(err);
    throw err;
  }
}

export async function deleteFoodData(food_id: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete from HealthBenefits where food_id matches
    await client.query('DELETE FROM HealthBenefits WHERE food_id = $1', [
      food_id,
    ]);

    // Delete from FoodNutrient where food_id matches
    await client.query('DELETE FROM FoodNutrient WHERE food_id = $1', [
      food_id,
    ]);

    // Delete from Food where food_id matches
    await client.query('DELETE FROM Food WHERE food_id = $1', [food_id]);

    await client.query('COMMIT');
    client.release();
    return { message: 'Food item deleted successfully' };
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error(err);
    throw err;
  }
}
