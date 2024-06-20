import requests


end_point = "https://yfy.ideaxpress.biz/api"
companyCategoryUuid = ""
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiYjViOWIxYy05YmNjLTQwZWYtODViNS04Mzc2MWU2OWYwYjYiLCJpYXQiOjE3MTg4NjA4MzUsImV4cCI6MTcxODk0NzIzNX0.pG1mgcmL2Kx2LWUopwze7DTnIhM8cECxfxVAaCsI8Go"
url = f"{end_point}auth/categorySetting/:{companyCategoryUuid}"


response = requests.get(url)

if response.status_code == 200:

    result = response.json()
    data = result['data']
    service = data['service']
    startDate = data['startDate']
    endDate = data['endDate']
    isEnable = data['isEnable']
    
