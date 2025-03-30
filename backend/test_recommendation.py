import unittest
from recommendation import get_food_recommendations, enrich_food_data
from unittest.mock import patch, MagicMock

class TestRecommendation(unittest.TestCase):
    def test_format_food_list(self):
        from recommendation import format_food_list
        
        # Sample history items
        history_items = [
            {
                "product_name": "Organic Bananas",
                "upc": "123456789012",
                "score": 90,
                "image_url": "https://example.com/banana.jpg",
                "reasoning": "Excellent source of potassium and fiber."
            },
            {
                "name": "Greek Yogurt",
                "upc": "987654321098",
                "score": 85,
                "image_url": "https://example.com/yogurt.jpg",
                "reasoning": "High in protein and probiotics."
            }
        ]
        
        formatted_list = format_food_list(history_items)
        
        # Check that each food item is included in the formatted list
        self.assertIn("Organic Bananas", formatted_list)
        self.assertIn("123456789012", formatted_list)
        self.assertIn("Greek Yogurt", formatted_list)
        self.assertIn("987654321098", formatted_list)
    
    @patch('recommendation.get_product_info')
    def test_enrich_food_data(self, mock_get_product_info):
        # Mock the API response
        mock_get_product_info.return_value = {
            "product_name": "Mocked Product",
            "ingredients_text": "Mocked ingredients",
            "nutriscore_score": 80,
            "nutriscore_grade": "A",
            "nova_group": "1",
            "allergens": ""
        }
        
        # Sample history items without names
        history_items = [
            {
                "upc": "123456789012",
                "score": 90,
                "image_url": "https://example.com/product.jpg",
                "reasoning": "Some reasoning"
            }
        ]
        
        enriched_items = enrich_food_data(history_items)
        
        # Check that the product name was added
        self.assertEqual(enriched_items[0]["name"], "Mocked Product")
        mock_get_product_info.assert_called_once_with("123456789012")
    
    @patch('recommendation.structured_model.invoke')
    def test_get_food_recommendations(self, mock_invoke):
        # Mock the LLM response
        mock_recommendations = MagicMock()
        mock_recommendations.recommendations = [
            MagicMock(
                score=95,
                reasoning="Good choice for this patient.",
                food_name="Organic Bananas",
                image_url="https://example.com/banana.jpg",
                upc="123456789012"
            )
        ]
        mock_invoke.return_value = mock_recommendations
        
        # Sample user info
        user_info = {
            "email": "test@example.com",
            "height": 175.0,
            "weight": 70.0,
            "age": 30,
            "physical_activity": "Regular exercise",
            "gender": "Male",
            "comorbidities": [],
            "preferences": "Vegetarian"
        }
        
        # Sample history items
        history_items = [
            {
                "product_name": "Organic Bananas",
                "upc": "123456789012",
                "score": 90,
                "image_url": "https://example.com/banana.jpg",
                "reasoning": "Good source of potassium."
            }
        ]
        
        result = get_food_recommendations(user_info, history_items)
        
        # Check that the LLM was called
        mock_invoke.assert_called_once()
        
        # Check that the result has the right structure
        self.assertEqual(len(result.recommendations), 1)
        self.assertEqual(result.recommendations[0].food_name, "Organic Bananas")

if __name__ == '__main__':
    unittest.main() 