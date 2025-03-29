# import os
# import json
# import requests
# from pydantic import BaseModel
# from dotenv import load_dotenv
# load_dotenv()

# # Define the output schema using Pydantic
# class ProductLookup(BaseModel):
#     upc: str
#     product_name: str


# def lookup_product_name_by_upc(upc_code: str) -> dict:


#     # Define the messages with instructions and the UPC code provided by the user.
#     messages = [
#         {
#             "role": "system",
#             "content": (
#                 "Given a UPC code, find its corresponding product name."
#                 "in a JSON object with the following structure:\n\n"
#                 '{ "upc": "<UPC_CODE>", "product_name": "<PRODUCT_NAME>" }\n\n'
#                 "If the lookup fails or no product is found, return a JSON object with an "
#                 "\"error\" key describing the issue."
#             ),
#         },
#         {"role": "user", "content": f"UPC code: {upc_code}"},
#     ]

#     # Set up the payload with the response_format using a JSON Schema.
#     payload = {
#         "model": "sonar",
#         "messages": messages,
#         "response_format": {
#             "type": "json_schema",
#             "json_schema": {"schema": ProductLookup.model_json_schema()},
#         },
#     }

#     url = "https://api.perplexity.ai/chat/completions"
#     headers = {"Authorization": f"Bearer {os.getenv('PERPLEXITY_API_KEY')}"}

#     response = requests.post(url, headers=headers, json=payload)

#     try:
#         result = response.json()
#     except json.JSONDecodeError as e:
#         return {"error": f"Invalid JSON response: {e}", "raw": response.text}

#     # Extract the assistant's message.
#     try:
#         content = result["choices"][0]["message"]["content"]
#     except (KeyError, IndexError) as e:
#         return {"error": f"Unexpected response format: {e}", "raw": result}

#     # Parse the JSON returned by the assistant.
#     try:
#         parsed_output = json.loads(content)
#     except json.JSONDecodeError as e:
#         parsed_output = {"error": f"Failed to parse JSON content: {e}", "raw": content}

#     return parsed_output


# if __name__ == "__main__":
#     # Replace with your desired UPC code
#     upc = "049000031652"
#     output = lookup_product_name_by_upc(upc)
#     print(output)
#
import requests
from bs4 import BeautifulSoup

def scrape_product_details(upc):
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

    return {"name": product_name, "image": product_image}

# Example usage
if __name__ == "__main__":
    upc_code = "049000031652"
    try:
        product_details = scrape_product_details(upc_code)
        print("Product Name:", product_details["name"])
        print("Product Image URL:", product_details["image"])
    except Exception as e:
        print("Error:", e)
