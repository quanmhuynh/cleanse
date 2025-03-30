from openfoodfacts import API, APIVersion, Country, Environment, Flavor

def get_product_info(upc_code: str):
    """
    Given a UPC code, fetch product data from Open Food Facts and print key details:
        - Ingredients text
        - Nutriments (as simple formatted text)
        - Nutriscore Score
        - Nutriscore Grade
        - Nova Group
        - Allergens

    If the product is not found, a message is displayed.
    """

    # Instantiate the API object
    api = API(
        user_agent="MyFoodApp",
        country=Country.world,
        flavor=Flavor.off,
        version=APIVersion.v2,
        environment=Environment.org,
    )

    # Retrieve product details using the UPC code
    result = api.product.get(upc_code, fields=["ingredients_text", "nutriscore_score", "nutriscore_grade", "nova_group", "allergens-"])
    # print(result)

    return result

# Example usage:
if __name__ == "__main__":
    upc_code = input("Enter the UPC code: ").strip()
    print(get_product_info(upc_code))
