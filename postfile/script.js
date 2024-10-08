let url = "https://crudcrud.com/api/02eb4aa0e46f43a2b228ef9613b4180e/users";
function submitForm() {
  let params = new FormData(document.getElementById("input-form"));
  let jsonBody = JSON.stringify(Object.fromEntries(params));
  console.log(jsonBody);
  fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: jsonBody,
  })
    .then((response) => {
      if (!response.ok) {
        throw Error("Error in request: " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("Error: ", error);
    });
}
document.getElementById("input-form").addEventListener("submit", function (e) {
  e.preventDefault();
  submitForm();
});
