try {
    await fetch('https://fakerestapi.azurewebsites.net/api/v1/Activities')
    .then(response => response.json())
    .then(json => console.log(json))
    
} catch (error) {
    console.log(error)
}
