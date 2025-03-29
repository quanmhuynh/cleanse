import requests

url = "https://dietagram.p.rapidapi.com/apiBarcode.php"

querystring = {"name":"028400084917"}

headers = {
	"x-rapidapi-key": "da870b61c1msh27d95ec901b2b29p1d0ab8jsn9d7657320085",
	"x-rapidapi-host": "dietagram.p.rapidapi.com"
}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())
