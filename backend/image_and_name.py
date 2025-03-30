
import requests
from bs4 import BeautifulSoup

def scrape_image(upc):
    """
    Given a UPC code, scrape the Go-UPC search results page for the product name
    and product image URL.

    Parameters:
        upc (str): The UPC code to search for.

    Returns:
        dict: A dictionary containing the product name under the "name" key and the
              product image URL under the "image" key.
    """
    # Construct the URL with the provided UPC
    url = f"https://go-upc.com/search?q={upc}"

    # Fetch the page content
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch URL ({url}). Status code: {response.status_code}")

    # Parse the HTML with BeautifulSoup
    soup = BeautifulSoup(response.text, "html.parser")

    # Locate the product name; it is in a <h1> with class "product-name"
    product_name_tag = soup.find("h1", class_="product-name")
    if not product_name_tag:
        raise Exception("Could not find the product name on the page.")
    product_name = product_name_tag.get_text(strip=True)

    # Locate the product image; first try the non-mobile version, then mobile
    image_figure = soup.find("figure", class_="product-image non-mobile")
    if not image_figure:
        image_figure = soup.find("figure", class_="product-image mobile")
    if not image_figure:
        raise Exception("Could not find the product image on the page.")

    image_tag = image_figure.find("img")
    if not image_tag or not image_tag.get("src"):
        raise Exception("Product image source not found.")
    product_image = image_tag["src"]  # This should be the full image URL
    print(product_image)
    return product_image

# Example usage
if __name__ == "__main__":
    upc_code = "049000031652"
    try:
        product_details = scrape_product_details(upc_code)
        print("Product Name:", product_details["name"])
        print("Product Image URL:", product_details["image"])
    except Exception as e:
        print("Error:", e)
